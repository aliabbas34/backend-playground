import { Worker, type Job } from "bullmq";
import { logger } from "../logger/logger.js";
import { connection } from "../lib/queue.js";

type UserEventData = {
    requestId?: string;
    [key: string]: unknown;
};

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
        connection,
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

worker.on("error", (error) => {
    logger.error({error}, "User events worker error");
});


const shutdown = async () => {
    await worker.close();
    connection.disconnect();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);