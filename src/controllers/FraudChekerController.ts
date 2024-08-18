import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { Logger } from "winston";
import { FraudCheckerService } from "../services/FraudCheckerService";
import { AuthRequest } from "../types";
import { courierDataTransform } from "../utils/dtos/courierDataTransform";
import { BDNumberShema } from "../validator/BDNumberShema";

export class FraudChekerController {
    constructor(
        private logger: Logger,
        private fraudCheckerService: FraudCheckerService,
    ) {}

    async courierReport(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        await checkSchema(BDNumberShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const customerNumber = req.body.customer_number as string;
            const userId = authRequest.auth.sub;

            const [redx, steadfast, pathao, paperfly] =
                await this.fraudCheckerService.fetchAllCourierData(
                    customerNumber,
                    userId,
                );
            const transformData = courierDataTransform({
                redx,
                steadfast,
                pathao,
                paperfly,
            });

            res.status(200).json({
                ...transformData,
            });
        } catch (error) {
            this.logger.error("Error fetching data:", error);
            res.status(500).json({ error: "Failed to fetch data" });
            next(error);
        }
    }
}
