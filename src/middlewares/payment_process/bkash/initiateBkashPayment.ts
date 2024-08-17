import axios from "axios";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import Package from "../../../models/packageModel"; // Adjust the path
import { AuthRequest } from "../../../types";
import { getBkashToken } from "../../../utils/getBkashToken";

// Initiate bKash payment
export const initiateBkashPayment = async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;
    const { packageId } = req.body;

    const token = await getBkashToken(); // Obtain the token

    // for the track of payment
    const customerId_packageId = JSON.stringify({
        customerId: authRequest.auth.sub,
        packageId,
    });

    try {
        const selectedPackage = await Package.findById(packageId);
        if (!selectedPackage) {
            throw createHttpError(404, "Package not found");
        }

        // bKash API call to initiate payment
        const response = await axios.post(
            "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
            {
                mode: "0011",
                payerReference: `${customerId_packageId}`,
                callbackURL:
                    "http://localhost:5001/api/payment/bkash/confirmation",
                amount: selectedPackage.price || 299,
                currency: "BDT",
                merchantInvoiceNumber: `invoice-${Date.now()}`,
                intent: "sale",
                // Add other required fields
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-APP-Key": "4f6o0cjiki2rfm34kfdadl1eqq",
                },
            },
        );

        if (response.data.statusCode === "0000") {
            res.status(200).json({ paymentUrl: response.data.bkashURL });
        } else {
            throw createHttpError(500, "Payment initiation failed");
        }
    } catch (error) {
        throw createHttpError(500, "Payment initiation failed");
    }
};
