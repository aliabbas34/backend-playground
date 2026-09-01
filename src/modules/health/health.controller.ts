import { Request, Response, NextFunction } from "express";
import { healthService } from "./health.service";

class HealthController {
    public checkHealth(req: Request, res: Response, next: NextFunction): void {
        try {
            const healthStatus = healthService.getHealthStatus();
            req.log.debug("Health check endpoint called.");
            res.status(200).json(healthStatus);
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();