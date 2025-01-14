import { Webhook } from "../../models/webhooks/webhookModel";
import {
    registerShopifyWebhook,
    registerWooCommerceWebhook,
} from "../platformService";
import { generateUniqueDeliveryUrl } from "../../utils/platformHelper";
import { generateApiSecret } from "../API_SecretService";

/**
 * Registers a new WooCommerce channel for a company.
 */
export const registerWooCommerceChannel = async (
    name: string,
    companyId: string,
    storeUrl: string,
    credentials: { key: string; secret: string },
) => {
    // Register webhooks for WooCommerce
    const channelName = "woocommerce";

    // Check for existing channel

    const existingChannel = await Webhook.findOne({
        companyId,
        storeUrl,
    });
    if (existingChannel) {
        throw new Error(
            `Channel "${channelName}" already exists for this company.`,
        );
    }

    const eventTypes = [
        "product.created",
        "product.updated",
        "order.created",
        "order.updated",
    ];

    // Generate a temporary integration ID to create a unique delivery URL
    const tempIntegrationId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
    const deliveryUrl = generateUniqueDeliveryUrl(
        companyId,
        channelName,
        tempIntegrationId,
    );

    const webhookSecret = generateApiSecret();

    const integrationId = await registerWooCommerceWebhook(
        storeUrl,
        deliveryUrl,
        webhookSecret,
        credentials,
        eventTypes,
    );

    // Save webhook configuration to database
    const webhook = new Webhook({
        name,
        companyId,
        platform: channelName,
        channelName,
        storeUrl,
        eventTypes,
        deliveryUrl,
        credentials,
        integrationId,
        webhookSecret,
        enabled: true,
    });

    return await webhook.save();
};

export const registerShopifyChannel = async (
    name: string,
    companyId: string,
    storeUrl: string,
    credentials: { secret: string; accessToken: string },
) => {
    const channelName = "shopify";

    // Check for existing channel

    const existingChannel = await Webhook.findOne({
        companyId,
        storeUrl,
    });
    if (existingChannel) {
        throw new Error(
            `Channel "${channelName}" already exists for this company.`,
        );
    }

    const eventTypes = [
        "orders/create",
        "orders/updated",
        "products/create",
        "products/update",
    ];

    // Generate a temporary integration ID to create a unique delivery URL
    const tempIntegrationId = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;

    const deliveryUrl = generateUniqueDeliveryUrl(
        companyId,
        channelName,
        tempIntegrationId,
    );

    const webhookSecret = credentials?.secret;

    const webhookIds = await registerShopifyWebhook(
        storeUrl,
        deliveryUrl,
        credentials,
        eventTypes,
    );

    const webhook = new Webhook({
        name,
        companyId,
        platform: channelName,
        channelName: channelName,
        storeUrl,
        eventTypes,
        deliveryUrl,
        credentials,
        integrationId: webhookIds,
        webhookSecret,
        enabled: true,
        shopifySpecificFields: {
            shopifyWebhookId: webhookIds,
        },
    });

    await webhook.save();
};
