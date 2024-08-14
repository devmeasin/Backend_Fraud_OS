import axios from "axios";
import { paperflyLogin } from "./loginService";
import { CourierURI } from "../../constants";
import logger from "../../utils/logger";
import { IPaperflyApiResponse } from "../../types";

const { fraud_check_url } = CourierURI.paperfly_url;

// Global variables to store token and expiration
let tokenData: { token: string; expires_at: number } | null = null;

// Helper function to check if the token is expired
const isTokenExpired = (
    tokenData: { token: string; expires_at: number } | null,
): boolean => {
    return !tokenData || Date.now() > tokenData.expires_at;
};

// Function to refresh the token
const accessToken = async (): Promise<{
    token: string;
    expires_at: number;
}> => {
    try {
        const loginData = await paperflyLogin();
        const expiresAt = Date.now() + 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds milliseconds
        return {
            token: loginData.token,
            expires_at: expiresAt,
        };
    } catch (error) {
        logger.error("Failed to access token", error);
        throw new Error("Failed to access token");
    }
};

// Function to make a request with the token, handling token retrieval and expiration
export const paperfly_makeRequestWithToken = async (
    customer_number: string,
) => {
    const payload = {
        search_text: customer_number,
    };

    try {
        // Check if the token is expired and refresh if necessary
        if (isTokenExpired(tokenData)) {
            tokenData = await accessToken(); // Refresh token
        }

        // Make the API request with the valid token
        const response = await axios.post(fraud_check_url, payload, {
            headers: { Authorization: `Bearer ${tokenData?.token}` },
        });

        return {
            ...response.data,
            code: response.status,
        } as IPaperflyApiResponse;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                logger.error(
                    "Axios Error Status: fetch data from Paperfl",
                    error.response.status,
                );
                logger.error(
                    "Axios Error Data: fetch data from Paperfly",
                    error.response.data,
                );
            } else if (error.request) {
                logger.error(
                    "Axios No Response: fetch data from Paperfly",
                    error.request,
                );
            } else {
                logger.error(
                    "Axios Error Message: fetch data from Paperfly",
                    error.message,
                );
            }
        } else {
            logger.error("Unexpected Error: fetch data from Paperfly", error);
        }
        throw new Error("Error fetching data from Paperfly");
    }
};
