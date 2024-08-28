import axios from "axios";
import { CourierURI } from "../../constants";
import { IToken } from "../../models/pathaoTokenModel";
import { PathaoTokenService } from "../../services/PathaoToken";
import { IPathaoCustomerCheckData, LoginResponse } from "../../types";
import logger from "../../utils/logger";
import { loginToPathao } from "./loginService";

const { fraud_check_url } = CourierURI.pathao_url;

const pathaoTokenData = new PathaoTokenService();

// Caching utility to store and retrieve cached responses
const responseCache = new Map<string, IPathaoCustomerCheckData>();
// Simple in-memory cache
const tokenCache = new Map<string, IToken>();

const getTokenFromCache = async (userId: string): Promise<IToken | null> => {
    const cachedToken = tokenCache.get(userId);

    // Check if the token is still valid
    if (cachedToken && !isTokenExpired(cachedToken)) {
        return cachedToken;
    }

    // Fetch from database if not cached or expired
    const tokenData = await pathaoTokenData.getPathaoTokenfromDB(userId);
    if (tokenData && !isTokenExpired(tokenData)) {
        tokenCache.set(userId, tokenData);
        return tokenData;
    }

    return null;
};

// Function to make request with token, handling token retrieval and retry logic
export const pathao_makeRequestWithToken = async (
    userId: string,
    customer_number: string,
) => {
    const cacheKey = `${userId}-${customer_number}`;
    try {
        // Check if the response is already cached
        if (responseCache.has(cacheKey)) {
            return responseCache.get(cacheKey);
        }

        // Try to get a valid token from cache or database
        let tokenData = await getTokenFromCache(userId);
        if (!tokenData || isTokenExpired(tokenData)) {
            // Token not found or expired, so fetch a new one
            tokenData = (await fetchAndStoreNewToken(userId)) as IToken;
        }

        // Try making the request with the valid token
        const response = await makeRequestWithToken(
            tokenData.access_token,
            customer_number,
        );

        // Cache the response
        responseCache.set(cacheKey, response.data as IPathaoCustomerCheckData);

        return response.data as IPathaoCustomerCheckData;
    } catch (error) {
        if (isHttpsError(error)) {
            logger.warn(
                "HTTPS error occurred, attempting to fetch a new token and retry the request.",
            );

            // Fetch a new token and retry the request
            const newTokenData = await fetchAndStoreNewToken(userId);

            try {
                // Retry the request with the new token
                const retryResponse = await makeRequestWithToken(
                    newTokenData.access_token,
                    customer_number,
                );

                // Cache the retry response
                responseCache.set(
                    cacheKey,
                    retryResponse.data as IPathaoCustomerCheckData,
                );

                return retryResponse.data as IPathaoCustomerCheckData;
            } catch (retryError) {
                handleError(retryError);
            }
        } else {
            handleError(error);
        }
    }
};

// Helper function to determine if the token is expired
const isTokenExpired = (tokenData: {
    access_token: string;
    expires_at: number;
}) => {
    const currentTime = Date.now();
    return tokenData.expires_at < currentTime;
};

// Helper function to fetch and store a new token
const fetchAndStoreNewToken = async (userId: string) => {
    try {
        const token: LoginResponse = await loginToPathao(userId);

        // Calculate and store the expiration time based on the current time and expires_in
        const expiresAt = Date.now() + token.expires_in * 1000; // Convert seconds to milliseconds

        // Save the new token with the calculated expiration time
        const newToken = { ...token, expires_at: expiresAt };
        await pathaoTokenData.storePathaoTokenfromDB(userId, newToken);

        // Update the token cache
        tokenCache.set(userId, newToken as IToken);

        return newToken;
    } catch (error) {
        logger.error("Failed to obtain new token", error);
        throw new Error("Failed to obtain new token");
    }
};

// Helper function to check if the error is an HTTPS error
const isHttpsError = (error: any) => {
    return (
        axios.isAxiosError(error) &&
        error.response &&
        [401, 403].includes(error.response.status)
    );
};

// Helper function to make the request with a given token
const makeRequestWithToken = async (
    accessToken: string,
    customer_number: string,
) => {
    return axios.post(
        fraud_check_url,
        { phone: customer_number },
        {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 5000, // Set a timeout for the request
        },
    );
};

// Error handling function
const handleError = (error: any) => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            logger.error("Error Status:", error.response.status);
            logger.error("Error Data:", error.response.data);
        } else {
            logger.error("Axios error:", error.message);
        }
    } else {
        logger.error("Unexpected error:", error);
    }
    throw new Error("Error fetching data from Pathao");
};
