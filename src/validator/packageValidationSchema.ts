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
        isString: {
            errorMessage: "Price must be a string",
        },
        notEmpty: {
            errorMessage: "Price is required",
        },
    },
    priceText: {
        in: ["body"],
        isString: {
            errorMessage: "Price must be a string",
        },
        notEmpty: {
            errorMessage: "Price is required",
        },
    },
    requestLimit: {
        in: ["body"],
        isInt: {
            errorMessage: "Request Limit must be an integer",
        },
        optional: true, // Optional since free packages may not have a request limit
        toInt: true, // Convert to integer
    },
    packageType: {
        in: ["body"],
        optional: true, // Optional field
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
    isUnlimited: {
        in: ["body"],
        optional: true, // Optional field
        isBoolean: {
            errorMessage: "isUnlimited must be a boolean",
        },
        toBoolean: true, // Convert to boolean
    },
    features: {
        in: ["body"],
        isArray: {
            errorMessage: "Features must be an array",
        },
        notEmpty: {
            errorMessage: "Features are required",
        },
    },
    unavailableFeatures: {
        in: ["body"],
        optional: true,
        isArray: {
            errorMessage: "Unavailable Features must be an array",
        },
    },
    isFree: {
        in: ["body"],
        isBoolean: {
            errorMessage: "isFree must be a boolean",
        },
        notEmpty: {
            errorMessage: "isFree is required",
        },
        toBoolean: true, // Convert to boolean
    },
    isPopular: {
        in: ["body"],
        isBoolean: {
            errorMessage: "isPopular must be a boolean",
        },
        notEmpty: {
            errorMessage: "isPopular is required",
        },
        toBoolean: true, // Convert to boolean
    },
    duration: {
        in: ["body"],
        isString: {
            errorMessage: "Duration must be a string",
        },
        notEmpty: {
            errorMessage: "Duration is required",
        },
    },
    discount: {
        in: ["body"],
        optional: true, // Optional field
        isString: {
            errorMessage: "Discount must be a string if provided",
        },
    },
};
