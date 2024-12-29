import axios from "axios";

/**
 * Validates WooCommerce credentials by attempting to fetch store details.
 */
export const validateWooCommerceCredentials = async (
    storeUrl: string,
    credentials: { key: string; secret: string },
): Promise<boolean> => {
    try {
        const response = await axios.get(`${storeUrl}/wp-json/wc/v3`, {
            auth: {
                username: credentials.key,
                password: credentials.secret,
            },
        });

        return response.status === 200;
    } catch (error) {
        console.error(
            "WooCommerce credential validation failed:",
            error instanceof Error ? error.message : error,
        );
        return false;
    }
};
