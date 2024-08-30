import { Router, Request, Response, NextFunction } from "express";
import { checkSchema, validationResult } from "express-validator";
import Package, { IPackage } from "../models/packageModel";
import authenticate from "../middlewares/authenticate";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";
import { packageValidationSchema } from "../validator/packageValidationSchema";
import { UserPackage } from "../models/userSubscriptionModel";

const router: Router = Router();

// Get All Packages (Excluding "Free Trial")FREE TRIAL
// Get All Packages (Excluding "Free Trial")
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const packages: IPackage[] = await Package.find({
            name: { $ne: "FREE TRIAL" },
        });

        // Transform _id to id
        const transformedPackages = packages.map((pkg) => ({
            id: (pkg as any)._id.toString(),
            name: pkg.name,
            price: pkg.price,
            requestLimit: pkg.requestLimit,
            validityDays: pkg.validityDays,
            packageType: pkg.packegeType,
            apiAccess: pkg.apiAccess,
        }));

        res.json(transformedPackages);
    } catch (err) {
        next(createHttpError(400, "Packages not found!"));
    }
});

// Add New Package (Admin Only)
router.post(
    "/create",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;

        if (authReq.auth.role !== "admin") {
            return next(createHttpError(401, "Unauthorized Request!"));
        }
        await checkSchema(packageValidationSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name,
            price,
            requestLimit,
            packageType,
            validityDays,
            apiAccess,
            isUnlimited,
        } = req.body;

        try {
            const newPackage: IPackage = new Package({
                name,
                price,
                requestLimit,
                packageType,
                validityDays,
                apiAccess,
                isUnlimited,
            });

            await newPackage.save();
            res.status(201).json(newPackage);
        } catch (err) {
            next(createHttpError(400, "Package not Created!"));
        }
    },
);

// Check User Current Package
router.get(
    "/current",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;
        try {
            const userCurrentPackage = await UserPackage.find({
                userId: authReq.auth.sub,
                isActive: true,
            }).sort({ createdAt: -1 });
            res.json({ userCurrentPackage });
        } catch (err) {
            next(createHttpError(400, "User Package not found!"));
        }
    },
);

export default router;
