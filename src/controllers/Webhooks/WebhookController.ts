import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Webhook } from "../../models/webhooks/webhookModel";
import { Product } from "../../models/productModel";
import { Order } from "../../models/orderChannel/orderModel";
import logger from "../../utils/logger";

class WebhookController {
    /**
     * Handles incoming webhooks
     */
    async receiveWebhook(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { channelName, companyId } = req.params;
            const topic = req.headers["x-wc-webhook-topic"] as string;
            const payload = req.body;

            const cid = companyId.split("-")[0];

            // Find the correct webhook configuration
            const webhook = await Webhook.findOne({
                companyId: cid,
                channelName: new RegExp(`^${channelName}`, "i"),
                enabled: true,
            });

            if (!webhook) {
                logger.warn(
                    `Webhook not found or disabled for channelName: ${channelName}, companyId: ${companyId}`,
                );
                throw createHttpError(404, "Webhook not found or disabled");
            }

            // Process the event
            switch (topic) {
                case "product.created":
                case "product.updated":
                case "product.deleted":
                    await this.handleProductEvent(topic, payload, companyId);
                    break;
                case "order.created":
                case "order.updated":
                case "order.deleted":
                    await this.handleOrderEvent(topic, payload, companyId);
                    break;
                default:
                    logger.info(
                        `Unhandled topic: ${topic} for channelName: ${channelName}, companyId: ${companyId}`,
                    );
            }

            logger.info(
                `Webhook processed successfully for topic: ${topic}, channelName: ${channelName}, companyId: ${companyId}`,
            );
            res.status(200).json({ message: "Webhook processed successfully" });
        } catch (error) {
            logger.error(
                `Error processing webhook: ${
                    error instanceof Error ? error.message : error
                }`,
                {
                    error,
                },
            );
            next(error); // Pass the error to the error-handling middleware
        }
    }

    /**
     * Handles product-related events
     */
    private async handleProductEvent(
        topic: string,
        payload: any,
        companyId: string,
    ): Promise<void> {
        try {
            if (topic === "product.deleted") {
                await Product.deleteOne({
                    integrationId: payload.id,
                    companyId,
                });
                logger.info(
                    `Product deleted for integrationId: ${payload.id}, companyId: ${companyId}`,
                );
            } else {
                const update = {
                    name: payload.name,
                    slug: payload.slug,
                    price: payload.price,
                    salePrice: payload.sale_price || payload.price,
                    sku: payload.sku,
                    stockQuantity: payload.stock_quantity,
                    description: payload.description,
                    metadata: payload,
                };

                await Product.updateOne(
                    { integrationId: payload.id, companyId },
                    update,
                    { upsert: true },
                );

                logger.info(
                    `Product updated/created for integrationId: ${payload.id}, companyId: ${companyId}`,
                );
            }
        } catch (error) {
            logger.error(
                `Error handling product event: ${
                    error instanceof Error ? error.message : error
                }`,
                {
                    topic,
                    payload,
                    companyId,
                },
            );
            throw createHttpError(500, "Error processing product event");
        }
    }

    /**
     * Handles order-related events
     */
    private async handleOrderEvent(
        topic: string,
        payload: any,
        companyId: string,
    ): Promise<void> {
        try {
            if (topic === "order.deleted") {
                await Order.deleteOne({ integrationId: payload.id, companyId });
                logger.info(
                    `Order deleted for integrationId: ${payload.id}, companyId: ${companyId}`,
                );
            } else {
                const update = {
                    status: payload.status,
                    customerPhone: payload.billing.phone,
                    amounts: {
                        subTotal: payload.total,
                        totalAmount: payload.total,
                    },
                    metadata: payload,
                };

                await Order.updateOne(
                    { integrationId: payload.id, companyId },
                    update,
                    { upsert: true },
                );

                logger.info(
                    `Order updated/created for integrationId: ${payload.id}, companyId: ${companyId}`,
                );
            }
        } catch (error) {
            logger.error(
                `Error handling order event: ${
                    error instanceof Error ? error.message : error
                }`,
                {
                    topic,
                    payload,
                    companyId,
                },
            );
            throw createHttpError(500, "Error processing order event");
        }
    }
}

export default WebhookController;
