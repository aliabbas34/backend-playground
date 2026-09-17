import {z} from "zod";

export const signupSchema = z.object({
    name: z.string().min(3, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["ADMIN", "USER"]),
});

export type SignupBodyDto = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginBodyDto = z.infer<typeof loginSchema>;

export const refreshTokenInBodySchema = z.object({
    refreshToken: z.string().min(10, "Token length too short")
});

export type RefreshTokenInBodyDto = z.infer<typeof refreshTokenInBodySchema>;