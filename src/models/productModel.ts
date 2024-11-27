import { Document, model, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    companyId: string;
    imageUrls: string[];
    price: number;
    salePrice: number;
    sku: string;
    barcode: string | null;
    category: string;
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
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        companyId: { type: String, required: true },
        imageUrls: { type: [String], default: [] },
        price: { type: Number, required: true },
        salePrice: { type: Number, default: 0 },
        sku: { type: String, required: true, unique: true },
        barcode: { type: String, default: null },
        category: { type: String, required: true },
        subCategories: { type: [String], default: [] },
        integrationId: { type: String, default: null },
        externalPlatform: {
            type: String,
            enum: ["WooCommerce", "Shopify", "Daraz"],
            required: true,
        },
        stockQuantity: { type: Number, default: 0 },
        description: { type: String, default: "" },
        metadata: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: true },
);

export const Product = model<IProduct>("Product", ProductSchema);
