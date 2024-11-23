import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import authenticate from "../middlewares/authenticate";
import {
    getUserApiSecret,
    setApiSecretStatus,
    updateUserApiSecret,
} from "../services/ApiSecretService";
import { AuthRequest } from "../types";
import validateApiSecret from "../middlewares/validateApiSecret";
import {
    addDomainToUser,
    removeDomainFromUser,
} from "../services/DomainMGService";

const router = express.Router();

// Route to get a API secret
router.get("/", authenticate, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;

    // Check if the user ID is provided
    if (!authReq.auth.sub) {
        return res
            .status(400)
            .json({ message: "User ID is required Unauthorised" });
    }

    try {
        const user = await getUserApiSecret(authReq.auth.sub);
        res.json({
            apiSecret: user.apiSecret,
            apiSecretStatus: user.apiSecretStatus,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating API secret" });
    }
});

// Route to generate a new API secret
router.post("/generate", authenticate, async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;

    // Check if the user ID is provided
    if (!authReq.auth.sub) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        await updateUserApiSecret(authReq.auth.sub);
        res.json({ message: "API secret updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating API secret" });
    }
});

// Route to enable or disable API secret
router.post(
    "/set-status",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;

        // Check if the user ID is provided
        if (!authReq.auth.sub) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const { apiSecretStatus } = req.body; // Ensure userId and enabled status are provided

        if (typeof apiSecretStatus !== "boolean") {
            return res.status(400).json({ message: "Invalid enabled status" });
        }

        try {
            await setApiSecretStatus(authReq.auth.sub, apiSecretStatus);
            res.json({
                message: `API secret ${
                    apiSecretStatus ? "enabled" : "disabled"
                } successfully`,
            });
        } catch (error) {
            return next(
                createHttpError(500, "Error updating API secret status"),
            );
        }
    },
);

// Route to generate a new API secret with vaildator for API secret
router.post(
    "/validator",
    validateApiSecret,
    (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json({ message: "API secret is Valid" });
        } catch (error) {
            return next(
                createHttpError(500, "Error validating API secret with domain"),
            );
        }
    },
);

// Route to add a domain to the user
router.post(
    "/domains/add",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        const { domain } = req.body;

        if (!domain) {
            return next(createHttpError(400, "Domain is required"));
        }

        try {
            await addDomainToUser(authReq.auth.sub, domain as string);
            res.json({ message: "Domain added successfully" });
        } catch (error) {
            next(error);
        }
    },
);

// Route to remove a domain from the user
router.post(
    "/domains/remove",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        const { domain } = req.body;

        if (!domain) {
            return next(createHttpError(400, "Domain is required"));
        }

        try {
            await removeDomainFromUser(authReq.auth.sub, domain as string);
            res.json({ message: "Domain removed successfully" });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
