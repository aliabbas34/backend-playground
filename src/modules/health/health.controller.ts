import { Request, Response, NextFunction } from "express";
import { healthService } from "./health.service.js";

class HealthController {
    public checkHealth(req: Request, res: Response, next: NextFunction): void {
        try {
            const healthStatus = healthService.getHealthStatus();
            req.log.info("Health check endpoint called.");
            res.status(200).json(healthStatus);
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();