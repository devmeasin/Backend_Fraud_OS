import axios from "axios";
import { Product } from "../models/productModel";
import { WebhookOrderPayload } from "../services/Orders/OrderHandler";

export async function getProductIdsFromOrder(
    payload: WebhookOrderPayload,
    platform: string,
    companyId: string,
    webhook: any,
) {
    const productIds = [];
    for (const lineItem of payload.line_items || []) {
        let product = await Product.findOne({
            integrationId: lineItem.product_id?.toString(),
            externalPlatform: platform.toUpperCase(),
            companyId,
        });

        if (!product) {
            const fetchedProduct = await fetchProductFromPlatform(
                webhook,
                lineItem.product_id,
                platform,
            );
            if (fetchedProduct) {
                product = await Product.create(
                    mapProductPayload(
                        fetchedProduct,
                        platform,
                        companyId,
                        webhook,
                    ),
                );
            }
        }

        if (product) {
            productIds.push({
                productId: product._id, // Correct field name
                quantity: lineItem.quantity || 1, // Default quantity to 1 if missing
            });
        } else {
            console.error(
                `Product not found for line item: ${lineItem.product_id}`,
            );
        }
    }

    return productIds;
}

export async function fetchProductFromPlatform(
    webhook: any,
    productId: string,
    platform: string,
) {
    const storeUrl = webhook?.storeUrl;
    const credentials = webhook?.credentials;

    if (platform === "Shopify") {
        const response = await axios.get(
            `${storeUrl}/admin/api/2025-01/products/${productId}.json`,
            { headers: { "X-Shopify-Access-Token": credentials?.accessToken } },
        );
        return response.data.product as any;
    } else if (platform === "WooCommerce") {
        const response = await axios.get(
            `${storeUrl}/wp-json/wc/v3/products/${productId}`,
            {
                auth: {
                    username: credentials?.key,
                    password: credentials?.secret,
                },
            },
        );
        return response.data as any;
    }
    return null;
}

// Map WooCommerce/Shopify payloads to the unified product schema
export function mapProductPayload(
    payload: any,
    platform: string,
    companyId: string,
    webhook: any,
) {
    const validSku =
        payload.variants?.[0]?.sku && payload.variants[0].sku !== "unknown-sku"
            ? payload.variants[0].sku
            : null;

    return {
        name: payload.name || " ", // Ensure name exists
        sku: validSku, // Ensure valid SKU or set to null
        slug: payload.handle || payload.slug || "unknown-slug",
        companyId,
        source: {
            sourceName: platform,
            sourceUrl: webhook?.storeUrl,
        },
        imageUrls: payload.images
            ? payload.images.map((img: any) => (img?.src as string) || "")
            : [],
        price: payload.price || payload.regular_price || 0, // Ensure price is a valid number
        regularPrice:
            platform === "Shopify"
                ? payload.variants[0]?.price
                : payload.regular_price || 0,
        salePrice: payload.sale_price || 0,
        barcode:
            platform === "Shopify"
                ? payload.variants[0]?.barcode
                : payload.backorders || null,
        categories:
            payload?.categories.map((cat: any) => cat.name as string) ||
            "Uncategorized",
        subCategories: [], // Extract subcategories if available
        integrationId: payload.id?.toString(),
        externalPlatform: platform.toUpperCase(),
        manageStock: payload.manage_stock || false,
        stockStatus: payload.stock_status || "instock",
        stockQuantity:
            platform === "Shopify"
                ? payload.variants.reduce(
                      (sum: number, v: any) =>
                          sum + (v.inventory_quantity || 0),
                      0,
                  )
                : payload.stock_quantity || 0,
        shortDescription: payload.short_description || "",
        description: payload.body_html || "",
        metadata: payload,
    };
}
