import { Model } from "mongoose";
import { IDeliveryPartner } from "../../models/deliveryChannel/deliveryPartnerModel";
import { Logger } from "winston";
import { ERROR_MESSAGES } from "../../constants/errorMessages";

export class DeliveryPartnerService {
    constructor(
        private deliveryPartnerModel: Model<IDeliveryPartner>,
        private logger: Logger,
    ) {}

    async createDeliveryPartner(data: Partial<IDeliveryPartner>) {
        const deliveryPartner = new this.deliveryPartnerModel(data);
        await deliveryPartner.save();
        this.logger.info(
            `Delivery Partner created: ${deliveryPartner._id as string}`,
        );
        return deliveryPartner;
    }

    async updateDeliveryPartner(
        id: string,
        companyId: string,
        data: Partial<IDeliveryPartner>,
    ) {
        const updatedDeliveryPartner =
            await this.deliveryPartnerModel.findOneAndUpdate(
                { _id: id, companyId },
                data,
                { new: true, runValidators: true },
            );
        if (!updatedDeliveryPartner) {
            throw new Error(ERROR_MESSAGES.DELIVERY_PARTNER_NOT_FOUND);
        }
        this.logger.info(`Delivery Partner updated: ${id}`);
        return updatedDeliveryPartner;
    }

    async deleteDeliveryPartner(id: string, companyId: string) {
        const result = await this.deliveryPartnerModel.findOneAndDelete({
            _id: id,
            companyId,
        });
        if (!result) {
            throw new Error(ERROR_MESSAGES.DELIVERY_PARTNER_NOT_FOUND);
        }
        this.logger.info(`Delivery Partner deleted: ${id}`);
    }

    async getDeliveryPartners(companyId: string) {
        return this.deliveryPartnerModel.find({ companyId });
    }

    async getDeliveryPartnerById(id: string, companyId: string) {
        const deliveryPartner = await this.deliveryPartnerModel.findOne({
            _id: id,
            companyId,
        });
        if (!deliveryPartner) {
            throw new Error(ERROR_MESSAGES.DELIVERY_PARTNER_NOT_FOUND);
        }
        return deliveryPartner;
    }
}
