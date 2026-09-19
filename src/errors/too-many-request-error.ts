import { AppError } from "./app-error.js";

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests', errorCode = 'TOO_MANY_REQUESTS') {
        super(message, 429, errorCode);
    }
}