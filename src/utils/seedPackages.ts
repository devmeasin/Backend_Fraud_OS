import Package from "../models/packageModel";
import logger from "./logger";

// Seeding function
export const seedPackages = async () => {
    try {
        const existingPackage = await Package.findOne({ name: "Free Trial" });
        if (existingPackage) {
            logger.info("Free Trial package already exists.");
            return;
        }

        const freeTrialPackage = new Package({
            name: "Free Trial",
            price: 0,
            requestLimit: 50,
            validityDays: 5,
        });

        await freeTrialPackage.save();
        logger.info("Free Trial package created successfully.");
    } catch (error) {
        logger.info("Error seeding packages:", error);
    }
};
