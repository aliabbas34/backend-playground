import { Queue, createNodeRedisClient } from "bullmq";
import { redisClient } from "./redis.js";

const adaptedClient = createNodeRedisClient(redisClient);

export const userEventsQueue = new Queue("user-events", {
    connection: adaptedClient,
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