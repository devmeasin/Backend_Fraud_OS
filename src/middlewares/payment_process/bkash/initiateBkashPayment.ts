import { NextFunction, Request, Response } from "express";
import axios from "axios";
import createHttpError from "http-errors";
import Package from "../../../models/packageModel";
import { getBkashToken } from "../../../utils/getBkashToken";
import { AuthRequest } from "../../../types";
import mongoose from "mongoose";
import logger from "../../../utils/logger";

// Initiate bKash payment
export const initiateBkashPayment = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authRequest = req as AuthRequest;
    const { packageId } = req.body;

    try {
        // Obtain the token
        const token = await getBkashToken();

        // Track payment data
        const customerId_packageId = JSON.stringify({
            customerId: authRequest.auth.sub,
            packageId,
        });

        // Find the selected package in the database
        const selectedPackage = await Package.findById(packageId);
        if (!selectedPackage) {
            return createHttpError(404, "Package not found");
        }

        // bKash API call to initiate payment
        const response = await axios.post(
            "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
            {
                mode: "0011",
                payerReference: `${customerId_packageId}`,
                callbackURL: `http://localhost:5001/api/v1/payment/bkash/confirmation?userId=${authRequest.auth.sub}&packageId=${packageId}&amount=${selectedPackage.price}`,
                amount: selectedPackage.price || 299,
                currency: "BDT",
                merchantInvoiceNumber: `invoice-${Date.now()}`,
                intent: "sale",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-APP-Key": "4f6o0cjiki2rfm34kfdadl1eqq",
                },
            },
        );

        // Handle bKash API response
        if (response.data.statusCode === "0000") {
            res.status(200).json({ paymentUrl: response.data.bkashURL });
        } else {
            throw createHttpError(
                500,
                `Payment initiation failed: ${
                    response.data.statusMessage || "Unknown error"
                }`,
            );
        }
    } catch (error: any) {
        if (error instanceof mongoose.Error.CastError && error.path === "_id") {
            logger.error("Invalid ObjectId:", error.value);
            return next(
                createHttpError(400, `Invalid packageId: ${error.value}`),
            );
        } else if (error.response) {
            logger.error("Network error:", error.message);
            return next(
                createHttpError(
                    error.response.status || 500,
                    `bKash API error: ${
                        error.response.data?.message || error.message
                    }`,
                ),
            );
        } else if (error.request) {
            logger.error("Network error: No response received");
            return next(createHttpError(502, "No response from bKash API"));
        } else if (
            error.name === "MongoError" ||
            error.name === "MongooseError"
        ) {
            logger.error("Database error:", error.message);
            return next(
                createHttpError(500, "Database error while initiating payment"),
            );
        } else {
            logger.error("Unexpected error:", error.message);
            return next(createHttpError(500, "Unexpected error occurred"));
        }
    }
};
