import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { BadRequestError } from "../errors/bad-request-error.js";

interface RequestValidationSchema {
    body?: ZodObject;
    query?: ZodObject;
    params?: ZodObject;
}
declare global {
    namespace Express {
        interface Request {
            validated?: {
                body?: unknown;
                query?: unknown;
                params?: unknown;
            }
        }
    }
}
export class ValidationError extends BadRequestError {
    public readonly errors: Record<string, string[]>;

    constructor(zodError: ZodError) {
        super("Validation Error", "VALIDATION_ERROR");
        this.errors = zodError.flatten().fieldErrors as Record<string, string[]>;
    }
}

export const validate = (schema: RequestValidationSchema) =>{
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.validated=req.validated ?? {};
            if(schema.body) {
                req.validated.body = await schema.body.parseAsync(req.body);
            }
            if(schema.query) {
                req.validated.query = await schema.query.parseAsync(req.query);
            }
            if(schema.params) {
                req.validated.params = await schema.params.parseAsync(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(new ValidationError(error));
            } else {
                next(error);
            }
        }
    }
}