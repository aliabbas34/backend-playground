import { NextFunction, Request, Response } from "express";


export function logRequests(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();
    res.once("finish", ()=> {
        const duration = Date.now() - startedAt;
        const logMethod = res.statusCode >= 500
            ? "error"
            : res.statusCode >= 400
                ? "warn"
                : "info";
        req.log[logMethod]({
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