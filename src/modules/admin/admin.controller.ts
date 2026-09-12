import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service.js";
import { Role } from "../../../generated/prisma/enums.js";


class AdminController{
    public async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Admin, users endpoint called");
            const responseData = await adminService.listUsers();
            res.status(200).json({success: true, data: responseData, message: "All users fetched successfully"});
        } catch(error) {
            next(error);
        }
    }
    
    public async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{
            req.log.debug("admin user-role endpoint called");
            const newRole = req.body.role as Role;
            const userId = req.params.id as string;
            await adminService.updateUserRole(userId, newRole);
            res.status(200).json({ success: true, message: "User role updated successfully"});
        } catch(error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();