import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import createHttpError from "http-errors";
import { Webhook } from "../models/webhooks/webhookModel";

/**
 * Middleware to verify the Shopify webhook signature
 */
export const verifyShopifyWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { channelName, companyId } = req.params;
        const signature = req.headers["x-shopify-hmac-sha256"] as string;

        if (!signature) {
            throw createHttpError(401, "Missing Shopify HMAC signature");
        }

        const cid = companyId.split("-")[0];

        // Find the webhook configuration to retrieve the secret
        const webhook = await Webhook.findOne({
            companyId: cid,
            channelName: new RegExp(`^${channelName}`, "i"),
            platform: "shopify",
            enabled: true,
        });

        if (!webhook) {
            throw createHttpError(404, "Webhook not found or disabled");
        }

        // Compute the HMAC-SHA256 signature

        // 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 token

        const rawBody =
            ((req as any).rawBody as string | undefined) ||
            JSON.stringify(req.body); // Ensure raw body is available
        const computedSignature = crypto
            .createHmac("sha256", webhook?.webhookSecret as string)
            .update(rawBody, "utf8")
            .digest("base64");

        // Compare the computed signature with the received signature
        if (computedSignature !== signature) {
            throw createHttpError(401, "Invalid Shopify HMAC signature");
        }

        next(); // Proceed to the next middleware/controller
    } catch (error) {
        next(error);
    }
};
