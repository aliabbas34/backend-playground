import { Queue } from "bullmq";
import { envConfig } from "../config/env.js";
import { Redis } from 'ioredis';

export const connection = new Redis(envConfig.REDIS_URL, {
    maxRetriesPerRequest: null,
});

export const userEventsQueue = new Queue("user-events", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});