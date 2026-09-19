import { z } from "zod";

export const updateOrGetUserParamSchema = z.object({
    id: z.string()
});

export type UpdateOrGetUserParamsDto = z.infer<typeof updateOrGetUserParamSchema>;

export const updateUserBodySchema = z.object({
    name: z.string().min(3, "Name length too short, use atleast 3 characters"),
    email: z.string().email("Invalid email address"),
});

export type UpdateUserBodyDto = z.infer<typeof updateUserBodySchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;