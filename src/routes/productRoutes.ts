import { NextFunction, Request, Response, Router } from "express";
import { ProductController } from "../controllers/ProductController";
import authenticate from "../middlewares/authenticate";
import { ProductService } from "../services/ProductService";
import Logger from "../utils/logger";

export const router = Router();

const productService = new ProductService();
const productController = new ProductController(Logger, productService);

// Create product
router.post(
    "/",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.createProduct(req, res, next),
);

// Get all products
router.get(
    "/",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.getAllProducts(req, res, next),
);

// Get product by ID
router.get(
    "/:id",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.getProductById(req, res, next),
);

// Get product by slug
router.get(
    "/slug/:slug",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.getProductBySlug(req, res, next),
);

// Update product (with companyId)
router.put(
    "/:id/company/:companyId",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.updateProduct(req, res, next),
);

// Delete product (with companyId)
router.delete(
    "/:id/company/:companyId",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        productController.deleteProduct(req, res, next),
);

export default router;
