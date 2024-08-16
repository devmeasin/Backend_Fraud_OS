import { Schema } from "express-validator";

export const genarateOTPShema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD || customer_number",
    },
};
