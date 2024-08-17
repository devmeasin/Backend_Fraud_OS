import mongoose from "mongoose";
import logger from "../utils/logger";
import { Config } from ".";
import { seedPackages } from "../utils/seedPackages";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", async () => {
            logger.info("Connected to database successfully");
            await seedPackages();
        });

        mongoose.connection.on("error", (err) => {
            logger.error("Error in connecting to database.", err);
        });

        await mongoose.connect(Config.DB_URI as string);
    } catch (err) {
        logger.error("Error in connecting to database.", err);
        process.exit(1);
    }
};

export default connectDB;
