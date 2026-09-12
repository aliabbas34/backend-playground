import { RequestHandler } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { ForbiddenError } from "../errors/forbidden-error.js";

export function authorize(...allowedRoles: Role[]): RequestHandler {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(new ForbiddenError("You do not have permission to access this resource"));
        }

        next();
    };
}