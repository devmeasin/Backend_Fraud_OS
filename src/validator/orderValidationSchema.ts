import { checkSchema, Schema } from "express-validator";
import { OrderStatus, PaymentMethod, OrderSource } from "../models/orderModel";

export const createOrderSchema: Schema = {
    customerPhone: {
        in: ["body"],
        isString: true,
        optional: true,
        notEmpty: {
            errorMessage: "Customer phone is required",
        },
    },
    customerId: {
        in: ["body"],
        isString: true,
        optional: true,
        notEmpty: {
            errorMessage: "Customer ID is required",
        },
    },
    productId: {
        in: ["body"],
        isString: true,
        optional: true,
        notEmpty: {
            errorMessage: "Product ID is required",
        },
    },
    quantity: {
        in: ["body"],
        isInt: {
            options: { min: 1 },
            errorMessage: "Quantity must be at least 1",
        },
        toInt: true,
        optional: true,
    },
    paymentMethod: {
        in: ["body"],
        isString: true,
        isIn: {
            options: [
                [PaymentMethod.CREDIT_CARD, PaymentMethod.CASH_ON_DELIVERY],
            ],
            errorMessage: "Invalid payment method",
        },
        optional: true,
    },
    source: {
        in: ["body"],
        isString: true,
        isIn: {
            options: [[OrderSource.WEBSITE]],
            errorMessage: "Invalid order source",
        },
    },
};

export const updateOrderSchema: Schema = {
    productId: {
        in: ["body"],
        optional: true,
        isString: true,
        notEmpty: {
            errorMessage: "Product ID cannot be empty",
        },
    },
    quantity: {
        in: ["body"],
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: "Quantity must be at least 1",
        },
        toInt: true,
    },
    status: {
        in: ["body"],
        optional: true,
        isString: true,
        isIn: {
            options: [
                [
                    OrderStatus.PENDING,
                    OrderStatus.SHIPPED,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCELLED,
                ],
            ],
            errorMessage: "Invalid status",
        },
    },
};
