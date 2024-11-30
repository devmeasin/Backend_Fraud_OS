import { Model } from "mongoose";
import { Logger } from "winston";
import { IDeliveryPartner } from "../../models/deliveryPartnerModel";

export class DeliveryPartnerService {
    constructor(
        private deliveryPartnerModel: Model<IDeliveryPartner>,
        private logger: Logger,
    ) {}

    async createDeliveryPartner(data: Partial<IDeliveryPartner>) {
        try {
            const deliveryPartner = new this.deliveryPartnerModel(data);
            await deliveryPartner.save();

            this.logger.info(
                `Delivery Partner created: ${deliveryPartner._id}`,
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
