import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import slugify from "slugify";
import { ProductService } from "../services/ProductService";
import { AuthRequest } from "../types";
import Logger from "../utils/logger";
import {
    createProductSchema,
    updateProductSchema,
} from "../validator/productValidationSchema";

export class ProductController {
    constructor(
        private logger: typeof Logger,
        private productService: ProductService,
    ) {}

    // Create Product
    async createProduct(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;
        const cid = authRequest.auth.cid;

        // validate the request body
        await checkSchema(createProductSchema).run(req);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const productData = {
                ...req.body,
                slug: slugify(req.body.name, { lower: true }),
                companyId: cid,
            };

            const newProduct =
                await this.productService.createProduct(productData);

            this.logger.info(`Product created: ${newProduct._id}`);
            return res.status(201).json({
                success: true,
                data: newProduct,
            });
        } catch (error: any) {
            this.logger.error(`Error creating product: ${error.message}`);
            next(error);
        }
    }

    // Get All Products
    async getAllProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const authRequest = req as AuthRequest;
            const cid = authRequest.auth.cid;
            if (!cid) {
                return res
                    .status(401)
                    .json({ message: "Company ID not found in request" });
            }

            const filters = {
                search: req.query.search as string,
                category: req.query.category as string,
                minPrice: req.query.minPrice as string,
                maxPrice: req.query.maxPrice as string,
                sortBy: (req.query.sortBy as string) || "createdAt",
                sortOrder: (req.query.sortOrder as string) || "desc",
            };

            const products = await this.productService.getAllProducts(
                cid,
                filters,
            );

            res.json(products);
        } catch (err) {
            this.logger.error("Error getting products", { error: err });
            return next(err);
        }
    }

    // Get Product by ID
    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await this.productService.getProductById(
                req.params.id,
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: "Product not found",
                });
            }

            this.logger.info(`Product retrieved: ${req.params.id}`);
            return res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error: any) {
            this.logger.error(`Error fetching product: ${error.message}`);
            next(error);
        }
    }

    // Get Product by Slug
    async getProductBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await this.productService.getProductBySlug(
                req.params.slug,
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: "Product not found",
                });
            }

            this.logger.info(`Product retrieved by slug: ${req.params.slug}`);
            return res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error: any) {
            this.logger.error(
                `Error fetching product by slug: ${error.message}`,
            );
            next(error);
        }
    }

    // Update Product
    async updateProduct(req: Request, res: Response, next: NextFunction) {
        // validate the request body
        await checkSchema(updateProductSchema).run(req);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id, companyId } = req.params;

            if (req.body.name) {
                req.body.slug = slugify(req.body.name, { lower: true });
            }

            const updatedProduct = await this.productService.updateProduct(
                id,
                companyId,
                req.body,
            );

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    error: "Product not found or unauthorized",
                });
            }

            this.logger.info(`Product updated: ${id}`);
            return res.status(200).json({
                success: true,
                data: updatedProduct,
            });
        } catch (error: any) {
            this.logger.error(`Error updating product: ${error.message}`);
            next(error);
        }
    }

    // Delete Product
    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, companyId } = req.params;

            const deleted = await this.productService.deleteProduct(
                id,
                companyId,
            );

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: "Product not found or unauthorized",
                });
            }

            this.logger.info(`Product deleted: ${id}`);
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error: any) {
            this.logger.error(`Error deleting product: ${error.message}`);
            next(error);
        }
    }
}
