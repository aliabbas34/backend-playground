import {Request, Response, NextFunction} from "express";
import { randomUUID } from "crypto";

declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}

// Does this require a try catch handler to propogate unexpected errors to error handler?

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const headerId = req.headers['x-request-id'];
    const requestId = headerId && (Array.isArray(headerId) ? headerId[0] : headerId) || randomUUID();
    req.id = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
}