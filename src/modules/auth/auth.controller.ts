
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
            req.log.error({ err: error }, "Signup failed");
            if(error instanceof Error && error.message === "User with this email already exists.") {
                res.status(409).json({success: false, message: error.message});
            } else {
                next(error);
            }
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
            req.log.error({ err: error }, "Login failed");
            if(error instanceof Error){
                if(error.message === "User does not exist!"){
                    res.status(404).json({success: false, message: error.message});
                } else if(error.message === "Wrong password! Authentication failed."){
                    res.status(401).json({success: false, message: error.message});
                } else {
                    next(error);
                }
            } else {
                next(error);
            }
        }
    }
    public async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            req.log.debug("Auth me endpoint called");
            const user = req.user;
            res.status(200).json({success: true, data: user, message: "User authenticated successfully"});
        } catch(error) {
            next(error);
        }
    }
}

export const authController = new AuthController();