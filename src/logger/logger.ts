import pino from "pino";
import { envConfig } from "../config/env.js";

const isProduction = envConfig.NODE_ENV === "production";
const logLevel = envConfig.LOG_LEVEL;

const transport = isProduction ? undefined : pino.transport({
    target: "pino-pretty",
    options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
    },
});

export const logger = pino({
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    base: isProduction ? { pid: process.pid, hostname: envConfig.HOSTNAME } : null,
},
transport);
