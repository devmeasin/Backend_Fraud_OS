import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";
import { UserPackage } from "../models/userPackageModel";

const checkAPILimit = async (
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
        const userPackage = await UserPackage.findOne({ user: userId }).sort({
            createdAt: -1,
        });

        if (!userPackage || userPackage.remainingRequests <= 0) {
            return next(
                createHttpError(
                    403,
                    "API request limit exceeded. Please purchase a package.",
                ),
            );
        }

        userPackage.usedRequests += 1;
        userPackage.remainingRequests -= 1;
        await userPackage.save();

        return next(); // Call next() to pass control to the next middleware or route handler
    } catch (error) {
        next(error);
    }
};

export default checkAPILimit;
