import app from "./app";
import { Config } from "./config";
import logger from "./config/logger";

const startServer = () => {
    const PORT = Config.PORT;
    try {
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

startServer();
