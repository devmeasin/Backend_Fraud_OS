import createHttpError from "http-errors";
import { Logger } from "winston";
import { Paperfly_Data } from "../api/paperfly";
import { Pathao_Data } from "../api/pathao";
import { RedX_Data } from "../api/redx";
import { Steadfast_Data } from "../api/steadfast";
import CustomerQCData, { ICourierData } from "../models/customerQcModel"; // Import the model
import { retryApiCallWithCodeCheck } from "../utils/retryApiCall";

export class FraudCheckerService {
    constructor(private logger: Logger) {}

    // Function to handle API calls with retry logic
    async fetchAllCourierData(customerNumber: string, userId: string) {
        try {
            const redxPromise = retryApiCallWithCodeCheck(() =>
                RedX_Data(customerNumber),
            );
            const steadfastPromise = retryApiCallWithCodeCheck(() =>
                Steadfast_Data(customerNumber),
            );
            const pathaoPromise = retryApiCallWithCodeCheck(() =>
                Pathao_Data(userId, customerNumber),
            );
            const paperflyPromise = retryApiCallWithCodeCheck(() =>
                Paperfly_Data(customerNumber),
            );

            return Promise.all([
                redxPromise,
                steadfastPromise,
                pathaoPromise,
                paperflyPromise,
            ]);
        } catch (error) {
            this.logger.error(
                "Error fetchAllCourierData Fraud Checker Service:",
                error,
            );
            throw createHttpError(
                500,
                "Error while fetchAllCourierData!Fraud Checker Service ",
            );
        }
    }

    async customerQcData({
        customerNumber,
        userId,
        transformData,
    }: {
        customerNumber: string;
        userId: string;
        transformData: Record<string, ICourierData>;
    }) {
        try {
            // Log transformData to check its structure
            this.logger.info("Transform Data:", JSON.stringify(transformData));

            // Find existing document by userId and customerPhone
            const existingData = await CustomerQCData.findOne({
                userId,
                customerNumber: customerNumber,
            });

            if (existingData) {
                // Compare existing data with new transformData
                const isEqual =
                    JSON.stringify(existingData.courierData) ===
                    JSON.stringify(transformData);

                if (!isEqual) {
                    // Data is different, update the existing document
                    await CustomerQCData.updateOne(
                        { _id: existingData._id },
                        {
                            $set: {
                                courierData: transformData,
                                date: new Date().toISOString().split("T")[0],
                            },
                        },
                    );
                    this.logger.info(
                        `Updated courier data for customer ${customerNumber}`,
                    );
                } else {
                    this.logger.info(
                        `No changes detected for customer ${customerNumber}, skipping update.`,
                    );
                }
            } else {
                // No existing document, create a new one
                const newCourierData = new CustomerQCData({
                    userId,
                    date: new Date().toISOString().split("T")[0],
                    customerNumber: customerNumber,
                    courierData: transformData,
                });
                await newCourierData.save();
                this.logger.info(
                    `Created new courier data for customer ${customerNumber}`,
                );
            }
        } catch (error) {
            this.logger.error(
                "Error updating customerQcData in Fraud Checker Service:",
                error,
            );
            throw createHttpError(
                500,
                "Error while updating customerQcData in Fraud Checker Service!",
            );
        }
    }
}
