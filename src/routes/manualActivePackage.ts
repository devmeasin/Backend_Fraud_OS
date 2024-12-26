import { NextFunction, Request, Response, Router } from "express";
import createHttpError from "http-errors";
import authenticate from "../middlewares/authenticate";
import isAdmin from "../middlewares/isAdmin";
import Package from "../models/packageModel";
import Transaction from "../models/purchaseHistoryModel";
import { User } from "../models/userModel";
import { UserPackage } from "../models/userSubscriptionModel";

interface TransactionQuery {
    transactionId?: string;
    payerAccount?: string;
}

const router = Router();

router.post(
    "/assignPackage",
    authenticate,
    isAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, phone, packageId, transactionId, payerAccount } =
                req.body;

            if (!userId && !phone) {
                throw createHttpError(
                    400,
                    "Either User ID or Phone Number is required.",
                );
            }

            // Find the user
            const user = await User.findOne({
                $or: [{ _id: userId }, { phone }],
            }).exec();

            if (!user) {
                throw createHttpError(404, "User not found.");
            }

            if (user.status !== "active") {
                throw createHttpError(400, "User is not active.");
            }

            // Check if the user already has an active package
            const existingPackage = await UserPackage.findOne({
                userId: user._id,
                status: "active",
            }).exec();
            if (existingPackage) {
                throw createHttpError(
                    400,
                    "User already has an active package.",
                );
            }

            // Find the selected package
            let selectedPackage;
            let purchaseDate = new Date();

            if (transactionId || payerAccount) {
                // Option 1: Validate transaction-based assignment
                const transactionQuery: TransactionQuery = {};
                if (transactionId)
                    transactionQuery.transactionId = transactionId;
                if (payerAccount) transactionQuery.payerAccount = payerAccount;

                const transaction = await Transaction.findOne(transactionQuery);
                if (!transaction) {
                    throw createHttpError(
                        404,
                        "Transaction not found with the provided details.",
                    );
                }

                selectedPackage = await Package.findById(transaction.packageId);
                if (!selectedPackage) {
                    throw createHttpError(
                        404,
                        "Package linked to transaction not found.",
                    );
                }

                // Use the transaction's purchase date
                purchaseDate = transaction.purchaseDate;
            } else if (packageId) {
                // Option 2: Manual assignment by admin
                selectedPackage = await Package.findById(packageId);
                if (!selectedPackage) {
                    throw createHttpError(404, "Package not found.");
                }
            } else {
                throw createHttpError(
                    400,
                    "Either transactionId, payerAccount, or packageId must be provided.",
                );
            }

            // Calculate the expiry date
            const expiryDate = new Date();
            expiryDate.setDate(
                expiryDate.getDate() + selectedPackage.validityDays,
            );

            // Create the UserPackage entry
            const userPackage = new UserPackage({
                userId: user._id || userId,
                packageId: selectedPackage._id,
                usedRequests: 0,
                remainingRequests: selectedPackage.requestLimit || 0,
                purchaseDate,
                expiryDate,
                isActive: true,
                isUnlimited: selectedPackage.isUnlimited || false,
                siteAccessLimit: selectedPackage.siteAccessLimit || 0,
            });

            await userPackage.save();

            res.status(201).json({
                message: "Package assigned successfully.",
                userPackage,
            });
        } catch (error) {
            console.log(error);
            next(createHttpError(500, "Failed to assign package."));
        }
    },
);

export default router;
