import { NextFunction, Request, Response, Router } from "express";
import authenticate from "../middlewares/authenticate";
import checkApiLimit from "../middlewares/checkAPILimit";
import { FraudCheckerController } from "../controllers/FraudChekerController";
import { FraudCheckerService } from "../services/FraudCheckerService";
import logger from "../utils/logger";
import apiLimitDecrease from "../middlewares/apiLimitDecrease";

// Define a type that includes the `code` field
const router = Router();

const fraudCheckerService = new FraudCheckerService(logger);
const fraudCheckerController = new FraudCheckerController(
    logger,
    fraudCheckerService,
);

router.post(
    "/qc-data",
    authenticate,
    checkApiLimit,
    (req: Request, res: Response, next: NextFunction) =>
        fraudCheckerController.customerQcReport(req, res, next),
    apiLimitDecrease,
);

export default router;
