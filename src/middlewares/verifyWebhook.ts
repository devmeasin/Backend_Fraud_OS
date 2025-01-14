import { Request, Response, NextFunction } from "express";
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

        // Retrieve the signature header based on the platform
        const signatureHeader =
            channelName === "shopify"
                ? (req.headers["x-shopify-hmac-sha256"] as string)
                : (req.headers["x-wc-webhook-signature"] as string);

        if (!signatureHeader) {
            throw createHttpError(
                401,
                `🥚 Missing ${
                    channelName === "shopify"
                        ? "Shopify HMAC!"
                        : "WooCommerce signature!"
                }`,
            );
        }

        // Extract the company ID from the parameter
        const cid = companyId.split("-")[0];

        // Retrieve the webhook configuration from the database
        const webhook = await Webhook.findOne({
            companyId: cid,
            channelName: new RegExp(`^${channelName}`, "i"),
            enabled: true,
        });

        // Ensure the secret key exists
        const secretKey = webhook?.webhookSecret;
        if (!secretKey) {
            throw createHttpError(500, "Webhook secret is missing");
        }

        // Convert raw body to string
        const rawBody =
            req.body instanceof Buffer
                ? req.body.toString("utf8") // Convert buffer to string
                : JSON.stringify(req.body); // Fallback for unexpected scenarios

        if (channelName === "shopify") {
            // Ensure raw body is captured for Shopify verification
            // const rawBody = JSON.stringify(req.body);

            // Compute the HMAC-SHA256 signature
            const computedSignature = crypto
                .createHmac("sha256", secretKey)
                .update(rawBody, "utf8")
                .digest("base64");

            // Compare the computed signature with the received signature
            // if (computedSignature !== signatureHeader) {
            //     throw createHttpError(
            //         401,
            //         `💩 Unable to verify request HMAC!`,
            //     );
            // }

            // Compare the computed signature with the received signature securely

            const isValid = crypto.timingSafeEqual(
                Buffer.from(computedSignature, "base64"),
                Buffer.from(signatureHeader, "base64"),
            );

            if (!isValid) {
                throw createHttpError(401, "💩 Unable to verify Shopify HMAC");
            }

            // Parse the raw body back to JSON
            req.body = JSON.parse(rawBody);

            next(); // Proceed if verification is successful
        } else if (channelName === "woocommerce") {
            // const rawBody = req.body as string;

            // Compute the HMAC-SHA256 signature
            // Compute the HMAC-SHA256 signature
            const computedSignature = crypto
                .createHmac("sha256", secretKey)
                .update(rawBody, "utf8") // Update with raw body in UTF-8
                .digest("base64");
            // Compare the computed signature with the received signature
            const isValid = crypto.timingSafeEqual(
                Buffer.from(computedSignature, "base64"),
                Buffer.from(signatureHeader, "base64"),
            );

            if (!isValid) {
                throw createHttpError(
                    401,
                    "💩 Unable to verify WooCommerce signature!",
                );
            }

            // Parse the raw body back to JSON
            req.body = JSON.parse(rawBody);

            next(); // Proceed if verification is successful
        }
    } catch (error) {
        next(error);
    }
};
