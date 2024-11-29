import { Order, OrderSource } from "../models/orderModel";

export class WebhookService {
    async handleWooCommerceWebhook(payload: any) {
        try {
            const orderData = this.transformWooCommerceOrder(payload);
            return await Order.create(orderData);
        } catch (error) {
            throw new Error(`Failed to process WooCommerce webhook: `);
        }
    }

    async handleShopifyWebhook(payload: any) {
        try {
            const orderData = this.transformShopifyOrder(payload);
            return await Order.create(orderData);
        } catch (error) {
            throw new Error(`Failed to process Shopify webhook: `);
        }
    }

    private transformWooCommerceOrder(payload: any) {
        return {
            internalId: `SO-${String(payload.shortId).padStart(4, "0")}`,
            externalId: payload.referenceId,
            source: OrderSource.WOOCOMMERCE,

            customer: {
                name: payload.distributor.name,
                phone: payload.distributor.phone,
                userId: payload.distributor.userId,
            },

            shipping: {
                address: payload.location.address,
                district: payload.location.district,
                division: payload.location.division,
                postCode: payload.location.postCode,
                country: payload.location.country,
                latitude: payload.location.latitude,
                longitude: payload.location.longitude,
            },

            amounts: {
                subtotal: Number(payload.totalAmount),
                discount: Number(payload.discountAmount),
                deliveryCharge: Number(payload.deliveryCharge),
                total: Number(payload.totalAmount),
            },

            payment: {
                method: payload.paymentMethod,
                paid: Number(payload.totalPaidAmount),
                due: Number(payload.totalDueAmount),
            },

            dates: {
                orderDate: new Date(payload.orderDate),
                deliveryDate: payload.deliveryDate
                    ? new Date(payload.deliveryDate)
                    : null,
                approvedAt: payload.approvedAt
                    ? new Date(payload.approvedAt)
                    : null,
                cancelledAt: payload.cancelledAt
                    ? new Date(payload.cancelledAt)
                    : null,
            },

            metadata: {
                sourceUrl: payload.metadata?.sourceUrl,
                integrationId: payload.integrationId,
                notes: payload.internalNotes || [],
            },

            companyId: payload.companyId,
        };
    }

    private transformShopifyOrder(payload: any) {
        // Similar transformation for Shopify orders
        // Implementation will depend on Shopify's webhook payload structure
    }
}
