import { Schema } from "express-validator";

export const verifyOTPShema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD || customer_number",
    },
    otp: {
        in: ["body"],
        isLength: {
            options: { min: 4, max: 4 },
        },
        errorMessage: "OTP field value is missing!",
    },
};
