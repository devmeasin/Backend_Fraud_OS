import { Router, Request, Response, NextFunction } from "express";
import authenticate from "../middlewares/authenticate";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";
import Transaction, { ITransaction } from "../models/purchaseHistoryModel";

const router: Router = Router();

router.get(
    "/",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        const userId = authReq.auth.sub;

        try {
            const transactions: ITransaction[] = await Transaction.find({
                userId,
            })
                .populate(["userId", "packageId"])
                .sort({ createdAt: -1 });

            // Transform the transactions
            const transformedTransactions = transactions.map((transaction) => {
                const transactionObj = transaction.toObject();

                const date = new Date(transactionObj.purchaseDate as string);
                // Options for formatting the date
                const dateFormatter = new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });

                const formattedDate = dateFormatter.format(date);

                transactionObj.id = transactionObj._id;
                transactionObj.user = {
                    id: transactionObj.userId._id,
                    fullName: transactionObj.userId.fullName,
                    companyName: transactionObj.userId.companyName,
                    email: transactionObj.userId.email,
                    phone: transactionObj.userId.phone,
                };
                // Only keep the `name` property from `packageId`
                transactionObj.packageName = transactionObj.packageId.name;
                transactionObj.purchaseDate = formattedDate;

                delete transactionObj.userId;
                delete transactionObj.packageId;
                delete transactionObj.payerReference;
                delete transactionObj._id;
                delete transactionObj.__v;
                return transactionObj as ITransaction;
            });

            res.json(transformedTransactions);
        } catch (err) {
            next(createHttpError(400, "Packages not found!"));
        }
    },
);

export default router;
