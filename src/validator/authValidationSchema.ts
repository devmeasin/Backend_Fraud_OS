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
        isEmail: true,
        errorMessage: "Invalid email format",
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

// Define other schemas like OTP verification, password reset, etc.
