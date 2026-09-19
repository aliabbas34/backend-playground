import { NextFunction, Request, Response } from "express";
import { redisClient } from "../lib/redis.js";
import { TooManyRequestsError } from "../errors/too-many-request-error.js";


export const loginRateLimit = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const key = `auth:rate-limit:${req.ip}`;
        const attempts = await redisClient.incr(key);
        if(attempts === 1) {
            await redisClient.expire(key, 15*60);
        }
        if(attempts > 5) {
            const remainingTtl = await redisClient.ttl(key);

            res.set("Retry-After", String(Math.max(remainingTtl, 0)));
            throw new TooManyRequestsError("Too many login attempts. Try again later.")
        } 
        next();
    } catch(error) {
        next(error);
    }
}