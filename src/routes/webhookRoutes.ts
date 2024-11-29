import express from "express";
import { WebhookController } from "../controllers/WebhookController";

const router = express.Router();
const webhookController = new WebhookController();

router.post(
    "/woocommerce",
    webhookController.handleWooCommerceWebhook.bind(webhookController),
);
router.post(
    "/shopify",
    webhookController.handleShopifyWebhook.bind(webhookController),
);

export default router;
