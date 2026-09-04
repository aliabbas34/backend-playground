import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { ValidationError } from "./validate.js";

export function errorHandler (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
):Response {
    if(err instanceof ValidationError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
            details: err.errors,
        });
    }
    if(err instanceof AppError && err.isOperational){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode,
        });
    }

    req.log.error({err}, "Unhandled exception!");
    return res.status(500).json({
        success: false,
        message: "An unexpected internal server error occured",
        errorCode: "INTERNAL_SERVER_ERROR",
    });
}