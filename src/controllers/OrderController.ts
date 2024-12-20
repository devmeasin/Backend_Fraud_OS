import { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { OrderService } from "../services/OrderService";
import { OrderStatus } from "../models/orderChannel/orderModel";
import { AuthRequest } from "../types";
import logger from "../utils/logger";
import {
    createOrderSchema,
    updateOrderSchema,
} from "../validator/orderValidationSchema";
import Customer from "../models/customerModel";
export class OrderController {
    constructor(private orderService: OrderService) {}

    async createOrder(req: Request, res: Response) {
        const authReq = req as AuthRequest;
        const cid = authReq.auth.cid || req.body.companyId;

        await checkSchema(createOrderSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        if (!cid) {
            return res.status(400).json({
                success: false,
                message: "Company ID is required",
            });
        }

        try {
            // Check required products and amounts
            if (!req.body.products || req.body.products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one product is required",
                });
            }

            if (!req.body.amounts || !req.body.amounts.totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: "Order amounts are required",
                });
            }

            // Step 1: Check or create customer
            let customer = await Customer.findOne({
                companyId: cid,
                phone: req.body.customerPhone,
            });

            if (!customer) {
                customer = new Customer({
                    phone: req.body.customerPhone,
                    companyId: cid,
                    ...req.body.customer,
                });
                await customer.save();
            }

            // Step 2: Prepare order data
            const orderData = {
                ...req.body,
                companyId: cid,
                customer: customer._id,
                dates: { orderDate: new Date() },
            };

            // Increment customer order count
            customer.salesOrderCount = (customer.salesOrderCount || 0) + 1;
            await customer.save();

            // Step 3: Create the order
            const order = await this.orderService.createOrder(orderData);
            logger.info(`Order created successfully: ${order.internalId}`);

            return res.status(201).json({
                success: true,
                data: order,
            });
        } catch (error) {
            logger.error("Create order error:", error);
            return res.status(500).json({
                success: false,
                message: "Error creating order",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async getOrders(req: AuthRequest, res: Response) {
        try {
            const cid = req.auth.cid;
            const {
                status,
                startDate,
                endDate,
                district,
                division,
                search,
                page = 1,
                limit = 10,
            } = req.query;

            // Build filters
            const filters: any = {
                companyId: cid,
            };

            if (status) filters.status = status.toString().toUpperCase();
            if (startDate || endDate) {
                filters.createdAt = {
                    ...(startDate
                        ? { $gte: new Date(startDate as string) }
                        : {}),
                    ...(endDate ? { $lte: new Date(endDate as string) } : {}),
                };
            }
            if (district) filters["shippingAddress.district"] = district;
            if (division) filters["shippingAddress.division"] = division;
            if (search) filters.$text = { $search: search as string };

            // Pagination settings
            const skip =
                (parseInt(page as string, 10) - 1) *
                parseInt(limit as string, 10);
            const orders = await this.orderService.getOrdersWithPagination(
                filters,
                skip,
                parseInt(limit as string, 10),
            );

            return res.json({
                success: true,
                data: orders.data,
                pagination: orders.pagination,
            });
        } catch (error) {
            logger.error("Error fetching orders:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching orders",
            });
        }
    }

    async getOrderById(req: AuthRequest, res: Response) {
        try {
            const cid = req.auth.cid;
            const { orderId } = req.params;

            const order = await this.orderService.getOrderById(orderId, cid);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
            }

            return res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            logger.error(
                `Get order error for ID ${req.params.orderId}:`,
                error,
            );
            return res.status(500).json({
                success: false,
                message: "Error fetching order",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async updateOrder(req: AuthRequest, res: Response) {
        await checkSchema(updateOrderSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        try {
            const cid = req.auth.cid;
            const { orderId } = req.params;
            const updateData = req.body;

            const order = await this.orderService.updateOrder(
                orderId,
                cid,
                updateData,
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
            }

            logger.info(`Order updated successfully: ${order.internalId}`);
            return res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            logger.error(
                `Update order error for ID ${req.params.orderId}:`,
                error,
            );
            return res.status(500).json({
                success: false,
                message: "Error updating order",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async updateOrderStatus(req: AuthRequest, res: Response) {
        try {
            const cid = req.auth.cid;
            const { orderId } = req.params;
            const { status } = req.body;

            if (!Object.values(OrderStatus).includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order status",
                });
            }

            const order = await this.orderService.updateOrderStatus(
                orderId,
                cid,
                status,
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
            }

            logger.info(
                `Order status updated successfully: ${order.internalId} -> ${status}`,
            );
            return res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            logger.error(
                `Update order status error for ID ${req.params.orderId}:`,
                error,
            );
            return res.status(500).json({
                success: false,
                message: "Error updating order status",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    async deleteOrder(req: AuthRequest, res: Response) {
        try {
            const cid = req.auth.cid;
            const { orderId } = req.params;

            await this.orderService.deleteOrder(orderId, cid);

            logger.info(`Order deleted successfully: ${orderId}`);
            return res.json({
                success: true,
                message: "Order deleted successfully",
            });
        } catch (error) {
            logger.error(
                `Delete order error for ID ${req.params.orderId}:`,
                error,
            );
            return res.status(500).json({
                success: false,
                message: "Error deleting order",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
