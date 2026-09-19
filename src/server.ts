import app from "./app.js";
import { envConfig } from "./config/env.js";
import { logger } from "./logger/logger.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";

const startServer = async() => {
    await connectRedis();
    const server = app.listen(envConfig.PORT, ()=> {
        logger.info(`Server is running in ${envConfig.NODE_ENV} mode on port ${envConfig.PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
        logger.info(`Received ${signal} signal, Initializing graceful shutdown of server...`);
        server.close(async(err)=>{
            if(err){
                logger.error({err}, "Error occurred while closing the server");
                process.exit(1);
            }
            logger.info("Server closed successfully. Exiting process.");
            await disconnectRedis();
            process.exit(0);
        });
    };
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startServer().catch((err)=> {
    logger.fatal({err}, "Failed to start server");
    process.exit(1);
})