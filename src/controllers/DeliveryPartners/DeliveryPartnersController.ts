import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { DeliveryPartnerService } from "../../services/DeliveryPartners/DeliveryPartnersService";
import { DeliveryPartnerSchema } from "../../validator/deliveryPartnersSchema";
import { AuthRequest } from "../../types";
import axios from "axios";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { DeliveryPartnerType } from "../../types/deliveryPartner";
import { ApiResponse } from "../../types/apiResponse";

// Constants for API endpoints and error messages
const DELIVERY_PARTNER_ENDPOINTS = {
    PATHAO: "https://api-hermes.pathao.com/aladdin/api/v1/issue-token",
    STEADFAST: "https://portal.packzy.com/api/v1/get_balance",
} as const;

const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: (partner: string) => `Invalid ${partner} credentials`,
    INVALID_PARTNER_TYPE: "Invalid delivery partner type",
} as const;

export class DeliveryPartnerController {
    constructor(
        private logger: Logger,
        private deliveryPartnerService: DeliveryPartnerService,
    ) {}

    private async verifyCredentials(
        type: DeliveryPartnerType,
        integrationConfig: any,
    ): Promise<string | null> {
        try {
            let response;

            switch (type) {
                case "PATHAO":
                    response = await axios.post(
                        DELIVERY_PARTNER_ENDPOINTS.PATHAO,
                        {
                            client_id: integrationConfig.clientId,
                            client_secret: integrationConfig.secretKey,
                            username: integrationConfig.username,
                            password: integrationConfig.password,
                            grant_type: "password",
                        },
                    );
                    return response.data?.access_token || null;

                case "STEADFAST":
                    response = await axios.get(
                        DELIVERY_PARTNER_ENDPOINTS.STEADFAST,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Api-Key": integrationConfig.apiKey,
                                "Secret-Key": integrationConfig.secretKey,
                            },
                        },
                    );
                    return response.status === HTTP_STATUS.OK
                        ? "verified"
                        : null;

                default:
                    throw new Error(ERROR_MESSAGES.INVALID_PARTNER_TYPE);
            }
        } catch (error) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS(type));
        }
    }

    async createDeliveryPartner(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const authRequest = req as AuthRequest;

            // Validation
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

            const { integrationConfig, type } = req.body;
            const companyId = authRequest.auth.cid;
            const deliveryPartnerData = { ...req.body, companyId };

            // Verify credentials
            const accessToken = await this.verifyCredentials(
                type,
                integrationConfig,
            );
            if (!accessToken) {
                throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS(type));
            }

            deliveryPartnerData.accessToken = accessToken;

            const deliveryPartner =
                await this.deliveryPartnerService.createDeliveryPartner(
                    deliveryPartnerData,
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
    ) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const deliveryPartnerId = req.params.deliveryPartnerId;
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
            res.json({
                success: true,
                data: deliveryPartner,
                message: "Delivery Partner updated successfully",
            });
        } catch (error) {
            this.logger.error("Error updating delivery partner:", error);
            next(
                createHttpError(
                    500,
                    `Failed to update delivery partner: ${error}`,
                ),
            );
        }
    }

    async deleteDeliveryPartner(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const deliveryPartnerId = req.params.deliveryPartnerId;

            await this.deliveryPartnerService.deleteDeliveryPartner(
                deliveryPartnerId,
                companyId,
            );

            this.logger.info(
                `Delivery Partner ${deliveryPartnerId} deleted successfully`,
            );
            res.json({
                success: true,
                message: "Delivery Partner deleted successfully",
            });
        } catch (error) {
            this.logger.error("Error deleting delivery partner:", error);
            next(
                createHttpError(
                    500,
                    `Failed to delete delivery partner: ${error}`,
                ),
            );
        }
    }

    async getDeliveryPartners(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const deliveryPartners =
                await this.deliveryPartnerService.getDeliveryPartners(
                    companyId,
                );

            res.json({
                success: true,
                data: deliveryPartners,
                message: "Delivery Partners retrieved successfully",
            });
        } catch (error) {
            this.logger.error("Error fetching delivery partners:", error);
            next(
                createHttpError(
                    500,
                    `Failed to fetch delivery partners: ${error}`,
                ),
            );
        }
    }

    async getDeliveryPartnerById(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const authRequest = req as AuthRequest;

        try {
            const companyId = authRequest.auth.cid;
            const deliveryPartnerId = req.params.deliveryPartnerId;

            const deliveryPartner =
                await this.deliveryPartnerService.getDeliveryPartnerById(
                    deliveryPartnerId,
                    companyId,
                );

            res.json({
                success: true,
                data: deliveryPartner,
                message: "Delivery Partner retrieved successfully",
            });
        } catch (error) {
            this.logger.error("Error fetching delivery partner:", error);
            next(
                createHttpError(
                    500,
                    `Failed to fetch delivery partner: ${error}`,
                ),
            );
        }
    }
}
