import axios from "axios";
import { Model } from "mongoose";
import { Logger } from "winston";
import { DELIVERY_PARTNER_ENDPOINTS } from "../../constants/endpoints";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { IDeliveryPartner } from "../../models/deliveryChannel/deliveryPartnerModel";
import { DeliveryPartnerType } from "../../types/deliveryPartner";
import { ERROR_MESSAGES } from "../../constants/errorMessages";

export class DeliveryPartnerService {
    constructor(
        private deliveryPartnerModel: Model<IDeliveryPartner>,
        private logger: Logger,
    ) {}

    async verifyCredentials(
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
                    return response.data?.status === HTTP_STATUS.OK &&
                        response.data?.current_balance >= 0
                        ? "success"
                        : null;

                default:
                    throw new Error(ERROR_MESSAGES.INVALID_PARTNER_TYPE);
            }
        } catch (error) {
            this.logger.error("Error verifying credentials", { type, error });
            // throw new Error("Invalid credentials for the delivery partner");
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS(type));
        }
    }

    async createDeliveryPartner(data: Partial<IDeliveryPartner>) {
        try {
            const deliveryPartner = new this.deliveryPartnerModel(data);
            await deliveryPartner.save();
            this.logger.info(
                `Delivery Partner created: ${deliveryPartner._id as string}`,
            );
            return deliveryPartner;
        } catch (error) {
            this.logger.error("Error creating delivery partner", error);
            throw error;
        }
    }

    async updateDeliveryPartner(
        id: string,
        companyId: string,
        data: Partial<IDeliveryPartner>,
    ) {
        try {
            const updatedDeliveryPartner =
                await this.deliveryPartnerModel.findOneAndUpdate(
                    { _id: id, companyId },
                    data,
                    {
                        new: true, // Return the modified document
                        runValidators: true, // Run model validations
                    },
                );

            if (!updatedDeliveryPartner) {
                throw new Error("Delivery Partner not found");
            }

            this.logger.info(`Delivery Partner updated: ${id}`);
            return updatedDeliveryPartner;
        } catch (error) {
            this.logger.error("Error updating delivery partner", error);
            throw error;
        }
    }

    async deleteDeliveryPartner(id: string, companyId: string) {
        try {
            const result = await this.deliveryPartnerModel.findOneAndDelete({
                _id: id,
                companyId,
            });

            if (!result) {
                throw new Error("Delivery Partner not found");
            }

            this.logger.info(`Delivery Partner deleted: ${id}`);
        } catch (error) {
            this.logger.error("Error deleting delivery partner", error);
            throw error;
        }
    }

    async getDeliveryPartners(companyId: string) {
        try {
            const deliveryPartners = await this.deliveryPartnerModel.find({
                companyId,
            });

            return deliveryPartners;
        } catch (error) {
            this.logger.error("Error fetching delivery partners", error);
            throw error;
        }
    }

    async getDeliveryPartnerById(id: string, companyId: string) {
        try {
            const deliveryPartner = await this.deliveryPartnerModel.findOne({
                _id: id,
                companyId,
            });

            if (!deliveryPartner) {
                throw new Error("Delivery Partner not found");
            }

            return deliveryPartner;
        } catch (error) {
            this.logger.error("Error fetching delivery partner by ID", error);
            throw error;
        }
    }
}
