import { Schema } from "express-validator";

export const createProductSchema: Schema = {
    name: {
        trim: true,
        notEmpty: { errorMessage: "Product name is required" },
        isLength: {
            options: { min: 2, max: 100 },
            errorMessage: "Product name must be between 2 and 100 characters",
        },
    },
    slug: {
        trim: true,
        optional: true,
        notEmpty: { errorMessage: "Slug is required" },
        isLength: {
            options: { min: 2, max: 100 },
            errorMessage: "Slug must be between 2 and 100 characters",
        },
    },
    imageUrls: {
        optional: true,
        isArray: { errorMessage: "Image URLs must be an array" },
        custom: {
            options: (value: string[]) => {
                if (!value.every((url) => typeof url === "string")) {
                    throw new Error("All image URLs must be strings");
                }
                return true;
            },
        },
    },
    price: {
        notEmpty: { errorMessage: "Price is required" },
        isFloat: {
            options: { min: 0 },
            errorMessage: "Price must be a positive number",
        },
    },
    salePrice: {
        optional: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: "Sale price must be a positive number",
        },
    },
    sku: {
        notEmpty: { errorMessage: "SKU is required" },
        isString: { errorMessage: "SKU must be a string" },
    },
    barcode: {
        optional: true,
        isString: { errorMessage: "Barcode must be a string" },
    },
    category: {
        notEmpty: { errorMessage: "Category is required" },
        isString: { errorMessage: "Category must be a string" },
    },
    subCategories: {
        optional: true,
        isArray: { errorMessage: "Subcategories must be an array" },
        custom: {
            options: (value: string[]) => {
                if (!value.every((cat) => typeof cat === "string")) {
                    throw new Error("All subcategories must be strings");
                }
                return true;
            },
        },
    },
    integrationId: {
        optional: true,
        isString: { errorMessage: "Integration ID must be a string" },
    },
    externalPlatform: {
        notEmpty: { errorMessage: "External platform is required" },
        isIn: {
            options: [["WooCommerce", "Shopify", "Daraz"]],
            errorMessage: "Invalid external platform",
        },
    },
    stockQuantity: {
        optional: true,
        isInt: {
            options: { min: 0 },
            errorMessage: "Stock quantity must be a non-negative integer",
        },
    },
    description: {
        optional: true,
        trim: true,
        isLength: {
            options: { max: 1000 },
            errorMessage: "Description cannot exceed 1000 characters",
        },
    },
};

export const updateProductSchema: Schema = {
    name: {
        optional: true,
        ...createProductSchema.name,
    },
    price: {
        optional: true,
        ...createProductSchema.price,
    },
    description: {
        optional: true,
        ...createProductSchema.description,
    },
    category: {
        optional: true,
        ...createProductSchema.category,
    },
};

export const productQuerySchema: Schema = {
    page: {
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: "Page must be a positive integer",
        },
    },
    limit: {
        optional: true,
        isInt: {
            options: { min: 1, max: 100 },
            errorMessage: "Limit must be between 1 and 100",
        },
    },
    sortBy: {
        optional: true,
        isIn: {
            options: [["createdAt", "name", "price"]],
            errorMessage: "Invalid sort field",
        },
    },
    sortOrder: {
        optional: true,
        isIn: {
            options: [["asc", "desc"]],
            errorMessage: "Sort order must be asc or desc",
        },
    },
    search: {
        optional: true,
        isString: true,
    },
    category: {
        optional: true,
        isString: true,
    },
    minPrice: {
        optional: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: "Minimum price must be a positive number",
        },
    },
    maxPrice: {
        optional: true,
        isFloat: {
            options: { min: 0 },
            errorMessage: "Maximum price must be a positive number",
        },
    },
};
