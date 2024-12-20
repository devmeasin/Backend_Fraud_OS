import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { DeliveryPartnerService } from "../../services/DeliveryPartners/DeliveryPartnersService";
import { AuthRequest } from "../../types";
import { ApiResponse } from "../../types/apiResponse";
import {
    DeliveryPartner,
    DeliveryPartnerType,
} from "../../types/deliveryPartner";
import { DeliveryPartnerSchema } from "../../validator/deliveryPartnersSchema";

export class DeliveryPartnerController {
    constructor(
        private logger: Logger,
        private deliveryPartnerService: DeliveryPartnerService,
    ) {}

    async createDeliveryPartner(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Validate the request
            await checkSchema(DeliveryPartnerSchema).run(req);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Invalid delivery partner data",
                    {
                        errors: errors.array(),
                    },
                );
            }

            const authRequest = req as AuthRequest;
            const { integrationConfig, type } = req.body;
            const companyId = authRequest.auth.cid;

            // Verify credentials
            const accessToken =
                await this.deliveryPartnerService.verifyCredentials(
                    type as DeliveryPartnerType,
                    integrationConfig,
                );

            if (!accessToken) {
                throw createHttpError(
                    HTTP_STATUS.UNAUTHORIZED,
                    "Invalid credentials for the delivery partner",
                );
            }

            // Create delivery partner data
            const deliveryPartnerData = { ...req.body, companyId, accessToken };
            const deliveryPartner =
                await this.deliveryPartnerService.createDeliveryPartner(
                    deliveryPartnerData as DeliveryPartner,
                );

            this.logger.info(
                `Delivery Partner created successfully for company ${companyId}`,
            );
            const response: ApiResponse = {
                success: true,
                data: deliveryPartner,
                message: "Delivery Partner created successfully",
            };

            res.status(HTTP_STATUS.CREATED).json(response);
        } catch (error) {
            this.logger.error("Error creating delivery partner:", error);
            next(
                createHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    error instanceof Error ? error.message : "Unknown error",
                ),
            );
        }
    }

    async updateDeliveryPartner(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Validate the request
            await checkSchema(DeliveryPartnerSchema).run(req);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    "Invalid delivery partner data",
                    {
                        errors: errors.array(),
                    },
                );
            }

            const authRequest = req as AuthRequest;
            const { deliveryPartnerId } = req.params;
            const companyId = authRequest.auth.cid;
            const updateData = req.body;

            const deliveryPartner =
                await this.deliveryPartnerService.updateDeliveryPartner(
                    deliveryPartnerId,
                    companyId,
                    updateData,
                );

            this.logger.info(
                `Delivery Partner ${deliveryPartnerId} updated successfully`,
            );
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: deliveryPartner,
                message: "Delivery Partner updated successfully",
            });
        } catch (error) {
            this.logger.error("Error updating delivery partner:", error);
            next(
                createHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    `Failed to update delivery partner: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                ),
            );
        }
    }

    async deleteDeliveryPartner(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const authRequest = req as AuthRequest;
            const { deliveryPartnerId } = req.params;
            const companyId = authRequest.auth.cid;

            await this.deliveryPartnerService.deleteDeliveryPartner(
                deliveryPartnerId,
                companyId,
            );

            this.logger.info(
                `Delivery Partner ${deliveryPartnerId} deleted successfully`,
            );
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Delivery Partner deleted successfully",
            });
        } catch (error) {
            this.logger.error("Error deleting delivery partner:", error);
            next(
                createHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    `Failed to delete delivery partner: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                ),
            );
        }
    }

    async getDeliveryPartners(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const authRequest = req as AuthRequest;
            const companyId = authRequest.auth.cid;

            const deliveryPartners =
                await this.deliveryPartnerService.getDeliveryPartners(
                    companyId,
                );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: deliveryPartners,
                message: "Delivery Partners retrieved successfully",
            });
        } catch (error) {
            this.logger.error("Error fetching delivery partners:", error);
            next(
                createHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    `Failed to fetch delivery partners: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                ),
            );
        }
    }

    async getDeliveryPartnerById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const authRequest = req as AuthRequest;
            const { deliveryPartnerId } = req.params;
            const companyId = authRequest.auth.cid;

            const deliveryPartner =
                await this.deliveryPartnerService.getDeliveryPartnerById(
                    deliveryPartnerId,
                    companyId,
                );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: deliveryPartner,
                message: "Delivery Partner retrieved successfully",
            });
        } catch (error) {
            this.logger.error("Error fetching delivery partner:", error);
            next(
                createHttpError(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    `Failed to fetch delivery partner: ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`,
                ),
            );
        }
    }
}
