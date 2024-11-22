import { Request, Response } from "express";
import createHttpError from "http-errors";
import Package from "../../models/packageModel"; // Adjust path
import { UserPackage } from "../../models/userSubscriptionModel"; // Adjust path
import { Config } from "../../config";

export const activatePackage = async (req: Request, res: Response) => {
    const { userId, packageId, transaction } = req.body;

    // Check if transaction is not successful
    if (transaction.paymentStatus !== "Successful") {
        throw createHttpError(400, "Payment not successful");
    }

    if (!userId || !packageId) {
        throw createHttpError(
            400,
            "Payment required to Actived Package also user fields required",
        );
    }

    try {
        // Fetch the selected package by ID
        const selectedPackage = await Package.findById(packageId);

        if (!selectedPackage) {
            throw createHttpError(404, "Package not found");
        }

        // Validate package validity and set expiry date
        if (
            !selectedPackage.validityDays ||
            selectedPackage.validityDays <= 0
        ) {
            throw createHttpError(400, "Invalid package validity period");
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + selectedPackage.validityDays);

        // Create the user package with default fallback values
        const userPackage = new UserPackage({
            userId,
            packageId: selectedPackage._id,
            usedRequests: 0,
            remainingRequests: selectedPackage.requestLimit || 0, // Default to 0 if undefined
            purchaseDate: new Date(),
            expiryDate,
            isActive: true,
            isUnlimited: selectedPackage.isUnlimited || false, // Default to false if undefined
            siteAccessLimit: selectedPackage.siteAccessLimit || 0, // Default to 0 if undefined
        });

        // Save the user package in the database
        await userPackage.save();

        // Redirect to the payment success page
        res.redirect(
            `${Config.FRONTEND_URL}/payment/successful?tnxId=${transaction.transactionId}`,
        );
    } catch (error) {
        throw createHttpError(500, "Failed to activate package");
    }
};
