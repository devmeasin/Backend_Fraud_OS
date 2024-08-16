import axios from "axios";
import jwt from "jsonwebtoken";
import { paperflyLogin } from "./loginService";
import { CourierURI } from "../../constants";
import logger from "../../utils/logger";
import { IPaperflyApiResponse } from "../../types";

const { fraud_check_url } = CourierURI.paperfly_url;

let tokenData: { token: string; expires_at: number } | null = null;

const decodeToken = (token: string): number => {
    const decoded = jwt.decode(token) as { exp: number };
    return decoded.exp * 1000; // Convert to milliseconds
};

const isTokenExpired = (
    tokenData: { token: string; expires_at: number } | null,
): boolean => {
    return !tokenData || Date.now() > tokenData.expires_at;
};

const accessToken = async (): Promise<{
    token: string;
    expires_at: number;
}> => {
    try {
        const loginData = await paperflyLogin();
        const expiresAt = decodeToken(loginData.token);
        return {
            token: loginData.token,
            expires_at: expiresAt,
        };
    } catch (error) {
        logger.error("Failed to access token", error);
        throw new Error("Failed to access token");
    }
};

export const paperfly_makeRequestWithToken = async (
    customer_number: string,
): Promise<IPaperflyApiResponse | undefined> => {
    const payload = {
        search_text: customer_number,
    };

    const makeRequest = async (): Promise<IPaperflyApiResponse | undefined> => {
        try {
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
                        "Axios Error Status: fetch data from Paperfly",
                        error.response.status,
                    );
                    logger.error(
                        "Axios Error Data: fetch data from Paperfly",
                        error.response.data,
                    );

                    // If 401 (Unauthorized) or 500 error, try refreshing the token
                    if (
                        error.response.status === 401 ||
                        error.response.status === 500
                    ) {
                        return undefined; // Return undefined to signal retry
                    }
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
                logger.error(
                    "Unexpected Error: fetch data from Paperfly",
                    error,
                );
            }
            throw new Error("Error fetching data from Paperfly");
        }
    };

    try {
        // Check if the token is expired and refresh if necessary
        if (isTokenExpired(tokenData)) {
            tokenData = await accessToken(); // Refresh token
        }

        let response = await makeRequest();

        // If the request failed due to token issues, refresh token and retry
        if (response === undefined) {
            tokenData = await accessToken(); // Refresh token
            response = await makeRequest(); // Retry request with new token

            if (response === undefined) {
                throw new Error("Request failed after token refresh");
            }
        }

        return response;
    } catch (error) {
        logger.error("Final Error: Failed to fetch data from Paperfly", error);
        return undefined; // Ensure return type matches Promise<IPaperflyApiResponse | undefined>
    }
};
