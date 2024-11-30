import { Types } from "mongoose";
import Customer, { ICustomer } from "../models/customerModel";
import createHttpError from "http-errors";

export class CustomerService {
    async createCustomer(customerData: Partial<ICustomer>): Promise<ICustomer> {
        const existingCustomer = await Customer.findOne({
            companyId: customerData.companyId,
            phone: customerData.phone,
        });

        if (existingCustomer) {
            throw createHttpError(
                400,
                "Customer with this phone number already exists",
            );
        }

        const customer = new Customer(customerData);
        return await customer.save();
    }

    async updateCustomer(
        customerId: string,
        companyId: string,
        updateData: Partial<ICustomer>,
    ): Promise<ICustomer | null> {
        const customer = await Customer.findOneAndUpdate(
            {
                _id: customerId,
                companyId: companyId,
            },
            { $set: updateData },
            { new: true },
        );

        if (!customer) {
            throw createHttpError(404, "Customer not found");
        }

        return customer;
    }

    async deleteCustomer(customerId: string, companyId: string): Promise<void> {
        const result = await Customer.deleteOne({
            _id: customerId,
            companyId: companyId,
        });

        if (result.deletedCount === 0) {
            throw createHttpError(404, "Customer not found");
        }
    }

    async getCustomersByCompany(companyId: string): Promise<ICustomer[]> {
        return await Customer.find({ companyId: companyId });
    }
}
