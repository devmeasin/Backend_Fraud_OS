import { NextFunction, Request, Response } from "express";
import { validateShopifyCredentials } from "../../services/Webhooks/ShopifyPlatformService";
import { registerShopifyChannel } from "../../services/Webhooks/WebhookService";
import { AuthRequest } from "../../types";
import logger from "../../utils/logger";

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

            const channelName = "shopify";

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
                logger.warn(
                    `Invalid Shopify credentials. ${storeUrl} for companyId: ${cid}, channelName: ${channelName}`,
                );
                return res
                    .status(400)
                    .json({ message: "Invalid Shopify credentials." });
            }

            const webhook = await registerShopifyChannel(
                name,
                cid,
                storeUrl,
                credentials as { accessToken: string },
            );

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
