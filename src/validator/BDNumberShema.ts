import { Schema } from "express-validator";

export const BDNumberShema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD",
    },
};
