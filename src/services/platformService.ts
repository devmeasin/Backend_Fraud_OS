import axios from "axios";
import { Config } from "../config";

/**
 * Registers WooCommerce webhooks for the given event types.
 */
export const registerWooCommerceWebhook = async (
    storeUrl: string,
    deliveryUrl: string,
    webhookSecret: string,
    credentials: { key: string; secret: string },
    eventTypes: string[],
): Promise<string> => {
    const { key, secret } = credentials;

    // Register webhooks for each event type
    const webhooks = await Promise.all(
        eventTypes.map(async (event) => {
            const response = await axios.post(
                `${storeUrl}/wp-json/wc/v3/webhooks`,
                {
                    name: event.toLocaleUpperCase(),
                    topic: event,
                    delivery_url: `${Config.API_GATEWAY}${deliveryUrl}`, // Replaced dynamically
                    secret: webhookSecret,
                },
                {
                    auth: {
                        username: key,
                        password: secret,
                    },
                },
            );

            return response.data.id as string; // Platform-specific webhook ID
        }),
    );

    return webhooks.join(","); // Concatenate multiple webhook IDs if needed
};

export const registerShopifyWebhook = async (
    storeUrl: string,
    deliveryUrl: string,
    credentials: { accessToken: string },
    eventTypes: string[],
): Promise<string[]> => {
    const webhookIds = await Promise.all(
        eventTypes.map(async (event) => {
            const response = await axios.post(
                `${storeUrl}/admin/api/2025-01/webhooks.json`,
                {
                    webhook: {
                        topic: event,
                        address: deliveryUrl,
                        format: "json",
                    },
                },
                {
                    headers: {
                        "X-Shopify-Access-Token": credentials.accessToken,
                        "Content-Type": "application/json",
                    },
                },
            );
            return response.data.webhook.id as string;
        }),
    );

    return webhookIds;
};
