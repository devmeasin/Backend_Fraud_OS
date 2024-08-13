import { Schema } from "express-validator";

export const BDNumberShema: Schema = {
    customer_number: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD || customer_number",
    },
};
