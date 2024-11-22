import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel"; // Adjust the path to your User model
import logger from "../utils/logger";
import createHttpError from "http-errors";
import { URL } from "node:url";

interface AuthRequest extends Request {
    auth?: {
        sub?: string;
        role?: string;
    };
}

// Helper function to check if the domain is allowed
const isDomainAllowed = (
    allowedDomains: string[],
    origin: string | undefined,
) => {
    if (!origin) return false;

    try {
        const parsedOrigin = new URL(origin).hostname;
        return allowedDomains.some(
            (domain) =>
                parsedOrigin === domain || parsedOrigin.endsWith(`.${domain}`),
        );
    } catch (error) {
        logger.error("Error parsing origin:", error);
        return false;
    }
};

// Middleware to validate API secret and allowed domain
const validateApiSecret = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authReq = req as AuthRequest;
    const authHeader = req.headers.authorization || "";
    const origin = req.headers.referer || req.headers.origin;

    if (!authHeader.startsWith("Bearer ")) {
        return next(
            createHttpError(
                401,
                "Unauthorized: Missing or invalid authorization header",
            ),
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = await User.findOne({
            apiSecret: token,
            apiSecretStatus: true,
        });

        if (user) {
            if (
                user.allowedDomains.length > 0 &&
                !isDomainAllowed(user.allowedDomains, origin)
            ) {
                return next(
                    createHttpError(403, "Forbidden: Domain not allowed"),
                );
            }

            authReq.auth = {
                sub: user._id.toString(),
                role: user.role,
            };
            return next();
        }

        return next(createHttpError(401, "Unauthorized: Invalid API secret"));
    } catch (error) {
        logger.error("Error validating API secret:", error);
        return next(createHttpError(500, "Internal server error"));
    }
};

export default validateApiSecret;
