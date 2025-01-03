import { Schema, model, Document } from "mongoose";

export interface IWebhook extends Document {
    companyId: Schema.Types.ObjectId;
    platform: "wooCommerce" | "shopify" | "daraz";
    channelName: string;
    name: string;
    storeUrl: string; // Store URL for WooCommerce
    eventTypes: string[];
    deliveryUrl: string;
    credentials: {
        key: string;
        secret: string;
        accessToken?: string;
    };
    webhookSecret?: string;
    integrationId: string;
    enabled: boolean;
    metadata?: any;
    shopifySpecificFields?: {
        shopifyWebhookId?: string; // For Shopify-specific webhook IDs
    };
}

const WebhookSchema = new Schema<IWebhook>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        platform: {
            type: String,
            enum: ["wooCommerce", "shopify", "daraz"],
            required: true,
        },
        name: { type: String, required: true },
        channelName: { type: String, required: true },
        storeUrl: { type: String, required: true }, // Store URL is now part of the schema
        eventTypes: { type: [String], required: true },
        deliveryUrl: { type: String, required: true, unique: true },
        credentials: {
            key: { type: String },
            secret: { type: String },
            accessToken: { type: String },
        },
        webhookSecret: { type: String },
        integrationId: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        metadata: { type: Schema.Types.Mixed },
        shopifySpecificFields: {
            shopifyWebhookId: { type: String }, // For Shopify-specific webhook IDs
        },
    },
    { timestamps: true },
);

export const Webhook = model<IWebhook>("Webhook", WebhookSchema);
