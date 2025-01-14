import { Product } from "../../../models/productModel";

export async function handleProductEvent(
    payload: any,
    platform: string,
    companyId: string,
    webhook: any,
): Promise<void> {
    try {
        // Map incoming payload to the product schema
        const productData = mapProductPayload(
            payload,
            platform,
            companyId,
            webhook,
        );

        // Define the query to find the existing product
        const query = {
            integrationId: productData.integrationId,
            externalPlatform: platform.toUpperCase(),
            companyId,
        };

        // Use updateOne with upsert for efficient create or update
        const result = await Product.updateOne(
            query, // Match criteria
            { $set: productData }, // Update only provided fields
            { upsert: true }, // Insert if it doesn't exist
        );

        // Log the operation status
        if (result.upsertedCount > 0) {
            console.log(`Product created: ${productData.name}`);
        } else {
            console.log(`Product updated: ${productData.name}`);
        }
    } catch (error) {
        console.error("Error handling product event:", error);
        throw new Error("Failed to handle product event");
    }
}

// Map WooCommerce/Shopify payloads to the unified product schema
export function mapProductPayload(
    payload: any,
    platform: string,
    companyId: string,
    webhook: any,
) {
    return {
        name: platform === "Shopify" ? payload.title : payload.name,
        sku:
            platform === "Shopify"
                ? payload.variants[0]?.sku || ""
                : payload.sku || "",
        slug:
            platform === "Shopify" ? payload.handle || "" : payload.slug || "",
        companyId,
        source: {
            sourceName: platform,
            sourceUrl: webhook?.storeUrl,
        },
        imageUrls:
            platform === "Shopify"
                ? payload.images.map((img: any) => img.src as string) // Extract src for Shopify
                : payload.images.map((img: any) => img.src as string), // Extract src for WooCommerce
        price:
            platform === "Shopify"
                ? payload.variants[0]?.price
                : payload.price || 0,
        regularPrice:
            platform === "Shopify"
                ? payload.variants[0]?.price
                : payload.regular_price || 0,
        salePrice: payload.sale_price || "0", // Add logic for sale price
        barcode:
            platform === "Shopify"
                ? payload.variants[0]?.barcode
                : payload.backorders,
        categories: payload.categories?.map(
            (cat: any) => cat?.name as string,
        ) || ["Uncategorized"], // Map category names
        subCategories: payload.subCategories || [],
        integrationId: payload.id.toString(),
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
        description: payload.body_html || payload.description || "",
        metadata: payload,
    };
}
