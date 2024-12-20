import { Schema } from "express-validator";
import {
    OrderSource,
    OrderStatus,
    PaymentMethod,
} from "../models/orderChannel/orderModel";

export const createOrderSchema: Schema = {
    companyId: {
        in: ["body"],
        isString: true,
        optional: true,
        notEmpty: {
            errorMessage: "Company ID is required",
        },
    },
    customerPhone: {
        in: ["body"],
        isString: true,
        notEmpty: {
            errorMessage: "Customer phone is required",
        },
    },
    customer: {
        in: ["body"],
        isObject: true,
        notEmpty: {
            errorMessage: "Customer ID is required",
        },
    },
    "products.*.product": {
        in: ["body"],
        isString: true,
        notEmpty: {
            errorMessage: "Product ID is required",
        },
    },
    "products.*.quantity": {
        in: ["body"],
        isInt: {
            options: { min: 1 },
            errorMessage: "Quantity must be at least 1",
        },
        toInt: true,
    },
    "shippingAddress.address": {
        in: ["body"],
        isString: true,
        notEmpty: {
            errorMessage: "Shipping address is required",
        },
    },
    "shippingAddress.district": {
        in: ["body"],
        isString: true,
        optional: true,
    },
    "shippingAddress.division": {
        in: ["body"],
        isString: true,
        optional: true,
    },
    "amounts.totalAmount": {
        in: ["body"],
        notEmpty: {
            errorMessage: "Total amount is required",
        },
    },
    // "payment.method": {
    //     in: ["body"],
    //     optional: true,
    //     isString: true,
    //     isIn: {
    //         options: Object.values(PaymentMethod),
    //         errorMessage: "Invalid payment method",
    //     },
    // },

    "payment.due": {
        in: ["body"],
        optional: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: "Payment due must be a non-negative number",
        },
        toFloat: true,
    },
    source: {
        in: ["body"],
        isString: {
            errorMessage: "Order source must be a string",
        },
        optional: true,
        custom: {
            options: (value) => {
                const validSources = [
                    "WOOCOMMERCE",
                    "SHOPIFY",
                    "DARAZ",
                    "SYSTEM",
                    "WEBSITE",
                    "OTHER",
                    "WHATSAPP",
                    "MESSENGER",
                    "PHONE_CALL",
                    "UNKNOWN",
                ];
                if (!validSources.includes(value)) {
                    throw new Error("Invalid order source");
                }
                return true;
            },
        },
    },

    additionalNotes: {
        in: ["body"],
        optional: true,
        isString: true,
    },
};

export const updateOrderSchema: Schema = {
    status: {
        in: ["body"],
        optional: true,
        isString: true,
        isIn: {
            options: Object.values(OrderStatus),
            errorMessage: "Invalid status",
        },
    },
    "products.*.product": {
        in: ["body"],
        optional: true,
        isString: true,
        notEmpty: {
            errorMessage: "Product ID cannot be empty",
        },
    },
    "products.*.quantity": {
        in: ["body"],
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: "Quantity must be at least 1",
        },
        toInt: true,
    },
    "shippingAddress.address": {
        in: ["body"],
        optional: true,
        isString: true,
    },
    "shippingAddress.district": {
        in: ["body"],
        optional: true,
        isString: true,
    },
    "shippingAddress.division": {
        in: ["body"],
        optional: true,
        isString: true,
    },
    "payment.method": {
        in: ["body"],
        optional: true,
        isString: true,
        isIn: {
            options: Object.values(PaymentMethod),
            errorMessage: "Invalid payment method",
        },
    },
    "payment.due": {
        in: ["body"],
        optional: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: "Payment due must be a non-negative number",
        },
        toFloat: true,
    },
    additionalNotes: {
        in: ["body"],
        optional: true,
        isString: true,
    },
};
