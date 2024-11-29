import { Order, IOrder, OrderStatus } from "../models/orderModel";
import logger from "../utils/logger";

interface OrderFilters {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    district?: string;
    division?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export class OrderService {
    async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
        try {
            const order = new Order(orderData);
            return await order.save();
        } catch (error) {
            logger.error("Error creating order:", error);
            throw error;
        }
    }

    async getOrders(companyId: string, filters: OrderFilters) {
        try {
            const {
                status,
                startDate,
                endDate,
                district,
                division,
                search,
                page = 1,
                limit = 10,
            } = filters;

            const query: any = { companyId };

            if (status) query.status = status;
            if (district) query["shipping.district"] = district;
            if (division) query["shipping.division"] = division;
            if (startDate && endDate) {
                query["dates.orderDate"] = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }
            if (search) {
                query.$or = [
                    { internalId: new RegExp(search, "i") },
                    { "customer.name": new RegExp(search, "i") },
                    { "customer.phone": new RegExp(search, "i") },
                ];
            }

            const skip = (page - 1) * limit;

            const [orders, total] = await Promise.all([
                Order.find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Order.countDocuments(query),
            ]);

            return {
                orders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error("Error fetching orders:", error);
            throw error;
        }
    }

    async getOrderById(
        orderId: string,
        companyId: string,
    ): Promise<IOrder | null> {
        try {
            return await Order.findOne({ _id: orderId, companyId });
        } catch (error) {
            logger.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    }

    async updateOrder(
        orderId: string,
        companyId: string,
        orderData: Partial<IOrder>,
    ): Promise<IOrder | null> {
        try {
            return await Order.findOneAndUpdate(
                { _id: orderId, companyId },
                { $set: orderData },
                { new: true },
            );
        } catch (error) {
            logger.error(`Error updating order ${orderId}:`, error);
            throw error;
        }
    }

    async deleteOrder(orderId: string, companyId: string): Promise<void> {
        try {
            await Order.findOneAndDelete({ _id: orderId, companyId });
        } catch (error) {
            logger.error(`Error deleting order ${orderId}:`, error);
            throw error;
        }
    }

    async updateOrderStatus(
        orderId: string,
        companyId: string,
        status: OrderStatus,
    ): Promise<IOrder | null> {
        try {
            const dateField = this.getStatusDateField(status);
            const update: any = {
                status,
                updatedAt: new Date(),
            };

            if (dateField) {
                update[`dates.${dateField}`] = new Date();
            }

            return await Order.findOneAndUpdate(
                { _id: orderId, companyId },
                { $set: update },
                { new: true },
            );
        } catch (error) {
            logger.error(`Error updating order status ${orderId}:`, error);
            throw error;
        }
    }

    private getStatusDateField(status: OrderStatus): string | null {
        const statusDateMap: Record<OrderStatus, string> = {
            [OrderStatus.APPROVED]: "approvedAt",
            [OrderStatus.PROCESSING]: "processedAt",
            [OrderStatus.SHIPPED]: "shippedAt",
            [OrderStatus.DELIVERED]: "deliveredAt",
            [OrderStatus.CANCELLED]: "cancelledAt",
            [OrderStatus.IN_TRANSIT]: "shippedAt",
            [OrderStatus.FLAGGED]: "",
            [OrderStatus.PENDING]: "",
            [OrderStatus.ON_HOLD]: "",
            [OrderStatus.RETURNED]: "",
        };
        return statusDateMap[status] || null;
    }
}
