import { Request, Response, NextFunction } from "express";
// import crypto from "crypto";
import createHttpError from "http-errors";
import { Webhook } from "../models/webhooks/webhookModel";

/**
 * Middleware to verify the WooCommerce webhook signature
 */
export const verifyWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { channelName, companyId } = req.params;
        const signature = req.headers["x-wc-webhook-signature"] as string;

        if (!signature) {
            throw createHttpError(401, "Missing webhook signature");
        }
        const cid = companyId.split("-")[0];
        // Find the webhook configuration to retrieve the secret
        const webhook = await Webhook.findOne({
            companyId: cid,
            channelName: new RegExp(`^${channelName}`, "i"),
            enabled: true,
        });

        if (!webhook) {
            throw createHttpError(404, "Webhook not found or disabled");
        }

        // Use the stored secret to validate the signature
        // const payload = JSON.stringify(req.body);
        // const computedSignature = crypto
        //     .createHmac("sha256", webhook.credentials.secret) // Use the stored secret
        //     .update(payload, "utf8")
        //     .digest("base64");

        // Compare the computed signature with the received signature
        if (webhook.webhookSecret !== signature) {
            throw createHttpError(401, "Invalid webhook signature");
        }

        next(); // Proceed to the next middleware/controller
    } catch (error) {
        next(error);
    }
};
