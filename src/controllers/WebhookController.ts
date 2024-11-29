import { Request, Response } from "express";
import { WebhookService } from "../services/WebhookService";

export class WebhookController {
    private webhookService: WebhookService;

    constructor() {
        this.webhookService = new WebhookService();
    }

    async handleWooCommerceWebhook(req: Request, res: Response) {
        try {
            // Verify webhook signature if needed
            const order = await this.webhookService.handleWooCommerceWebhook(
                req.body,
            );
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: "Something went wrong from webhook",
            });
        }
    }

    async handleShopifyWebhook(req: Request, res: Response) {
        try {
            // Verify Shopify webhook signature
            const order = await this.webhookService.handleShopifyWebhook(
                req.body,
            );
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: "Something went wrong from webhook",
            });
        }
    }
}
