import express, { Request, Response, NextFunction } from "express";
// import { WebhookController } from "../controllers/Webhooks/__WebhookController";
// const webhookController = new WebhookController();

const router = express.Router();

import WebhookController from "../controllers/Webhooks/WebhookController";
import WooCommerceController from "../controllers/Webhooks/WooCommerceController";
import authenticate from "../middlewares/authenticate";
import { verifyWebhook } from "../middlewares/verifyWebhook";
import ShopifyController from "../controllers/Webhooks/ShopifyController";
import bodyParser from "body-parser";

const webhookController = new WebhookController();

const wooCommerceController = new WooCommerceController();

const shopifyController = new ShopifyController();

const rawBodyParser = bodyParser.raw({ type: "application/json" });

// get all channel data
router.get(
    "/channels",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        webhookController.getAllChannels(req, res, next),
);
router.get(
    "/channel/:channelId",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        webhookController.getChannelById(req, res, next),
);

// Woocommerce webhook receiver
router.post(
    "/woocommerce/register",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        wooCommerceController.registerChannel(req, res, next),
);

// Register Shopify channel
router.post("/shopify/register", authenticate, (req, res, next) =>
    shopifyController.registerChannel(req, res, next),
);

router.post(
    "/:channelName/:companyId",
    verifyWebhook,
    (req: Request, res: Response, next: NextFunction) =>
        webhookController.receiveWebhook(req, res, next),
);

// Handle incoming Shopify webhooks
// router.post(
//     "/:channelName/:companyId",
//     verifyShopifyWebhook,
//     (req, res) => {
//         console.log("Shopify webhook event received:", req.body);
//         res.status(200).send("Webhook verified and processed.");
//     },
// );

// router.post(
//     "/woocommerce",
//     webhookController.handleWooCommerceWebhook.bind(webhookController),
// );
// router.post(
//     "/shopify",
//     webhookController.handleShopifyWebhook.bind(webhookController),
// );

export default router;
