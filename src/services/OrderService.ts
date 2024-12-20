import { IOrder, Order, OrderStatus } from "../models/orderChannel/orderModel";
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
            logger.error("Error creating order", { error, orderData });
            throw new Error("Failed to create order");
        }
    }

    async getOrders(companyId: string, filters: OrderFilters) {
        try {
            // Build the query from filters and companyId
            const query = this.buildQuery(companyId, filters);

            // Extract pagination details
            const { page = 1, limit = 10 } = filters;
            const skip = (page - 1) * limit;

            // Fetch orders and total count
            const [orders, total] = await Promise.all([
                Order.find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }) // Sort by created date
                    .populate("customer") // Populate customer details
                    .populate("product"), // Populate product details
                Order.countDocuments(query), // Count total matching documents
            ]);

            // Return result with pagination
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
            logger.error("Error fetching orders", {
                error,
                companyId,
                filters,
            });
            throw new Error("Failed to fetch orders");
        }
    }

    async getOrderById(
        orderId: string,
        companyId: string,
    ): Promise<IOrder | null> {
        try {
            return await Order.findOne({ _id: orderId, companyId })
                .populate("customer")
                .populate("product");
        } catch (error) {
            logger.error(`Error fetching order with ID: ${orderId}`, {
                error,
                companyId,
            });
            throw new Error(`Failed to fetch order with ID: ${orderId}`);
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
            logger.error(`Error updating order with ID: ${orderId}`, {
                error,
                companyId,
                orderData,
            });
            throw new Error(`Failed to update order with ID: ${orderId}`);
        }
    }

    async deleteOrder(orderId: string, companyId: string): Promise<void> {
        try {
            await Order.findOneAndDelete({ _id: orderId, companyId });
        } catch (error) {
            logger.error(`Error deleting order with ID: ${orderId}`, {
                error,
                companyId,
            });
            throw new Error(`Failed to delete order with ID: ${orderId}`);
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
            logger.error(`Error updating order status with ID: ${orderId}`, {
                error,
                companyId,
                status,
            });
            throw new Error(`Failed to update order status for ID: ${orderId}`);
        }
    }

    async getOrdersWithPagination(filters: any, skip: number, limit: number) {
        const [orders, total] = await Promise.all([
            Order.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "customer",
                    select: "name phone email _id sku", // Specify only the required fields from the customer
                })
                .populate({
                    path: "products.product", // Populate the productId field inside the products array
                    select: "name price image", // Specify only the required fields from the product
                }),
            Order.countDocuments(filters), // Count the number of orders
        ]);

        return {
            data: orders,
            pagination: {
                total,
                page: Math.ceil(skip / limit) + 1,
                limit,
            },
        };
    }

    private buildQuery(companyId: string, filters: OrderFilters): any {
        const { status, startDate, endDate, district, division, search } =
            filters;

        // Base query with companyId
        const query: any = { companyId };

        // Add filters conditionally
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

        return query;
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
            [OrderStatus.RTO]: "",
            [OrderStatus.PICKUP_REQUESTED]: "",
            [OrderStatus.ASSIGNED_FOR_PICKUP]: "",
            [OrderStatus.PICKED]: "",
            [OrderStatus.PICKUP_FAILED]: "",
            [OrderStatus.PICKUP_CANCELLED]: "",
            [OrderStatus.AT_THE_SORTING_HUB]: "",
            [OrderStatus.RECEIVED_AT_LAST_MILE_HUB]: "",
            [OrderStatus.ASSIGNED_FOR_DELIVERY]: "",
            [OrderStatus.PARTIAL_DELIVERY]: "",
            [OrderStatus.RETURN]: "",
            [OrderStatus.DELIVERY_FAILED]: "",
            [OrderStatus.PAYMENT_INVOICE]: "",
            [OrderStatus.PAID_RETURN]: "",
            [OrderStatus.EXCHANGE]: "",
        };
        return statusDateMap[status] || null;
    }
}
