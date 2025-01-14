import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Webhook } from "../../models/webhooks/webhookModel";
import { Product } from "../../models/productModel";
import { Order } from "../../models/orderChannel/orderModel";
import logger from "../../utils/logger";
import axios from "axios";
import { handleOrderEvent } from "../../services/Orders/OrderHandler";
import { handleProductEvent } from "../../services/Products/ProductHandler";

class WebhookController {
    async getAllChannels(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const channels = await Webhook.find({});
            logger.info(`fetch all channels data..`);
            res.status(200).json({
                message: "all webhooks channel data!",
                channels: channels,
            });
        } catch (error) {
            next(createHttpError(500, "failed to fetch all channels data.."));
        }
    }

    async getChannelById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { channelId } = req.params;

        try {
            const channelInfo = await Webhook.findById(channelId);
            logger.info(
                `fetch ${
                    channelInfo?._id as string
                } ${channelInfo?.channelName} channels data..`,
            );
            res.status(200).json({
                message: "webhooks channel data!",
                channel: channelInfo,
            });
        } catch (error) {
            next(createHttpError(500, "failed to fetch all channels data.."));
        }
    }
    /**
     * Handles incoming webhooks
     */

    // async receiveWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         const { channelName, companyId } = req.params;
    //         const topic = req.headers["x-wc-webhook-topic"] || req.headers["x-shopify-topic"];
    //         const payload = req.body;

    //         if (!topic) {
    //             throw createHttpError(400, "Missing webhook topic.");
    //         }

    //        // Extract the company ID from the parameter
    //        const cid = companyId.split("-")[0];

    //         logger.info(`Received webhook for topic: ${topic.toString()}, companyId: ${cid}`);

    //         const isShopify = channelName.toLowerCase() === "shopify";
    //         const isWooCommerce = channelName.toLowerCase() === "woocommerce";

    //         if (isShopify) {
    //             await this.handleShopifyWebhook(topic as string, payload, cid);
    //         } else if (isWooCommerce) {
    //             await this.handleWooCommerceWebhook(topic as string, payload, cid);
    //         } else {
    //             logger.warn(`Unsupported channel: ${channelName}`);
    //             throw createHttpError(400, `Unsupported channel: ${channelName}`);
    //         }

    //         res.status(200).json({ message: `Webhook processed successfully ${topic.toString()}` });
    //     } catch (error) {
    //         logger.error(`Error processing webhook:`, { error });
    //         next(error);
    //     }
    // }

    // // Handles Shopify-specific webhook topics
    // async handleShopifyWebhook(topic: string, payload: any, companyId: string) {
    //     switch (topic) {
    //         case "orders/create":
    //         case "orders/updated":
    //             await this.processOrder(payload, companyId, "Shopify");
    //             break;
    //         case "products/create":
    //         case "products/update":
    //             await this.processProduct(payload, companyId, "Shopify");
    //             break;
    //         default:
    //             logger.info(`Unhandled Shopify topic: ${topic}`);
    //     }
    // }

    // // Handles WooCommerce-specific webhook topics
    // async handleWooCommerceWebhook(topic: string, payload: any, companyId: string) {
    //     switch (topic) {
    //         case "order.created":
    //         case "order.updated":
    //             await this.processOrder(payload, companyId, "WooCommerce");
    //             break;
    //         case "product.created":
    //         case "product.updated":
    //             await this.processProduct(payload, companyId, "WooCommerce");
    //             break;
    //         default:
    //             logger.info(`Unhandled WooCommerce topic: ${topic}`);
    //     }
    // }

    // // Process product data
    // async processProduct(payload: any, companyId: string, platform: string) {
    //     const existingProduct = await Product.findOne({
    //         integrationId: payload.id.toString(),
    //         externalPlatform: platform,
    //         companyId,
    //     });

    //     const productData = this.mapProductPayloadToSchema(payload, platform, companyId);

    //     if (existingProduct) {
    //         await Product.updateOne({ _id: existingProduct._id }, productData);
    //         logger.info(`Updated product: ${existingProduct.name}`);
    //     } else {
    //         await Product.create(productData);
    //         logger.info(`Created product: ${productData.name}`);
    //     }
    // }

    // // Process order data
    // async processOrder(payload: any, companyId: string, platform: string) {

    //     const existingOrder = await Order.findOne({
    //         externalId: payload.id.toString(),
    //         source: platform.toUpperCase(),
    //         companyId,
    //     });

    //     const productIds = await this.getProductIdsFromOrder(payload, companyId, platform);

    //     const orderData = this.mapOrderPayloadToSchema(payload, productIds, companyId, platform);

    //     if (existingOrder) {
    //         await Order.updateOne({ _id: existingOrder._id }, orderData);
    //         logger.info(`Updated order: ${existingOrder.internalId}`);
    //     } else {
    //         await Order.create(orderData);
    //         logger.info(`Created order: ${orderData?.internalId}`);
    //     }
    // }

    // // Pull products from platform if missing in the database
    // async getProductIdsFromOrder(orderPayload: any, companyId: string, platform: string) {
    //     const productIds = [];
    //     for (const lineItem of orderPayload.line_items || []) {
    //         const product = await Product.findOne({
    //             integrationId: lineItem.product_id.toString(),
    //             externalPlatform: platform.toUpperCase(),
    //             companyId,
    //         });

    //         if (product) {
    //             productIds.push({ productId: product._id, quantity: lineItem.quantity });
    //         } else {
    //             logger.info(`Product not found: ${lineItem.product_id}, pulling from ${platform}`);
    //             const fetchedProduct = await this.fetchProductFromPlatform(lineItem.product_id, platform);
    //             if (fetchedProduct) {
    //                 const newProduct = await Product.create(
    //                     this.mapProductPayloadToSchema(fetchedProduct, platform, companyId),
    //                 );
    //                 productIds.push({ productId: newProduct._id, quantity: lineItem.quantity });
    //             } else {
    //                 logger.warn(`Unable to fetch product: ${lineItem.product_id}`);
    //             }
    //         }
    //     }
    //     return productIds;
    // }

    // // Fetch product data from platform API
    // async fetchProductFromPlatform(productId: string, platform: string) {
    //     if (platform === "Shopify") {
    //         // Shopify API call to fetch product details
    //         const response = await axios.get(
    //             `https://your-shopify-store.myshopify.com/admin/api/2023-01/products/${productId}.json`,
    //             {
    //                 headers: { "X-Shopify-Access-Token": "your-access-token" },
    //             },
    //         );
    //         return response.data.product as any;

    //     } else if (platform === "WooCommerce") {
    //         // WooCommerce API call to fetch product details
    //         const response = await axios.get(
    //             `https://your-woocommerce-store.com/wp-json/wc/v3/products/${productId}`,
    //             {
    //                 auth: {
    //                     username: "consumer_key",
    //                     password: "consumer_secret",
    //                 },
    //             },
    //         );
    //         return response.data as any;
    //     }
    //     return null;
    // }

    // // Map product payload to database schema
    // mapProductPayloadToSchema(payload: any, platform: string, companyId: string) {
    //     return {
    //         name: payload.title || payload.name,
    //         slug: payload.handle || payload.slug,
    //         companyId,
    //         imageUrls: payload.images?.map((img: any) => img.src) || [],
    //         price: parseFloat(payload.variants?.[0]?.price || payload.price || 0),
    //         sku: payload.sku || "",
    //         stockQuantity: payload.variants?.reduce((sum: number, variant: any) => sum + variant.inventory_quantity, 0) || 0,
    //         integrationId: payload.id.toString(),
    //         externalPlatform: platform,
    //         metadata: payload,
    //     };
    // }

    // // Map order payload to database schema
    // mapOrderPayloadToSchema(payload: any, productIds: any[], companyId: string, platform: string) {
    //     return {
    //         companyId,
    //         internalId: payload?.id.toString(),
    //         source: platform.toUpperCase(),
    //         status: payload.financial_status?.toUpperCase() || "PENDING",
    //         customerPhone: payload.shipping_address?.phone || "",
    //         shippingAddress: {
    //             address: payload.shipping_address?.address1 || "",
    //             district: payload.shipping_address?.city || "",
    //             division: payload.shipping_address?.province || "",
    //             postCode: payload.shipping_address?.zip || "",
    //             country: payload.shipping_address?.country || "",
    //         },
    //         products: productIds,
    //         amounts: {
    //             subTotal: parseFloat(payload.subtotal_price || 0),
    //             totalAmount: parseFloat(payload.total_price || 0),
    //             discount: parseFloat(payload.total_discounts || 0),
    //             deliveryCharge: parseFloat(payload.total_shipping_price || 0),
    //         },
    //         payment: {
    //             method: payload.payment_gateway_names?.[0]?.toUpperCase() || "CASH_ON_DELIVERY",
    //             paid: parseFloat(payload.total_price || 0),
    //             due: 0,
    //         },
    //         metadata: { sourceUrl: payload.order_status_url, notes: [] },
    //     };
    // }

    async receiveWebhook(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { channelName, companyId } = req.params;
            const topic =
                req.headers["x-wc-webhook-topic"] ||
                req.headers["x-shopify-topic"];
            const payload = req.body;

            if (!topic) {
                throw new Error("Missing webhook topic");
            }

            // Extract the company ID from the parameter
            const cid = companyId.split("-")[0];

            // Retrieve the webhook configuration from the database
            const webhook = await Webhook.findOne({
                companyId: cid,
                channelName: new RegExp(`^${channelName}`, "i"),
                // deliveryUrl: req.originalUrl,
                enabled: true,
            });

            if (channelName.toLowerCase() === "shopify") {
                await this.handleShopifyWebhook(
                    topic.toString(),
                    payload,
                    cid,
                    webhook,
                );
            } else if (channelName.toLowerCase() === "woocommerce") {
                await this.handleWooCommerceWebhook(
                    topic.toString(),
                    payload,
                    cid,
                    webhook,
                );
            } else {
                throw new Error("Unsupported channel");
            }

            res.status(200).json({ message: "Webhook processed successfully" });
        } catch (error) {
            next(error);
        }
    }

    async handleShopifyWebhook(
        topic: string,
        payload: any,
        companyId: string,
        webhook: any,
    ) {
        if (["orders/create", "orders/updated"].includes(topic)) {
            await handleOrderEvent(payload, "Shopify", companyId, webhook);
        } else if (["products/create", "products/update"].includes(topic)) {
            await handleProductEvent(payload, "Shopify", companyId, webhook);
        }
    }

    async handleWooCommerceWebhook(
        topic: string,
        payload: any,
        companyId: string,
        webhook: any,
    ) {
        if (["order.created", "order.updated"].includes(topic)) {
            await handleOrderEvent(payload, "WooCommerce", companyId, webhook);
        } else if (["product.created", "product.updated"].includes(topic)) {
            await handleProductEvent(
                payload,
                "WooCommerce",
                companyId,
                webhook,
            );
        }
    }
}

export default WebhookController;
