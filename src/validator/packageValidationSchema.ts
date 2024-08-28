import { Schema } from "express-validator";

export const packageValidationSchema: Schema = {
    name: {
        in: ["body"],
        isString: {
            errorMessage: "Name must be a string",
        },
        notEmpty: {
            errorMessage: "Name is required",
        },
    },
    price: {
        in: ["body"],
        isNumeric: {
            errorMessage: "Price must be a number",
        },
        notEmpty: {
            errorMessage: "Price is required",
        },
        toFloat: true, // Convert to float
    },
    requestLimit: {
        in: ["body"],
        isInt: {
            errorMessage: "Request Limit must be an integer",
        },
        notEmpty: {
            errorMessage: "Request Limit is required",
        },
        toInt: true, // Convert to integer
    },
    packageType: {
        in: ["body"],
        isString: {
            errorMessage: "Package Type must be a string",
        },
        notEmpty: {
            errorMessage: "Package Type is required",
        },
    },
    validityDays: {
        in: ["body"],
        isInt: {
            errorMessage: "Validity Days must be an integer",
        },
        notEmpty: {
            errorMessage: "Validity Days is required",
        },
        toInt: true, // Convert to integer
    },
    apiAccess: {
        in: ["body"],
        optional: true, // Optional field
        isBoolean: {
            errorMessage: "API Access must be a boolean",
        },
        toBoolean: true, // Convert to boolean
    },
};
