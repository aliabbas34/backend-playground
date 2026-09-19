import { createClient } from "redis";
import { envConfig } from "../config/env.js";
import { logger } from "../logger/logger.js";

export const redisClient = createClient({
    url: envConfig.REDIS_URL,
});

redisClient.on("connect", ()=> {
    logger.info("Redis connected");
});

redisClient.on("end", ()=> {
    logger.info("Redis disconnected");
});

redisClient.on("error", (err)=> {
    logger.error({ err }, "Redis client error");
});

export const connectRedis = async (): Promise<void> => {
    if(redisClient.isOpen) return;

    await redisClient.connect();
};

export const disconnectRedis = async (): Promise<void> => {
    if(redisClient.isOpen){
        await redisClient.quit();
    }
}

export const invalidateUserCache = async (userId: string): Promise<void> => {
    await redisClient.del(`users:profile:${userId}`);

    for await(const keys of redisClient.scanIterator({
        MATCH: "users:list:*",
        COUNT: 100,
    })) {
        await redisClient.del(keys);
    }
    return;
}