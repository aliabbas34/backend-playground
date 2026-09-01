import app from "./app";
import { envConfig } from "./config/env";
import { logger } from "./logger/logger";

const server = app.listen(envConfig.PORT, ()=> {
    logger.info(`Server is running in ${envConfig.NODE_ENV} mode on port ${envConfig.PORT}`);
});

const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal} signal, Initializing graceful shutdown of server...`);
    server.close((err)=>{
        if(err){
            logger.error({err}, "Error occurred while closing the server");
            process.exit(1);
        }
        logger.info("Server closed successfully. Exiting process.");
        process.exit(0);
    });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));