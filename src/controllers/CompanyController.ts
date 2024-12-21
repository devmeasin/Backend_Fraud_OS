import { Request, Response } from "express";
// import { UserService } from "../services/UserService";
import { CompanyService } from "../services/CompanyService";
import { ICompany } from "../models/companyModel";
import { Logger } from "winston";
import { AuthRequest } from "../types";
// import { IUser } from "../models/userModel";

export class CompanyController {
    constructor(
        // private userService: UserService,
        private logger: Logger,
        private companyService: CompanyService,
    ) {}

    /**
     * Create a new company
     * @param req
     * @param res
     */
    async createCompany(req: Request, res: Response): Promise<void> {
        try {
            const { userId, company } = req.body;

            this.logger.info("Validating createCompany input", {
                userId,
                company,
            });

            if (!userId || !company) {
                throw new Error(
                    "Invalid input: userId and company data are required",
                );
            }

            const createdCompany: ICompany =
                await this.companyService.createCompany(
                    userId as string,
                    company as ICompany,
                );

            this.logger.info("Company created successfully", {
                companyId: createdCompany._id,
            });

            res.status(201).json({
                message: "Company created successfully",
                company: createdCompany,
            });
        } catch (error) {
            this.logger.error("Error creating company");
            res.status(500).json({
                message: "Failed to create company",
            });
        }
    }

    /**
     * Add a user to an existing company
     * @param req
     * @param res
     */
    async addUserToCompany(req: Request, res: Response): Promise<void> {
        try {
            const { companyId, userId, role } = req.body;

            this.logger.info("Validating addUserToCompany input", {
                companyId,
                userId,
                role,
            });

            if (!companyId || !userId || !role) {
                throw new Error(
                    "Invalid input: companyId, userId, and role are required",
                );
            }

            const result = await this.companyService.addUserToCompany(
                companyId as string, // Type assertion
                userId as string,
                role as "admin" | "employee" | "owner" | "manager",
            );

            this.logger.info("User added to company successfully", {
                companyId,
                userId,
                role,
            });

            res.status(200).json({
                message: "User added to company successfully",
                result,
            });
        } catch (error) {
            this.logger.error("Error adding user to company");
            res.status(500).json({
                message: "Failed to add user to company",
            });
        }
    }

    /**
     * Fetch all companies associated with a user
     * @param req
     * @param res
     */
    async getUserCompanies(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.auth.sub;

            this.logger.info("Validating getUserCompanies input", { userId });

            if (!userId) {
                throw new Error("Invalid input: userId is required");
            }

            const companies: ICompany[] =
                await this.companyService.getUserCompanies(userId);

            this.logger.info("Fetched user companies successfully", {
                userId,
                companiesCount: companies.length,
            });

            res.status(200).json({
                message: "Fetched user companies successfully",
                companies,
            });
        } catch (error) {
            this.logger.error("Error fetching user companies");
            res.status(500).json({
                message: "Failed to fetch user companies",
            });
        }
    }
}
