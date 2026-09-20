import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service.js";
import { ListUsersQueryDto, UpdateUserBodyDto, UpdateOrGetUserParamsDto } from "./user.schema.js";


class UserController {
    public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id: userId} = req.validated?.params as UpdateOrGetUserParamsDto;
            const updateData = req.validated?.body as UpdateUserBodyDto;
            await userService.updateProfile(userId, updateData, req.requestId);
            req.log.info("user profile updated");
            res.status(200).json({success: true, message: "User profile updated successfully"});
        } catch(error) {
            next(error);
        }
    }
    public async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.validated?.query as ListUsersQueryDto;
            const page = query.page;
            const limit = query.limit;
            const search = query.search;
            const role = query.role;
            const respData = await userService.listUsers(page, limit, search, role);
            req.log.info("all users fetched successfully");
            res.status(200).json({respData});
        }catch (error) {
            next(error);
        }
    }
    public async userProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id: userId} = req.validated?.params as UpdateOrGetUserParamsDto;
            const userData = await userService.userProfile(userId);
            res.status(200).json({success: true, message: "User profile fetched successfully", data: userData});
        } catch(error){
            next(error);
        }
    }
}

export const userController = new UserController();