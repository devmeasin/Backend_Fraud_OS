import axios from "axios";
import { CourierURI } from "../../constants";
import { TRedXData } from "../../types";
import logger from "../../utils/logger";
import { redxLogin } from "./loginService"; // Import the login function

let cachedCookies: string | null = null; // In-memory storage for cookies

const isCookiesValid = (cookies: string | null): boolean => {
    // Basic check to validate cookies
    return cookies !== null && cookies.trim() !== "";
};

const fetchData = async (customer_number: string): Promise<TRedXData> => {
    const { fraud_check_url } = CourierURI.redx_url;

    try {
        const response = await axios.get(
            `${fraud_check_url}${customer_number}`,
            {
                headers: {
                    Cookie: cachedCookies || "", // Use cached cookies if available
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );
        return response.data as TRedXData;
    } catch (error) {
        logger.error("Data fetch network error from RedX", error);
        throw error; // Rethrow error for handling in the main function
    }
};

export const RedX_Data = async (customer_number: string) => {
    try {
        // Check if the cookies are valid before making the fetch request
        if (!isCookiesValid(cachedCookies)) {
            logger.info(
                "Cookies are invalid or missing. Attempting to log in to fetch new cookies...",
            );
            const loginData = await redxLogin();
            cachedCookies = loginData.cookies; // Store the retrieved cookies in memory
        }

        // Fetch data using the valid cookies
        let response: TRedXData;
        try {
            response = await fetchData(customer_number);
            return response; // Return the successful response
        } catch (fetchError) {
            // If the fetch fails due to cookies, retry login and fetch again
            logger.warn(
                "First fetch attempt failed. Attempting to log in again to get new cookies...",
            );
            const loginData = await redxLogin();
            cachedCookies = loginData.cookies; // Update cookies with new login data

            // Retry fetching data with new cookies
            response = await fetchData(customer_number);
            return response; // Return the successful response after retry
        }
    } catch (error) {
        logger.error("Failed to fetch data from RedX", error);
        throw new Error("Failed to fetch data from RedX");
    }
};
