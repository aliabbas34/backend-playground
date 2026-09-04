import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/not-found-error.js";

export function notFoundRouteHandler(req: Request, res: Response, next: NextFunction): void {
    req.log.debug(`404 Not Found: ${req.method} request on ${req.url}`);
    return next(new NotFoundError("Route not found"));
}