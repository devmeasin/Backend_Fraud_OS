import { User } from "../models/userModel";
import createHttpError from "http-errors";
import { UserPackage } from "../models/userSubscriptionModel";
import logger from "../utils/logger";

// Function to add a domain to a user
const addDomainToUser = async (userId: string, domain: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        const currentPackage = await UserPackage.findOne({
            userId,
            isActive: true,
        }).sort({ createdAt: -1 });
        if (!currentPackage) {
            throw createHttpError(403, "No active package found");
        }

        // Check if domain list limit is reached
        if (currentPackage.siteAccessLimit <= 0) {
            throw createHttpError(
                403,
                "Current domain list limit is zero; cannot add more domains",
            );
        }

        // Ensure user has not exceeded their domain limit
        if (user.allowedDomains.length >= currentPackage.siteAccessLimit) {
            throw createHttpError(
                403,
                "Domain limit reached for current package",
            );
        }

        // Prevent adding duplicate domains
        if (user.allowedDomains.includes(domain)) {
            throw createHttpError(403, "Domain already added");
        }

        user.allowedDomains.push(domain);
        await user.save();
    } catch (error) {
        if (createHttpError.isHttpError(error)) {
            // Forward specific HTTP error messages to the client
            throw error;
        }
        logger.error("Error in addDomainToUser:", error); // Log the actual error
        throw createHttpError(500, "Error adding domain to user"); // General error message
    }
};

// Function to remove a domain from a user
const removeDomainFromUser = async (userId: string, domain: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        // Check if the domain exists in the user's allowed domains
        if (!user.allowedDomains.includes(domain)) {
            throw createHttpError(
                404,
                "Domain does not exist in the user's allowed domains",
            );
        }

        user.allowedDomains = user.allowedDomains.filter((d) => d !== domain);
        await user.save();
    } catch (error) {
        if (createHttpError.isHttpError(error)) {
            // Forward specific HTTP error messages to the client
            throw error;
        }
        logger.error("Error in removeDomainFromUser:", error); // Log the actual error
        throw createHttpError(500, "Error removing domain from user"); // General error message
    }
};

export { addDomainToUser, removeDomainFromUser };
