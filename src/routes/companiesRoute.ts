import express, { Request, Response } from "express";
import logger from "../utils/logger";

// Controller imports
import { CompanyController } from "../controllers/CompanyController";

// Middlewares
import authenticate from "../middlewares/authenticate";

// Services
import { CompanyService } from "../services/CompanyService";

const router = express.Router();

// Initialize services and controllers
const companyService = new CompanyService();
const companyController = new CompanyController(logger, companyService);

/**
 * Route to create a company
 */
router.post("/create", authenticate, (req: Request, res: Response) =>
    companyController.createCompany(req, res),
);

/**
 * Route to add a user to a company
 */
router.post("/add-user", authenticate, (req: Request, res: Response) =>
    companyController.addUserToCompany(req, res),
);

/**
 * Route to fetch all companies associated with a user
 */
router.get("/getCompanies", authenticate, (req: Request, res: Response) =>
    companyController.getUserCompanies(req, res),
);

export default router;
