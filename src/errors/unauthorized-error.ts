import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access', errorCode = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
    }
}