import axios from "axios";

const fetchOrderDetails = async (orderId: string, webhooks: any) => {
    const storeUrl = webhooks.storeUrl;
    const accessToken = webhooks.credentials.accessToken;

    if (!storeUrl || !accessToken) {
        console.error("Missing storeUrl or accessToken");
        return;
    }

    try {
        const response = await axios.get(
            `${storeUrl}/admin/api/2025-01/orders/${orderId}.json`,
            {
                headers: {
                    "X-Shopify-Access-Token": accessToken,
                },
            },
        );

        const phoneNumber =
            response.data.order.billing_address?.phone ||
            response.data.order.customer?.phone ||
            "No phone number available";

        console.log("Phone Number:", phoneNumber);

        return phoneNumber as string;
    } catch (error) {
        console.error("Error fetching order details:", error);
    }
};

fetchOrderDetails(
    "5702097469594",
    "your-access-token",
    "your-store.myshopify.com",
);
