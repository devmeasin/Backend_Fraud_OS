import axios from "axios";

/**
 * Validates WooCommerce credentials by attempting to fetch store details.
 */

export const validateWooCommerceCredentials = async (
    storeUrl: string,
    credentials: { key: string; secret: string },
): Promise<{ success: boolean; reason?: string }> => {
    try {
        const sanitizedStoreUrl = storeUrl.replace(/\/+$/, "");
        const response = await axios.get(
            `${sanitizedStoreUrl}/wp-json/wc/v3/orders`,
            {
                auth: {
                    username: credentials.key,
                    password: credentials.secret,
                },
                timeout: 10000, // Timeout after 10 seconds
            },
        );

        return {
            success: response.status === 200,
            reason: "Valid credentials",
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(
                "Error response:",
                error.response?.status,
                error.response?.data,
            );
            if (error.response?.status === 401) {
                return { success: false, reason: "Invalid credentials" };
            }
        } else {
            console.error("Unexpected error:", error);
        }
        return { success: false, reason: "Store unreachable or other error" };
    }
};
