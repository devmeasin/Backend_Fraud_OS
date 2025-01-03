import axios from "axios";

/**
 * Validates Shopify credentials by attempting to fetch shop details.
 */
export const validateShopifyCredentials = async (
    storeUrl: string,
    credentials: { accessToken: string },
): Promise<boolean> => {
    try {
        const response = await axios.get(`${storeUrl}/admin/shop.json`, {
            headers: {
                "X-Shopify-Access-Token": credentials.accessToken,
            },
        });
        return response.status === 200;
    } catch (error) {
        console.error(
            "Shopify credential validation failed:",
            error instanceof Error ? error.message : error,
        );
        return false;
    }
};
