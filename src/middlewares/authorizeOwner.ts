import { NextFunction, Request, Response } from "express"
import { Role } from "../../generated/prisma/enums.js"
import { ForbiddenError } from "../errors/forbidden-error.js";


export const authorizeOwner= (req: Request, res: Response, next: NextFunction): Response | void => {
    const requestMadeByRole = req.user?.role as Role;
    const userId = req.user?.userId as string;
    const idReceivedInParams = req.params.id as string;
    if(requestMadeByRole === "ADMIN" || userId === idReceivedInParams) return next();
    else return next(new ForbiddenError("User do not have the permission to do the request task"));
}