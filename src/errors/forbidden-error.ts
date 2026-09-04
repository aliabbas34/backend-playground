import { AppError } from "./app-error.js";

export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', errorCode = 'FORBIDDEN') {
        super(message, 403, errorCode);
    }
}