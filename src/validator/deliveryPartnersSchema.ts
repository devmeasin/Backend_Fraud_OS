import { Schema } from "express-validator";

export const DeliveryPartnerSchema: Schema = {
    partnerId: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Partner ID is required",
        },
        optional: true,
        isString: {
            errorMessage: "Partner ID must be a string",
        },
    },
    type: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Type is required",
        },
        isString: {
            errorMessage: "Type must be a string",
        },
    },
    name: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Name is required",
        },
        isString: {
            errorMessage: "Name must be a string",
        },
    },
    contactPerson: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Contact Person is required",
        },
        isString: {
            errorMessage: "Contact Person must be a string",
        },
    },
    phone: {
        in: ["body"],
        notEmpty: {
            errorMessage: "Phone is required",
        },
        isMobilePhone: {
            errorMessage: "Invalid phone number",
        },
    },
    charges: {
        in: ["body"],
        optional: true,
        isArray: {
            errorMessage: "Charges must be an array",
        },
    },
    "charges.*.boundary": {
        in: ["body"],
        optional: true,
        isIn: {
            options: [["INSIDE", "OUTSIDE", "SUBURB"]],
            errorMessage: "Invalid boundary type",
        },
    },
    "charges.*.charge": {
        in: ["body"],
        optional: true,
        isNumeric: {
            errorMessage: "Charge must be a numeric value",
        },
    },
};
