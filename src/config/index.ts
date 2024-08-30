import * as dotenv from "dotenv";
import path from "path";

// Load the correct .env file based on NODE_ENV
dotenv.config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

// Destructure environment variables after loading the config
const {
    PORT,
    NODE_ENV,
    MAIN_DOMAIN,
    API_GATEWAY,
    FRONTEND_URL,
    DB_URI,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASS,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,

    SMS_SENDER_ID,

    BKASH_USERNAME,
    BKASH_PASSWORD,
    BKASH_API_KEY,
    BKASH_SECRET_KEY,
    BKASH_GRANT_TOKEN_URL,
    BKASH_CREATE_PAYMENT_URL,
    BKASH_EXECUTE_PAYEMNT_URL,
    BKASH_REFUND_TRANSACTION_URL,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    MAIN_DOMAIN,
    API_GATEWAY,
    FRONTEND_URL,
    DB_URI,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASS,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,

    SMS_SENDER_ID,

    BKASH_USERNAME,
    BKASH_PASSWORD,
    BKASH_API_KEY,
    BKASH_SECRET_KEY,
    BKASH_GRANT_TOKEN_URL,
    BKASH_CREATE_PAYMENT_URL,
    BKASH_EXECUTE_PAYEMNT_URL,
    BKASH_REFUND_TRANSACTION_URL,
};
