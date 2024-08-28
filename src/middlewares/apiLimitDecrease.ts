import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";
import { UserPackage } from "../models/userSubscriptionModel";
import logger from "../utils/logger";

const apiLimitDecrease = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authRequest = req as AuthRequest;

    if (!authRequest.auth) {
        return next(createHttpError(401, "Unauthorized Request!"));
    }

    const userId = authRequest.auth.sub;

    try {
        const userPackage = await UserPackage.findOne({
            userId: userId,
            isActive: true,
        }).sort({ createdAt: -1 });

        // if (!userPackage) {
        //     return next(
        //         createHttpError(
        //             403,
        //             "No active subscription found or API request limit exceeded. Please purchase a package.",
        //         ),
        //     );
        // }

        // Check if the package allows unlimited API requests
        if (userPackage !== null && !userPackage.isUnlimited) {
            if (userPackage.remainingRequests <= 0) {
                if (userPackage.isActive) {
                    userPackage.isActive = false;
                    await userPackage.save();
                }

                return next(
                    createHttpError(
                        403,
                        "API request limit exceeded. Please purchase a new package.",
                    ),
                );
            }

            // Update the usage data
            userPackage.usedRequests += 1;
            userPackage.remainingRequests -= 1;
            await userPackage.save();
        }

        return res.status(200).json({
            message: "Customer QC data fetched successfully",
            data: req.body.transformData,
        });
    } catch (error) {
        logger.error("Error in checkApiLimit middleware:", error);
        return next(createHttpError(500, "Internal Server Error"));
    }
};

export default apiLimitDecrease;
