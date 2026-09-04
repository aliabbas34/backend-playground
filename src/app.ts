import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { envConfig } from "./config/env.js";
import { logger } from "./logger/logger.js";
import {pinoHttp} from "pino-http";
import healthRouter from "./modules/health/health.routes.js";
import { ValidationError } from "./middlewares/validate.js";
import {requestIdMiddleware} from "./middlewares/requestId.js";
import authRouter from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundRouteHandler } from "./middlewares/notFound.js";

const app = express();

app.use(requestIdMiddleware);

// const pinoHttp = pinoHttpImport as unknown as typeof pinoHttpImport.default;
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
app.use("/api/v1/auth", authRouter)

app.get("/", (req: Request, res: Response) => {
    req.log.info("Received a GET request on /");
    res.send("Hello, World!");
});

// fallback 404 handler.
app.use(notFoundRouteHandler);

// error handler
app.use(errorHandler);

export default app;

