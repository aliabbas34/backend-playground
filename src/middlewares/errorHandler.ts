import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { ValidationError } from "./validate.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { logger } from "../logger/logger.js";
import { envConfig } from "../config/env.js";

export function errorHandler (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
):Response {
    if(err.name === "TokenExpiredError") {
        err = new UnauthorizedError("Token expired");
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const errorCode = err instanceof AppError ? err.errorCode : "INTERNAL_SERVER_ERROR";
    const logData = {
        requestId: req.requestId,
        route: req.route?.path ?? req.path,
        method: req.method,
        stack: envConfig.NODE_ENV === "development" ? err.stack : undefined,
        errorCode,
        statusCode,
        errorMessage: err instanceof AppError ? err.message : "Unhandled exception",
    }

    if(err instanceof ValidationError) {
        logger.warn(logData, "Request validation error");
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            details: err.errors,
        });
    }
    
    if(err instanceof AppError && err.isOperational){
        logger.warn(logData, "Identified app error");
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
        });
    }

    logger.error(logData, "Unexpected error");

    return res.status(500).json({
        success: false,
        message: "An unexpected internal server error occured",
        errorCode: "INTERNAL_SERVER_ERROR",
    });
}