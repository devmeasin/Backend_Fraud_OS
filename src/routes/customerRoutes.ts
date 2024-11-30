import { NextFunction, Request, Response } from "express";
import express from "express";
import { Logger } from "winston";
import { CustomerController } from "../controllers/CustomerController";
import { CustomerService } from "../services/CustomerService";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import logger from "../utils/logger";

const router = express.Router();

const customerService = new CustomerService();
const customerController = new CustomerController(logger, customerService);

// Create customer - accessible by authenticated users
router.post(
    "/create",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        customerController.createCustomer(req, res, next),
);

// Update customer - accessible by authenticated users
router.put(
    "/update/:customerId",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        customerController.updateCustomer(req, res, next),
);

// Delete customer - only admin can delete
router.delete(
    "/delete/:customerId",
    authenticate,
    isAdmin,
    (req: Request, res: Response, next: NextFunction) =>
        customerController.deleteCustomer(req, res, next),
);

// Get customers by companyId
router.get(
    "/",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        customerController.getCustomers(req, res, next),
);

export default router;
