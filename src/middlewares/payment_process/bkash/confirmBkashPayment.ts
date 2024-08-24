import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { getBkashToken } from "../../../utils/getBkashToken";
import createHttpError from "http-errors";
import Transaction from "../../../models/purchaseHistoryModel";
import logger from "../../../utils/logger";

interface BkashConfirmationQuery {
    paymentID: string;
    status: string;
    userId: string;
    packageId: string;
    amount: string;
}

// Confirm bKash payment
export const confirmBkashPayment = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = await getBkashToken(); // Obtain the token
        const { paymentID, status, userId, packageId, amount } =
            req.query as unknown as BkashConfirmationQuery;

        if (status === "cancel" || status === "failure") {
            const transaction = new Transaction({
                userId: userId,
                packageId: packageId,
                paymentID: paymentID,
                amount: amount, // Provide a default value if not available
                transactionId: "N/A", // Provide a default value if not available
                paymentStatus: status === "cancel" ? "Cancelled" : "Failed",
                transactionStatus: "Failed",
                purchaseDate: new Date(),
                createdAt: new Date(),
            });

            try {
                await transaction.save();
            } catch (error) {
                logger.error("Error storing failed transaction:", error);
                throw createHttpError(500, "Payment Store Failed in DB");
            }

            return res.redirect(
                `http://localhost:5173/payment/error?message=${status}`,
            );
        }

        if (status === "success") {
            // Confirm payment
            const { data } = await axios.post(
                "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
                {
                    paymentID,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "X-APP-Key": "4f6o0cjiki2rfm34kfdadl1eqq",
                    },
                },
            );

            if (data.statusCode === "0000") {
                // Payment successful, activate the package
                const parseData = JSON.parse(data.payerReference as string);
                req.body.userId = parseData.customerId;
                req.body.packageId = parseData.packageId;

                try {
                    // Create a new Transaction document
                    const transaction = new Transaction({
                        userId: parseData.customerId,
                        packageId: parseData.packageId,
                        amount: data.amount, // Assuming `data.amount` contains the payment amount
                        paymentID: data.paymentID,
                        transactionId: data.trxID,
                        paymentStatus: data.statusMessage,
                        payerAccount: data.payerAccount,
                        payerReference: `${parseData.customerId}_${parseData.packageId}`,
                        transactionStatus: data.transactionStatus,
                        purchaseDate: new Date(),
                        createdAt: new Date(),
                    });

                    // Save the transaction to the database
                    await transaction.save();

                    req.body.transaction = transaction;
                } catch (error) {
                    throw createHttpError(500, "Payment Store Faild in DB");
                }

                next();
            } else {
                throw createHttpError(400, "Payment confirmation failed");
            }
        } else {
            throw createHttpError(400, "Invalid status");
        }
    } catch (error) {
        next("Payment confirmation failed");
    }
};
