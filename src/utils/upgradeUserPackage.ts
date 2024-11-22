import { UserPackage } from "../models/userSubscriptionModel";
import { User } from "../models/userModel";
import createHttpError from "http-errors";

export const upgradeUserPackage = async (
    userId: string,
    newPackageId: string,
) => {
    try {
        // Find the current active package
        const currentPackage = await UserPackage.findOne({
            userId,
            isActive: true,
        }).sort({ createdAt: -1 });

        if (currentPackage) {
            // Deactivate the current package
            currentPackage.isActive = false;
            await currentPackage.save();
        }

        // Find the new package
        const newPackage = await UserPackage.findOne({
            packageId: newPackageId,
        });

        if (!newPackage) {
            throw createHttpError(404, "New package not found");
        }

        // Update the user with the new package
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        // Clear old domains if the new package has a different limit
        if (newPackage.siteAccessLimit !== currentPackage?.siteAccessLimit) {
            user.allowedDomains = []; // Optionally, keep existing domains if the limit increases
        }

        await user.save();

        // Create and save the new user package
        const updatedPackage = new UserPackage({
            userId,
            packageId: newPackageId,
            remainingRequests: newPackage.remainingRequests,
            expiryDate: newPackage.expiryDate,
            isActive: true,
            isUnlimited: newPackage.isUnlimited,
            siteAccessLimit: newPackage.siteAccessLimit,
            allowedDomains: user.allowedDomains, // Retain old domains
        });

        await updatedPackage.save();
    } catch (error) {
        if (error instanceof createHttpError.HttpError) {
            // Handle specific HTTP errors
            throw createHttpError(error);
        } else {
            // Handle unexpected errors
            throw createHttpError(500, "Error upgrading user package");
        }
    }
};
