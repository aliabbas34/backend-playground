// Study about some concepts in this file.

export abstract class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public override readonly message: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.message = message;
        this.errorCode = errorCode;

        //Restore correct prototype chain for built-in error extension in typescript.
        Object.setPrototypeOf(this, new.target.prototype);

        // capture clean stack trace omitting constructor call.
        Error.captureStackTrace(this, this.constructor);
    }
}