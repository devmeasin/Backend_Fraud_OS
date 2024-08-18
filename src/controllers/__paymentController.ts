import axios from "axios";
import { Request, Response } from "express";
import { getBkashToken } from "../utils/getBkashToken"; // Utility to get the bKash token
import Package from "../models/packageModel"; // Adjust the path
import { UserPackage } from "../models/userSubscriptionModel";

// Initiate bKash payment
export const initiateBkashPayment = async (req: Request, res: Response) => {
    const { userId, packageId } = req.body;

    const token = await getBkashToken(); // Obtain the token

    try {
        const selectedPackage = await Package.findById(packageId);
        if (!selectedPackage) {
            return res.status(404).json({ message: "Package not found" });
        }

        // bKash API call to initiate payment
        const response = await axios.post(
            "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create",
            {
                amount: selectedPackage.price || 100,
                currency: "BDT",
                merchantInvoiceNumber: `invoice-${Date.now()}`,
                intent: "sale",
                // Add other required fields
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-APP-Key": process.env.BKASH_APP_KEY || "",
                },
            },
        );

        if (response.data.statusCode === "0000") {
            res.status(200).json({ paymentUrl: response.data.bkashURL });
        } else {
            res.status(500).json({ message: "Failed to initiate payment" });
        }
    } catch (error) {
        res.status(500).json({ message: "Payment initiation failed", error });
    }
};

// Confirm bKash payment
export const confirmBkashPayment = async (req: Request, res: Response) => {
    const { paymentID, userId, packageId } = req.body;
    const token = await getBkashToken(); // Obtain the token

    try {
        // Confirm payment
        const response = await axios.post(
            "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
            {
                paymentID,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-APP-Key": process.env.BKASH_APP_KEY || "",
                },
            },
        );

        if (response.data.statusCode === "0000") {
            // Payment successful, activate the package
            const selectedPackage = await Package.findById(packageId);
            if (!selectedPackage) {
                return res.status(404).json({ message: "Package not found" });
            }

            const expiryDate = new Date();
            expiryDate.setDate(
                expiryDate.getDate() + selectedPackage.validityDays,
            );

            const userPackage = new UserPackage({
                userId,
                packageId: selectedPackage._id,
                usedRequests: 0,
                remainingRequests: selectedPackage.requestLimit,
                purchaseDate: new Date(),
                expiryDate,
                isActive: true,
            });

            await userPackage.save();
            res.status(200).json({
                message: "Payment successful, package activated",
            });
        } else {
            res.status(500).json({ message: "Payment confirmation failed" });
        }
    } catch (error) {
        res.status(500).json({ message: "Payment confirmation failed", error });
    }
};
