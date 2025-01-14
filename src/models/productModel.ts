import { Document, model, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slugUrl: string;
    sourceUrl: {
        sourceName: string;
        sourceUrl: string;
    };
    companyId: string;
    imageUrls: string[];
    price: number;
    salePrice: number;
    skuNumber?: string;
    barcode: string | null;
    category: string[];
    subCategories: string[]; // Dynamically store subcategories
    integrationId: string | null; // ID from external platforms
    externalPlatform: string; // Platform source: WooCommerce, Shopify, Daraz
    stockQuantity: number;
    description: string;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        type: { type: String, default: "simple" },
        source: {
            type: {
                sourceName: { type: String, default: "" },
                sourceUrl: { type: String, default: "" },
            },
        },
        status: { type: Object },
        name: { type: String, required: true },
        sku: { type: String, default: "" }, // Allow null or optional values
        slug: { type: String, default: "" },
        companyId: { type: String, required: true },
        imageUrls: { type: [String], default: [] },
        price: { type: Number, required: true },
        regularPrice: { type: Number, default: 0 },
        salePrice: { type: Number, default: 0 },
        barcode: { type: String, default: null },
        categories: { type: [String], required: true },
        subCategories: { type: [String], default: [] },
        integrationId: { type: String, default: null },
        externalPlatform: {
            type: String,
            enum: ["WOOCOMMERCE", "SHOPIFY", "DARAZ", "SYSTEM", "WEBSITE"],
            default: "Unknown",
        },
        manageStock: { type: Boolean, default: false },
        stockStatus: { type: String, default: "instock" },
        stockQuantity: { type: Number, default: 0 },
        totalSales: { type: Number, default: 0 },
        description: { type: String, default: "" },
        shortDescription: { type: String, default: "" },
        metadata: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true },
);

export const Product = model<IProduct>("Product", ProductSchema);
