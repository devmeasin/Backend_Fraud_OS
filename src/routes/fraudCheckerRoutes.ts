import { NextFunction, Request, Response, Router } from "express";
import { FraudChekerController } from "../controllers/FraudChekerController";
import authenticate from "../middlewares/authenticate";
import checkApiLimit from "../middlewares/checkAPILimit";
import { FraudCheckerService } from "../services/FraudCheckerService";
import logger from "../utils/logger";

// Define a type that includes the `code` field
const router = Router();

const fraudCheckerService = new FraudCheckerService();
const fraudCheckerController = new FraudChekerController(
    logger,
    fraudCheckerService,
);

router.post(
    "/qc-data",
    authenticate,
    checkApiLimit,
    (req: Request, res: Response, next: NextFunction) =>
        fraudCheckerController.courierReport(req, res, next),
);

export default router;
