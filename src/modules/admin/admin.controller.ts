import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service.js";
import { UserRoleUpdateBodyDto, UserRoleUpdateParamDto } from "./admin.schema.js";


class AdminController{
    public async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Admin, users endpoint called");
            const responseData = await adminService.listUsers();
            req.log.info("successfully fetched all users");
            res.status(200).json({success: true, data: responseData, message: "All users fetched successfully"});
        } catch(error) {
            next(error);
        }
    }
    
    public async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try{
            req.log.info("admin user-role endpoint called");
            const {role:newRole} = req.validated?.body as UserRoleUpdateBodyDto;
            const {id:userId} = req.validated?.params as UserRoleUpdateParamDto;
            await adminService.updateUserRole(userId, newRole);
            req.log.info("user role updated");
            res.status(200).json({ success: true, message: "User role updated successfully"});
        } catch(error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();