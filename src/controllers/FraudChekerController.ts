import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { Logger } from "winston";
import { FraudCheckerService } from "../services/FraudCheckerService";
import { AuthRequest } from "../types";
import { courierDataTransform } from "../utils/dtos/courierDataTransform";
import { BDNumberShema } from "../validator/BDNumberShema";
import createHttpError from "http-errors";

export class FraudCheckerController {
    constructor(
        private logger: Logger,
        private fraudCheckerService: FraudCheckerService,
    ) {}

    async customerQcReport(req: Request, res: Response, next: NextFunction) {
        const authRequest = req as AuthRequest;

        await checkSchema(BDNumberShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(createHttpError(400, "Invalid BD Customer Number"));
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

            // Save data in the database before sending a response
            await this.fraudCheckerService.customerQcData({
                customerNumber,
                userId,
                transformData,
            });

            // res.status(200).json({
            //     message: "Customer QC data fetched successfully",
            //     data: transformData,
            // });
            req.body.transformData = transformData;
            next();
        } catch (error) {
            this.logger.error("Error fetching or saving data:", error);
            next(createHttpError(500, "Failed to fetch or save data"));
        }
    }
}
