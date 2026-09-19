import { Worker, createNodeRedisClient, type Job } from "bullmq";
import { connectRedis, redisClient } from "../lib/redis.js";
import { logger } from "../logger/logger.js";

type UserEventData = {
    requestId?: string;
    [key: string]: unknown;
};

const adaptedClient = createNodeRedisClient(redisClient);
await connectRedis();

const worker = new Worker<UserEventData>(
    "user-events",
    async(job:Job<UserEventData>) => {
        const logData = {
            jobId: job.id,
            jobName: job.name,
            attempts: job.attemptsMade + 1,
            ...(job.data.requestId 
                ? { requestId: job.data.requestId }
                : {}
            ),
        };

        logger.info(logData, "Processing user event");

        switch(job.name){
            case "profile.updated":
                logger.info(logData, "Profile update event processed");
                break;
            case "user.signed_up":
                logger.info(logData, "User signup event processed");
                break;
            default:
                logger.warn(logData, "Unsupported user event");
                throw new Error(`Unsupported user event: ${job.name}`);
        }
    },
    {
        connection: adaptedClient,
    },
);

worker.on("failed", (job, error) => {
    logger.error(
        {
            jobId: job?.id,
            jobName: job?.name,
            attempts: job ? job.attemptsMade + 1 : undefined,
            error, 
            ...(job?.data.requestId
                ? { requestId: job.data.requestId }
                : {}
            ),
        },
        "User event job failed",
    );
});


const shutdown = async () => {
    await worker.close();
    await redisClient.quit();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);