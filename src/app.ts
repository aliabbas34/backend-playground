import express, { Request, Response } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./logger/logger.js";
import {pinoHttp} from "pino-http";
import healthRouter from "./modules/health/health.routes.js";
import {requestIdMiddleware} from "./middlewares/requestId.js";
import authRouter from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundRouteHandler } from "./middlewares/notFound.js";
import adminRouter from "./modules/admin/admin.routes.js";
import userRouter from "./modules/user/user.routes.js";
import { logRequests } from "./middlewares/requestLogger.js";

const app = express();

app.use(requestIdMiddleware);

app.use(pinoHttp({
    logger,
    genReqId: (req) => req.id,
    autoLogging: false,
}));
app.use(logRequests);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(compression());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req: Request, res: Response) => {
    req.log.info("Received a GET request on /");
    res.send("Hello, World!");
});

// fallback 404 handler.
app.use(notFoundRouteHandler);

// error handler
app.use(errorHandler);

export default app;

