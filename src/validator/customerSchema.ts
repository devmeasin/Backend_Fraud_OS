import { Schema } from "express-validator";

export const CustomerSchema: Schema = {
    name: {
        in: ["body"],
        isString: true,
        notEmpty: true,
        trim: true,
        errorMessage: "Name is required",
    },
    phone: {
        in: ["body"],
        isString: true,
        notEmpty: true,
        trim: true,
        errorMessage: "Valid phone number is required",
    },
    email: {
        in: ["body"],
        optional: true,
        isEmail: true,
        trim: true,
        errorMessage: "Invalid email format",
    },
    type: {
        in: ["body"],
        optional: true,
        isIn: {
            options: [["E_COMMERCE_CUSTOMER", "DISTRIBUTOR", "RETAILER"]],
        },
        errorMessage: "Invalid customer type",
    },
    paymentMethod: {
        in: ["body"],
        optional: true,
        isIn: {
            options: [["CASH_ON_DELIVERY", "CASH", "OTHER"]],
        },
        errorMessage: "Invalid payment method",
    },
};
