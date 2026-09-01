import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

interface RequestValidationSchema {
    body?: ZodObject;
    query?: ZodObject;
    params?: ZodObject;
}

export class ValidationError extends Error {
    public readonly statusCode = 400;
    public readonly errors: Record<string, string[]>;

    constructor(zodError: ZodError) {
        super("Validation Error");
        this.errors = zodError.flatten().fieldErrors as Record<string, string[]>;
    }
}

export const validate = (schema: RequestValidationSchema) =>{
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if(schema.query) {
                req.query = await schema.query.parseAsync(req.query) as Record<string, string[]>; //temporary fix, read more about it.
            }
            if(schema.params) {
                req.params = await schema.params.parseAsync(req.params) as Record<string, string>; // temporary fix, read more about it.
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