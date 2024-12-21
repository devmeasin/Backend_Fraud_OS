import Package from "../models/packageModel";
import logger from "./logger";

// Seeding function
export const seedPackages = async () => {
    try {
        const existingPackage = await Package.findOne({ name: "FREE TRIAL" });
        if (existingPackage) {
            logger.info("Free Trial package already exists.");
            return;
        }

        const freeTrialPackage = new Package({
            name: "FREE TRIAL",
            price: 0,
            requestLimit: 200,
            validityDays: 7,
            duration: "7 days", // Add a value for duration
            priceText: "Free", // Add a value for priceText
        });

        await freeTrialPackage.save();
        logger.info("Free Trial package created successfully.");
    } catch (error) {
        logger.info("Error seeding packages:", error);
    }
};
