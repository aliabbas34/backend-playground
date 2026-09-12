import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.js";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { Role } from "../../generated/prisma/enums.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: Role;
            };
        }
    }
}
const ACCESS_TOKEN_SECRET = envConfig.ACCESS_TOKEN_SECRET;
export type AuthUser = {
  userId: string;
  email: string;
  role: Role;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): Response|void => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError("Header must be formatted as Bearer <token>"))
    }
    const token = authHeader && authHeader.split(' ')[1]?.trim();

    if(!token) {
        return next(new UnauthorizedError("Auth token required"))
    }
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (typeof decoded === "string") {
            throw new UnauthorizedError("Invalid token payload");
        }

        const user: AuthUser = {
            userId: decoded.sub as string,
            email: decoded.email as string,
            role: decoded.role as Role,
        };
        req.user = user;
        next();
    } catch(error) {
        return next(error);
    }
}