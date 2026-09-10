
import { Request, Response, NextFunction } from "express";
import {authService} from "./auth.service.js";
import { AuthUser } from "../../middlewares/authenticate.js";

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
            
            const { email, password } = req.body;
            const userAgent = req.headers['user-agent'] || null;
            const ipAddress = req.ip || null;
            const loginResponseData = await authService.login({ email, password, userAgent, ipAddress });
            
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

    public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Refresh endpoint called");
            const refreshToken = req.body.refreshToken;
            const tokens = await authService.refresh(refreshToken);
            res.status(200).json({success: true, data: { tokens }, message: "Token refresh successful" });
        }catch(error) {
            next(error);
        }
    }
    public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // logic
            req.log.debug("Logout endpoint called");
            const refreshToken = req.body.refreshToken;
            await authService.logout(refreshToken);
            res.status(200).json({ success: true, message: "user logged out successfully"});
        } catch(error) {
            next(error);
        }
    }
    public async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Logout all endpoint called");
            const refreshToken = req.body.refreshToken;
            await authService.logoutAll(refreshToken);
            res.status(200).json({ success: true, message: "All sessions logged out successfully"});
        }catch(error){
            next(error);
        }
    }
    public async sessions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Sessions endpoint called");
            const user = req.user as AuthUser;
            const sessions = await authService.sessions(user.userId);
            res.status(200).json({success: true, data: { sessions }, message: "All user sessions fetched successfully"});
        }catch(error) {
            next(error);
        }
    }
}

export const authController = new AuthController();