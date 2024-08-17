import axios from "axios";
import { CourierURI } from "../../constants";
import { IToken } from "../../models/pathaoTokenModel";
import { pathaoTokenService } from "../../services/pathaoToken";
import { IPathaoCustomerCheckData, LoginResponse } from "../../types";
import logger from "../../utils/logger";
import { loginToPathao } from "./loginService";

const { fraud_check_url } = CourierURI.pathao_url;

const pathaoToken = new pathaoTokenService();

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
    const tokenData = await pathaoToken.getPathaoTokenfromDB(userId);
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
    try {
        // Check if the response is already cached
        const cacheKey = `${userId}-${customer_number}`;
        if (responseCache.has(cacheKey)) {
            return responseCache.get(cacheKey);
        }

        const tokenData = await getTokenFromCache(userId);

        // Check if the token is missing or expired
        if (!tokenData?.access_token || isTokenExpired(tokenData)) {
            await fetchAndStoreNewToken(userId);
        }

        // Make the API request with the valid token
        const response = await axios.post(
            fraud_check_url,
            { phone: customer_number },
            {
                headers: { Authorization: `Bearer ${tokenData?.access_token}` },
                timeout: 5000, // Set a timeout for the request
            },
        );

        // Cache the response
        responseCache.set(cacheKey, response.data as IPathaoCustomerCheckData);

        // Ensure the response data is returned in the expected format
        return response.data as IPathaoCustomerCheckData;
    } catch (error) {
        handleError(error);
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
        await pathaoToken.storePathaoTokenfromDB(userId, {
            ...token,
            expires_at: expiresAt,
        });

        return { ...token, expires_at: expiresAt };
    } catch (error) {
        logger.error("Failed to obtain new token", error);
        throw new Error("Failed to obtain new token");
    }
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
