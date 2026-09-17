import {z} from "zod";

export const userRoleUpdateBodySchema = z.object({
    role: z.enum(["ADMIN", "USER"]),
});

export type UserRoleUpdateBodyDto = z.infer<typeof userRoleUpdateBodySchema>;

export const userRoleUpdateParamSchema = z.object({
    id: z.string()
});

export type UserRoleUpdateParamDto = z.infer<typeof userRoleUpdateParamSchema>;