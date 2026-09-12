import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service.js";


class UserController {
    public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id as string;
            const updateData = {
                name: req.body.name as string,
                email: req.body.email as string,
            }
            await userService.updateProfile(userId, updateData);
            res.status(200).json({success: true, message: "User profile updated successfully"});
        } catch(error) {
            next(error);
        }
    }
}

export const userController = new UserController();