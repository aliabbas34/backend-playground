import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
        super(message, 400, errorCode);
    }
}