import { Schema } from "express-validator";

export const registerSchema: Schema = {
    // username: {
    //   in: ['body'],
    //   isString: true,
    //   isLength: {
    //     options: { min: 3 },
    //   },
    //   errorMessage: 'Username should be at least 3 characters long',
    // },
    fullName: {
        in: ["body"],
        isString: true,
        errorMessage: "fullName Name Reqired!",
    },

    companyName: {
        in: ["body"],
        isString: true,
        errorMessage: "companyName Reqired",
    },

    companyWebsite: {
        in: ["body"],
        isString: true,
        errorMessage: "companyWebsite Reqired",
    },

    email: {
        in: ["body"],
        trim: true, // This trims the whitespace from the input
        isEmail: {
            errorMessage: "Invalid email format",
        },
    },
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD",
    },
    password: {
        in: ["body"],
        isLength: {
            options: { min: 8 },
        },
        errorMessage: "password should be at least 8 chars",
    },
};

export const loginSchema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD",
    },
    password: {
        in: ["body"],
        isLength: {
            options: { min: 8 },
        },
        errorMessage: "Password field value is missing!",
    },
};

export const forgetPasswordSchema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD",
    },
};

export const resetPasswordSchema: Schema = {
    phone: {
        in: ["body"],
        isMobilePhone: {
            options: ["bn-BD"],
        },
        errorMessage: "Invalid phone number format for BD",
    },
    otp: {
        in: ["body"],
        isLength: {
            options: { min: 4, max: 4 },
        },
        errorMessage: "OTP",
    },
    newPassword: {
        in: ["body"],
        isLength: {
            options: { min: 8 },
            errorMessage: "Password must be at least 8 characters long",
        },
    },
};

// Define other schemas like OTP verification, password reset, etc.
