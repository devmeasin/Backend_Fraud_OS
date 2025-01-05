import e, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import createHttpError from "http-errors";
import { Webhook } from "../models/webhooks/webhookModel";

/**
 * Middleware to verify webhook signatures for WooCommerce and Shopify
 */
export const verifyWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { channelName, companyId } = req.params;

        const signatureHeader =
            channelName === "shopify"
                ? (req.headers["x-shopify-hmac-sha256"] as string)
                : (req.headers["x-wc-webhook-signature"] as string);

        if (!signatureHeader) {
            throw createHttpError(
                401,
                `Missing ${
                    channelName === "shopify"
                        ? "Shopify HMAC"
                        : "WooCommerce signature"
                }`,
            );
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

        const secretKey = webhook.webhookSecret;

        if (channelName === "shopify") {
            const rawBody =
                ((req as any).rawBody as string | undefined) ||
                JSON.stringify(req.body); // Ensure raw body is available

            if (!secretKey) {
                throw createHttpError(500, "Webhook secret is missing");
            }

            // Compute the HMAC-SHA256 signature
            const computedSignature = crypto
                .createHmac("sha256", secretKey)
                .update(rawBody, "utf8")
                .digest(channelName === "shopify" ? "base64" : "hex");

            // Compare the computed signature with the received signature
            if (computedSignature !== signatureHeader) {
                throw createHttpError(
                    401,
                    `Invalid ${
                        channelName === "shopify"
                            ? "Shopify HMAC"
                            : "WooCommerce signature"
                    }`,
                );
            }

            next(); // Proceed to the next middleware/controller
        } else if (channelName === "woocommerce") {
            if (signatureHeader !== secretKey) {
                throw createHttpError(401, "Invalid webhook signature");
            }
            next();
        }
    } catch (error) {
        next(error);
    }
};
