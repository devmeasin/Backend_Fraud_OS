import { Router, Request, Response } from "express";
import Transaction, { ITransaction } from "../models/purchaseHistoryModel";
import { User, IUser } from "../models/userModel";
import Package, { IPackage } from "../models/packageModel";

import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";

const router: Router = Router();

// Handle Payment
router.post("/", authenticate, async (req: Request, res: Response) => {
    const authRequest = req as AuthRequest;

    const { packageId, transactionId } = req.body;

    try {
        const user: IUser | null = await User.findById(authRequest.auth.sub);
        const selectedPackage: IPackage | null =
            await Package.findById(packageId);

        if (!user || !selectedPackage) {
            return res.status(400).json({ msg: "Invalid user or package" });
        }

        const transaction: ITransaction = new Transaction({
            userId: user.id,
            packageId,
            transactionId,
            status: "Success",
        });

        await transaction.save();

        // Update user's subscription and request limit
        user.currentPackage = selectedPackage.id;
        user.remainingRequests = selectedPackage.requestLimit;
        await user.save();

        res.json({ msg: "Payment successful and package activated" });
    } catch (err) {
        // console.error(err.message);
        res.status(500).send("Server error");
    }
});

export default router;
