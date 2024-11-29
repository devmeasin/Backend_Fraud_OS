import { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { OrderService } from "../services/OrderService";
import { OrderStatus } from "../models/orderModel";
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
        const cid = req.body.companyId || authReq.auth.cid;

        await checkSchema(createOrderSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        if (!cid) {
            return res
                .status(400)
                .json({ success: false, message: "Company ID is required" });
        }

        try {
            // Step 1: Check if customer exists
            let customer = await Customer.findOne({
                phone: req.body.customerPhone,
                companyId: cid,
            });

            // Step 2: If customer doesn't exist, create a new customer
            if (!customer) {
                customer = new Customer({
                    phone: req.body.customerPhone,
                    companyId: cid,
                    ...req.body.customer, // Include additional customer fields (e.g., name, email, address)
                });
                await customer.save();
            }

            const orderData = {
                ...req.body,
                companyId: cid,
                customerId: customer._id,
                dates: {
                    ...req.body.dates,
                    orderDate: new Date(),
                },
            };

            customer.salesOrderCount = (customer.salesOrderCount || 0) + 1;
            await customer.save();

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
                page,
                limit,
            } = req.query;

            const filters = {
                status: status as OrderStatus,
                startDate: startDate
                    ? new Date(startDate as string)
                    : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                district: district as string,
                division: division as string,
                search: search as string,
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10,
            };

            const result = await this.orderService.getOrders(cid, filters);
            return res.json({
                success: true,
                data: result.orders,
                pagination: result.pagination,
            });
        } catch (error) {
            logger.error("Get orders error:", error);
            return res.status(500).json({
                success: false,
                message: "Error fetching orders",
                error: error instanceof Error ? error.message : "Unknown error",
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
