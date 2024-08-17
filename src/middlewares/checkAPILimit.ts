import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";
import { UserPackage } from "../models/userSubscriptionModel"; // Ensure this matches your actual import
import logger from "../utils/logger";

const checkApiLimit = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authRequest = req as AuthRequest;

    // Step 1: Check if the request is authenticated
    if (!authRequest.auth) {
        return next(createHttpError(401, "Unauthorized Request!"));
    }

    const userId = authRequest.auth.sub;

    try {
        // Step 2: Retrieve the latest active package for the user
        const userPackage = await UserPackage.findOne({
            userId: userId,
            isActive: true,
        }).sort({ createdAt: -1 });

        if (!userPackage) {
            // No active package found
            return next(
                createHttpError(
                    403,
                    "No active subscription found or API request limit exceeded. Please purchase a package.",
                ),
            );
        }

        // Step 3: Check if the package has expired
        const currentDate = new Date();
        if (userPackage.expiryDate < currentDate) {
            userPackage.isActive = false; // Deactivate the expired package
            await userPackage.save();
            return next(
                createHttpError(
                    403,
                    "Your subscription has expired. Please renew your package.",
                ),
            );
        }

        // Step 4: Check if the user has remaining API requests
        if (userPackage.remainingRequests <= 0) {
            // No remaining API requests
            if (userPackage.isActive) {
                userPackage.isActive = false; // Deactivate the expired package
                await userPackage.save();
            }

            return next(
                createHttpError(
                    403,
                    "API request limit exceeded. Please purchase a new package.",
                ),
            );
        }

        // Step 5: Update the usage data (increment usedRequests, decrement remainingRequests)
        userPackage.usedRequests += 1;
        userPackage.remainingRequests -= 1;
        await userPackage.save();

        // Step 6: Pass control to the next middleware or route handler
        return next();
    } catch (error) {
        // Log the error for debugging
        logger.error("Error in checkApiLimit middleware:", error);
        return next(createHttpError(500, "Internal Server Error"));
    }
};

export default checkApiLimit;
