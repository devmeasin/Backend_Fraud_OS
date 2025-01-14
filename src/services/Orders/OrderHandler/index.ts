import { Order, PaymentMethod } from "../../../models/orderChannel/orderModel";
import { getProductIdsFromOrder } from "../../../utils/fetchVendorProduct";
import Customer from "../../../models/customerModel";

const generateInternalId = async (
    source: string,
    companyId: string,
): Promise<string> => {
    const prefixMap: { [key: string]: string } = {
        WOOCOMMERCE: "WOO",
        SHOPIFY: "SHO",
        DARAZ: "DRZ",
        WHATSAPP: "WHA",
        SYSTEM: "EOS",
        PHONE_CALL: "PHC",
        UNKNOWN: "UNK",
    };

    const prefix = prefixMap[source.toUpperCase()] || "ORD";
    const lastOrder = await Order.findOne({ companyId })
        .sort({ createdAt: -1 })
        .select("internalId");

    const lastId = lastOrder?.internalId?.split("-")[1] || "0000";
    const nextId = (parseInt(lastId, 10) + 1).toString().padStart(4, "0");

    return `${prefix}-${nextId}`;
};

export async function handleOrderEvent(
    payload: any,
    platform: string,
    companyId: string,
    webhook: any,
): Promise<void> {
    try {
        const phone =
            platform === "Shopify"
                ? payload.customer?.phone ||
                  payload.shipping_address?.phone ||
                  null
                : payload.billing?.phone || null;

        if (!phone) {
            throw new Error(
                "Phone number is required but not found in the payload.",
            );
        }

        // Find or create customer
        const customer = await Customer.findOneAndUpdate(
            { companyId, phone }, // Find customer by companyId and phone
            {
                $setOnInsert: {
                    // Fields to set if a new customer is created
                    name:
                        platform === "Shopify"
                            ? payload.customer?.name || ""
                            : `${payload.billing?.first_name || ""} ${
                                  payload.billing?.last_name || ""
                              }`.trim(),
                    companyId,
                    phone,
                    source: platform.toUpperCase(),
                    type: "E_COMMERCE_CUSTOMER",
                    paymentMethod: "CASH_ON_DELIVERY",
                },
                $addToSet: {
                    // Add to locations only if it doesn't already exist
                    locations: {
                        address:
                            (payload.billing?.address_1 || "") +
                            " " +
                            (payload.billing?.address_2 || ""),
                        district:
                            payload.billing?.state ||
                            payload.shipping?.state ||
                            "",
                        division:
                            payload.billing?.state ||
                            payload.shipping?.state ||
                            "",
                        postCode:
                            payload.billing?.postcode ||
                            payload.shipping?.postcode ||
                            "",
                        country:
                            payload.billing?.country ||
                            payload.shipping?.country ||
                            "BD",
                    },
                },
                $inc: { salesOrderCount: 1 }, // Increment sales order count
            },
            { upsert: true, new: true }, // Upsert and return the updated/new document
        );

        // Map order payload
        const orderData = await mapOrderPayload(
            payload as WebhookOrderPayload,
            platform,
            companyId,
            webhook,
        );

        // Ensure internalId is generated
        orderData.internalId =
            orderData.internalId ||
            (await generateInternalId(platform, companyId));

        // Upsert order
        await Order.updateOne(
            {
                externalId: orderData.externalId,
                source: platform.toUpperCase(),
                companyId,
            },
            {
                $set: {
                    ...orderData,
                    customer: customer._id,
                    customerPhone: customer.phone,
                },
            },
            { upsert: true },
        );

        console.log(
            `Order processed successfully for external ID: ${orderData.externalId}`,
        );
    } catch (error) {
        console.error("Error handling order event:", error);
        throw new Error("Failed to handle order event.");
    }
}

// type define for unified order schema

// Define types for WooCommerce payload structures
interface Billing {
    first_name: string;
    last_name: string;
    phone: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

interface Shipping {
    first_name: string;
    last_name: string;
    phone?: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

export interface WebhookOrderPayload {
    id: number;
    billing: Billing;
    shipping: Shipping;
    total: string;
    discount_total: string;
    shipping_total: string;
    payment_method: string;
    status: string;
    subtotal_price?: string;
    total_price?: string;
    line_items: any[];
}

// type Platform = "Shopify" | "WooCommerce";

interface Webhook {
    id: string;
    storeUrl: string;
}

// Map WooCommerce/Shopify payloads to the unified order schema
export async function mapOrderPayload(
    payload: WebhookOrderPayload,
    platform: string,
    companyId: string,
    webhook: Webhook,
): Promise<any> {
    const normalizePaymentMethod = (method: string): PaymentMethod => {
        const methodMap: Record<string, PaymentMethod> = {
            COD: PaymentMethod.CASH_ON_DELIVERY,
            CASH: PaymentMethod.CASH,
            CREDIT_CARD: PaymentMethod.CREDIT_CARD,
            OTHER: PaymentMethod.OTHER,
        };
        return methodMap[method.toUpperCase()] || PaymentMethod.OTHER;
    };

    const extractShippingAddress = (): any => ({
        address:
            payload.billing?.address_1 + " " + payload.billing?.address_2 ||
            payload.shipping?.address_1 ||
            "",
        district: payload.billing?.city || payload.shipping?.city || "",
        division: payload.billing?.state || payload.shipping?.state || "",
        postCode: payload.billing?.postcode || payload.shipping?.postcode || "",
        country: payload.billing?.country || payload.shipping?.country || "",
    });

    const productIds = await getProductIdsFromOrder(
        payload,
        platform,
        companyId,
        webhook,
    );

    return {
        companyId,
        externalId: payload.id.toString(),
        source: platform.toUpperCase(),
        customerPhone: payload.billing?.phone || null,
        shippingAddress: extractShippingAddress(),
        products: productIds.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
        })),
        amounts: {
            subTotal: parseFloat(
                payload.subtotal_price || payload.total || "0",
            ),
            totalAmount: parseFloat(
                payload.total_price || payload.total || "0",
            ),
            discount: parseFloat(payload.discount_total || "0"),
            deliveryCharge: parseFloat(payload.shipping_total || "0"),
        },
        payment: {
            method: normalizePaymentMethod(payload.payment_method),
            paid: parseFloat(payload.total || "0"),
            due: 0,
        },
        metadata: {
            sourceUrl: webhook.storeUrl,
            notes: [],
        },
    };
}
