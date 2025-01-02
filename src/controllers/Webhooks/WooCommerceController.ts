import { Request, Response, NextFunction } from "express";
import { registerWooCommerceChannel } from "../../services/Webhooks/WebhookService";
import { validateWooCommerceCredentials } from "../../services/Webhooks/WooPlatformService";
import logger from "../../utils/logger";
import { AuthRequest } from "../../types";

class WooCommerceController {
    /**
     * Registers a WooCommerce channel for a company.
     */
    async registerChannel(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const authReq = req as AuthRequest;
            const { name, channelName, storeUrl, credentials, companyId } =
                req.body;
            const cid = authReq.auth.cid || (companyId as string);

            // Validate WooCommerce credentials
            const isValid = await validateWooCommerceCredentials(
                storeUrl as string,
                credentials as { key: string; secret: string },
            );
            if (!isValid) {
                logger.warn(
                    `Invalid WooCommerce credentials ${storeUrl} for companyId: ${cid}, channelName: ${channelName}`,
                );
                res.status(400).json({
                    message: "Invalid WooCommerce credentials",
                });
                return;
            }

            // Register the WooCommerce channel
            const webhook = await registerWooCommerceChannel(
                name as string,
                cid,
                storeUrl as string,
                credentials as { key: string; secret: string },
            );
            logger.info(
                `WooCommerce channel registered successfully for companyId: ${cid}, channelName: ${channelName}`,
            );
            res.status(201).json(webhook);
        } catch (error) {
            logger.error(
                `Error registering WooCommerce channel: ${
                    error instanceof Error ? error.message : error
                }`,
                { error },
            );
            next(error); // Pass error to error-handling middleware
        }
    }
}

export default WooCommerceController;
