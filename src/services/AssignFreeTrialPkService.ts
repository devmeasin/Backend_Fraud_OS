import Package from "../models/packageModel";
import { UserPackage } from "../models/userSubscriptionModel";
import logger from "../utils/logger";

// Function to assign Free Trial package to a user
export const assignFreeTrialPackage = async (userId: string) => {
    try {
        // Find the Free Trial package
        const freeTrialPackage = await Package.findOne({ name: "FREE TRIAL" });

        if (!freeTrialPackage) {
            throw new Error("Free Trial package not found");
        }

        // Calculate the expiry date (current date + validity days)
        const expiryDate = new Date();
        expiryDate.setDate(
            expiryDate.getDate() + freeTrialPackage.validityDays,
        );

        // Create a new UserPackage document
        const userPackage = new UserPackage({
            userId,
            packageId: freeTrialPackage._id,
            usedRequests: 0,
            remainingRequests: freeTrialPackage.requestLimit,
            purchaseDate: new Date(),
            expiryDate,
            isActive: true,
        });

        await userPackage.save();
        logger.info(`Free Trial package assigned to user ${userId}`);
    } catch (error) {
        logger.error("Error assigning Free Trial package:", error);
    }
};
