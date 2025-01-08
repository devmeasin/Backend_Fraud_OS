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

        console.log(JSON.stringify(req.body));

        const signatureHeader =
            channelName === "shopify"
                ? (req.headers["x-shopify-hmac-sha256"] as string)
                : (req.headers["x-wc-webhook-signature"] as string);

        const hmacHeader = req.headers["x-shopify-hmac-sha256"];

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

        const secretKey = "a650f001ef086858d3dcf304d4874022";
        // const secretKey = "59d25b39e1831aeebe3777e2416dbb61227132ded019e4a45c2e002d8b425c59";
        // const secretKey = "ea7f1d9d2e2011749fdc3c61d41646b5";

        // Retrieve rawBody from the request
        const rawBody = JSON.stringify(req.body);

        //  console.log("Raw Body:", req.body || "No raw body available");

        if (channelName === "shopify") {
            // console.log(rawBody);

            // Generate HMAC using the Shopify secret ke

            if (!secretKey) {
                throw createHttpError(500, "Webhook secret is missing");
            }

            // Compare the HMACs using a secure timing-safe method
            const generated_hash = crypto
                .createHmac("sha256", secretKey)
                .update(rawBody, "utf8")
                .digest("base64");

            console.log(
                "this is generated_hash",
                generated_hash,
                "this is hmacHeader",
                hmacHeader,
            );

            //  const signatureOk = crypto.timingSafeEqual(
            //     Buffer.from(generated_hash),
            //     Buffer.from(hmacHeader)
            //   );

            //   console.log(signatureOk)

            if (generated_hash !== hmacHeader) {
                throw new Error("Unable to verify request HMAC");
            }

            // Compute the HMAC-SHA256 signature
            // const computedSignature = crypto
            //     .createHmac("sha256", secretKey)
            //     .update(rawBody, "utf8")
            //     .digest(channelName === "shopify" ? "base64" : "hex");

            // console.log(
            //     "this is computedSignature",
            //     computedSignature,
            //     "this is signatureHeader",
            //     signatureHeader,
            // );
            // // Compare the computed signature with the received signature
            // if (computedSignature !== signatureHeader) {
            //     throw createHttpError(
            //         401,
            //         `Invalid ${
            //             channelName === "shopify"
            //                 ? "Shopify HMAC"
            //                 : "WooCommerce signature"
            //         }`,
            //     );
            // }

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
