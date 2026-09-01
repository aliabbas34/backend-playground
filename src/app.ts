import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { envConfig } from "./config/env";
import { logger } from "./logger/logger";
import pinoHttp from "pino-http";
import healthRouter from "./modules/health/health.routes";
import { ValidationError } from "./middlewares/validate";
import {requestIdMiddleware} from "./middlewares/requestId";

const app = express();

app.use(requestIdMiddleware);
app.use(pinoHttp({
    logger,
    customSuccessMessage: (req, res) => `${req.method} request on ${req.url} completed with status ${res.statusCode}`,
    customLogLevel: (req, res, err) => {
        if(res.statusCode >= 500 || err) return 'error';
        if(res.statusCode >= 400) return 'warn';
        return 'info';
    },
    genReqId: (req) => req.id,
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.set-cookie'],
}));

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(compression());

app.use("/api/v1/health", healthRouter);

app.get("/", (req: Request, res: Response) => {
    req.log.info("Received a GET request on /");
    res.send("Hello, World!");
});

// fallback 404 handler.
app.use((req: Request, res: Response) => {
    req.log.warn(`404 Not Found: ${req.method} request on ${req.url}`);
    res.status(404).send("404 Not Found");
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ValidationError) {
        req.log.warn({errors: err.errors}, "Request validation failed");
        res.status(err.statusCode).json({
            error: err.message,
            details: err.errors,
        });
        return;
    }
    req.log.error(
        {
            err: {
                message: err.message,
                stack: err.stack,
                name: err.name,
            }
        },
        `Unhandled error: ${err.message}`
    );
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        error: envConfig.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    });
});

export default app;

