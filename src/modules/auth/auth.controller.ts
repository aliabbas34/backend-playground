
import { Request, Response, NextFunction } from "express";
import {authService} from "./auth.service.js";

class AuthController {
    public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Auth signup endpoint called.");
            const { email, name, password } = req.body;
            const signupResponseData = await authService.signup({ email, name, password });
            res.status(201).json({success: true, data: signupResponseData, message: "User signed up successfully"});
        } catch (error) {
            next(error);
        }
    }
    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Auth login endpoint called.");
            // Implement login logic here
            const { email, password } = req.body;
            const loginResponseData = await authService.login({ email, password });
            
            res.status(200).json({success: true, message: "User logged in successfully", data: {user: {id: loginResponseData.userId, name: loginResponseData.name, email: loginResponseData.email}, tokens: { accessToken: loginResponseData.accessToken, refreshToken: loginResponseData.refreshToken}}});
        } catch (error) {
            next(error);
        }
    }
    public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.log.debug("Auth me endpoint called");
        const user = req.user;
        res.status(200).json({success: true, data: user, message: "User authenticated successfully"});
    }
}

export const authController = new AuthController();