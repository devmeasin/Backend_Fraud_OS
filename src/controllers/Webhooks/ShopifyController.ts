import { Request, Response, NextFunction } from "express";
import { Webhook } from "../../models/webhooks/webhookModel";
import { generateUniqueDeliveryUrl } from "../../utils/platformHelper";
import { validateShopifyCredentials } from "../../services/Webhooks/ShopifyPlatformService";
import { registerShopifyWebhook } from "../../services/platformService";
import { AuthRequest } from "../../types";

class ShopifyController {
    async registerChannel(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                name,
                companyId,
                storeUrl,
                credentials,
            }: {
                name: string;
                companyId: string;
                storeUrl: string;
                credentials: { accessToken: string };
            } = req.body;
            const authReq = req as AuthRequest;
            const cid = authReq.auth.cid || companyId;

            if (!cid) {
                return res
                    .status(400)
                    .json({ message: "Company ID is required." });
            }

            if (!name || !storeUrl || !credentials) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields." });
            }

            const isValid = await validateShopifyCredentials(
                storeUrl,
                credentials,
            );
            if (!isValid) {
                return res
                    .status(400)
                    .json({ message: "Invalid Shopify credentials." });
            }

            const eventTypes = [
                "orders/create",
                "orders/updated",
                "products/create",
                "products/update",
                "products/delete",
            ];

            const deliveryUrl = generateUniqueDeliveryUrl(
                companyId,
                "shopify",
                `${Date.now()}`,
            );
            const webhookIds = await registerShopifyWebhook(
                storeUrl,
                deliveryUrl,
                credentials,
                eventTypes,
            );

            const webhook = new Webhook({
                name,
                companyId,
                platform: "shopify",
                channelName: "shopify",
                storeUrl,
                eventTypes,
                deliveryUrl,
                credentials,
                integrationId: webhookIds.join(","),
                enabled: true,
                shopifySpecificFields: {
                    shopifyWebhookId: webhookIds.join(","),
                },
            });

            await webhook.save();
            res.status(201).json({
                message: "Shopify channel registered successfully.",
                webhook,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ShopifyController;
