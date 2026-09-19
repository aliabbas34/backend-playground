
import { Request, Response, NextFunction } from "express";
import {authService} from "./auth.service.js";
import { AuthUser } from "../../middlewares/authenticate.js";
import { LoginBodyDto, RefreshTokenInBodyDto, SignupBodyDto } from "./auth.schema.js";

class AuthController {
    public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Auth signup endpoint called.");
            const { email, name, password, role } = req.validated?.body as SignupBodyDto;
            const userAgent = req.headers['user-agent'] || null;
            const ipAddress = req.ip || null;
            const requestId = req.requestId;
            const signupResponseData = await authService.signup({ email, name, password, role, userAgent, ipAddress, requestId });
            req.log.info("Signup successful");
            res.status(201).json({success: true, data: signupResponseData, message: "User signed up successfully"});
        } catch (error) {
            next(error);
        }
    }
    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Auth login endpoint called.");
            
            const { email, password } = req.validated?.body as LoginBodyDto;
            const userAgent = req.headers['user-agent'] || null;
            const ipAddress = req.ip || null;
            const loginResponseData = await authService.login({ email, password, userAgent, ipAddress });
            
            req.log.info("signup successful");
            res.status(200).json({success: true, message: "User logged in successfully", data: {user: {id: loginResponseData.userId, name: loginResponseData.name, email: loginResponseData.email}, tokens: { accessToken: loginResponseData.accessToken, refreshToken: loginResponseData.refreshToken}}});
        } catch (error) {
            next(error);
        }
    }
    public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        req.log.info("Auth me endpoint called");
        const user = req.user;
        res.status(200).json({success: true, data: user, message: "User authenticated successfully"});
    }

    public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Refresh endpoint called");
            const {refreshToken} = req.validated?.body as RefreshTokenInBodyDto;
            const tokens = await authService.refresh(refreshToken);
            req.log.info("Token refresh successful");
            res.status(200).json({success: true, data: { tokens }, message: "Token refresh successful" });
        }catch(error) {
            next(error);
        }
    }
    public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Logout endpoint called");
            const {refreshToken} = req.validated?.body as RefreshTokenInBodyDto;
            await authService.logout(refreshToken);
            req.log.info("user logout successful");
            res.status(200).json({ success: true, message: "user logged out successfully"});
        } catch(error) {
            next(error);
        }
    }
    public async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Logout all endpoint called");
            const {refreshToken} = req.validated?.body as RefreshTokenInBodyDto;
            await authService.logoutAll(refreshToken);
            req.log.info("all users logged out successfully");
            res.status(200).json({ success: true, message: "All sessions logged out successfully"});
        }catch(error){
            next(error);
        }
    }
    public async sessions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.info("Sessions endpoint called");
            const user = req.user as AuthUser;
            const sessions = await authService.sessions(user.userId);
            req.log.info("Sessions fetched successfully");
            res.status(200).json({success: true, data: { sessions }, message: "All user sessions fetched successfully"});
        }catch(error) {
            next(error);
        }
    }
}

export const authController = new AuthController();