import {z} from "zod";

export const userRoleUpdateBodySchema = z.object({
    role: z.enum(["ADMIN", "USER"]),
});

export const userRoleUpdateParamSchema = z.object({
    id: z.string()
});