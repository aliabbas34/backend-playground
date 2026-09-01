import { envConfig } from "../../config/env";

interface HealthStatus {
    status: "ok" | "error";
    uptime: number;
    timestamp: string;
    environment: "development" | "production" | "test";
}

class HealthService {
    public getHealthStatus(): HealthStatus {
        return {
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: envConfig.NODE_ENV,
        }
    }
}

export const healthService = new HealthService();