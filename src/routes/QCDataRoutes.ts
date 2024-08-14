import { NextFunction, Request, Router } from "express";
import authenticate from "../middlewares/authenticate";
// import checkAPILimit from "../middlewares/checkAPILimit";
import { RedX_Data } from "../api/redx";
import { checkSchema, validationResult } from "express-validator";
import { BDNumberShema } from "../validator/BDNumberShema";
import { Steadfast_Data } from "../api/steadfast";
import { loginToPathao } from "../api/pathao/loginService";
import { Pathao_Data } from "../api/pathao";
import { AuthRequest } from "../types";

const router = Router();

router.post(
    "/qc-data",
    authenticate,
    async (req: Request, res, next: NextFunction) => {
        const authRequest = req as AuthRequest;

        await checkSchema(BDNumberShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const redx = await RedX_Data(req.body.customer_number as string);
            const steadfast = await Steadfast_Data(
                req.body.customer_number as string,
            );

            const pathao = await Pathao_Data(
                authRequest.auth.sub,
                req.body.customer_number as string,
            );

            res.json({
                redx,
                steadfast,
                pathao,
            });
        } catch (error) {
            next(error);
            // throw createHttpError(403, next);
        }
    },
);

export default router;
