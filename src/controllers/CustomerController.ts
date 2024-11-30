import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { CustomerService } from "../services/CustomerService";
import { AuthRequest } from "../types";
import { CustomerSchema } from "../validator/customerSchema";

export class CustomerController {
    constructor(
        private logger: Logger,
        private customerService: CustomerService,
    ) {}

    async createCustomer(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        await checkSchema(CustomerSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createHttpError(400, "Invalid customer data"));
        }

        try {
            const companyId = authRequest.auth.cid;
            const customerData = { ...req.body, companyId };

            const customer =
                await this.customerService.createCustomer(customerData);

            this.logger.info(
                `Customer created successfully for company ${companyId}`,
            );
            res.status(201).json({
                success: true,
                data: customer,
                message: "Customer created successfully",
            });
        } catch (error) {
            this.logger.error("Error creating customer:", error);
            next(createHttpError(500, `Failed to create customer: ${error}`));
        }
    }

    async updateCustomer(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const customerId = req.params.customerId;
            const updateData = req.body;

            const customer = await this.customerService.updateCustomer(
                customerId,
                companyId,
                updateData,
            );

            this.logger.info(`Customer ${customerId} updated successfully`);
            res.json({
                success: true,
                data: customer,
                message: "Customer updated successfully",
            });
        } catch (error) {
            this.logger.error("Error updating customer:", error);
            next(createHttpError(500, `Failed to update customer: ${error}`));
        }
    }

    async deleteCustomer(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const customerId = req.params.customerId;

            await this.customerService.deleteCustomer(customerId, companyId);

            this.logger.info(`Customer ${customerId} deleted successfully`);
            res.json({
                success: true,
                message: "Customer deleted successfully",
            });
        } catch (error) {
            this.logger.error("Error deleting customer:", error);
            next(createHttpError(500, `Failed to delete customer: ${error}`));
        }
    }

    async getCustomers(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const customers =
                await this.customerService.getCustomersByCompany(companyId);

            res.json({
                success: true,
                data: customers,
                message: "Customers retrieved successfully",
            });
        } catch (error) {
            this.logger.error("Error fetching customers:", error);
            next(createHttpError(500, `Failed to fetch customers: ${error}`));
        }
    }
}
