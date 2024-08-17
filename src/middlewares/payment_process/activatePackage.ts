import { Request, Response } from "express";
import createHttpError from "http-errors";
import Package from "../../models/packageModel"; // Adjust path
import { UserPackage } from "../../models/userSubscriptionModel"; // Adjust path

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
        const selectedPackage = await Package.findById(packageId);

        if (!selectedPackage) {
            throw createHttpError(404, "Package not found");
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + selectedPackage.validityDays);

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

        res.redirect(
            `http://localhost:5173/payment/successful?tnxId=${transaction.transactionId}`,
        );
        ``;
    } catch (error) {
        throw createHttpError(500, "Failed to activate package");
    }
};
