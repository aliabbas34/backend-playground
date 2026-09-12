import { z } from "zod";

export const updateUserParamSchema = z.object({
    id: z.string()
});

export const updateUserBodySchema = z.object({
    name: z.string().min(3, "Name length too short, use atleast 3 characters"),
    email: z.string().email("Invalid email address"),
});