import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db-config";
import logger from "./utils/logger";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        // await AppDataSource.initialize();
        await connectDB();
        logger.error("debug error message", {});
        app.listen(PORT, () => {
            logger.info(`server on running port ${PORT}`);
        });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

void startServer();
