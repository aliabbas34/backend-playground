import { NextFunction, Request, Response } from "express";
import { logger } from "../logger/logger.js";
import { startTime } from "pino-http";


export function logRequests(req: Request, res: Response, next: NextFunction): void {
    res.once("finish", ()=> {
        const duration = Date.now() - res[startTime];

        logger.info({
            method: req.method,
            path: req.path,
            requestId: req.id,
            userId: req.user?.userId,
            duration,
            statusCode: res.statusCode,
        }, "Request completed");
    });
    next();
}