import { Router, Request, Response } from "express";
import Package, { IPackage } from "../models/packageModel";
import authenticate from "../middlewares/authenticate";
import createHttpError from "http-errors";

const router: Router = Router();

// Get All Packages
router.get("/", async (req: Request, res: Response) => {
    try {
        const packages: IPackage[] = await Package.find();
        res.json(packages);
    } catch (err) {
        throw createHttpError(400, "Package not found!");
    }
});

// Add New Package (Admin Only)
router.post("/", authenticate, async (req: Request, res: Response) => {
    // if (req.auth.role !== 'admin') {
    //     throw createHttpError(401, 'Unauthorized Request!');
    // }
    const { name, duration, price, requestLimit, apiAccess, support } =
        req.body;

    try {
        const newPackage: IPackage = new Package({
            name,
            duration,
            price,
            requestLimit,
            apiAccess,
            support,
        });

        await newPackage.save();
        res.json(newPackage);
    } catch (err) {
        throw createHttpError(400, "Package not Created!");
    }
});

export default router;
