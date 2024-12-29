import express, { Request, Response, NextFunction } from "express";
// import { WebhookController } from "../controllers/Webhooks/__WebhookController";
// const webhookController = new WebhookController();

const router = express.Router();

import WebhookController from "../controllers/Webhooks/WebhookController";
import WooCommerceController from "../controllers/Webhooks/WooCommerceController";
import authenticate from "../middlewares/authenticate";
import { verifyWebhook } from "../middlewares/verifyWebhook";

const webhookController = new WebhookController();

const wooCommerceController = new WooCommerceController();

// Unified webhook receiver
router.post(
    "/woocommerce/register",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        wooCommerceController.registerChannel(req, res, next),
);
router.post(
    "/:channelName/:companyId",
    verifyWebhook,
    (req: Request, res: Response, next: NextFunction) =>
        webhookController.receiveWebhook(req, res, next),
);

// router.post(
//     "/woocommerce",
//     webhookController.handleWooCommerceWebhook.bind(webhookController),
// );
// router.post(
//     "/shopify",
//     webhookController.handleShopifyWebhook.bind(webhookController),
// );

export default router;
