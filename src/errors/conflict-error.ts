import { AppError } from "./app-error.js";

export class ConflictError extends AppError {
    constructor(message = 'Resource conflict', errorCode= 'CONFLICT') {
        super(message, 409, errorCode);
    }
}