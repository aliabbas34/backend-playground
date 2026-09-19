import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    HOSTNAME: z.string().default("localhost"),
    ACCESS_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
});

const parsedEnv = envSchema.parse(process.env);

export const envConfig = Object.freeze(parsedEnv);

export type EnvConfig = z.infer<typeof envSchema>;