import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel"; // Adjust the path to your User model
import logger from "../utils/logger";
import createHttpError from "http-errors";

interface AuthRequest extends Request {
    auth?: {
        sub?: string;
        role?: string;
    };
}

// Middleware to validate API secret
const validateApiSecret = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authReq = req as AuthRequest;
    const authHeader = req.headers.authorization || "";

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
