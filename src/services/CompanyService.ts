import mongoose, { Types } from "mongoose";
import { Company, ICompany } from "../models/companyModel";
import { User, IUser } from "../models/userModel";
import createHttpError from "http-errors";

export class CompanyService {
    /**
     * Create a new company and associate it with the owner
     */
    async createCompany(
        userId: string,
        companyData: Partial<ICompany>,
        session?: mongoose.ClientSession, // Optional session for transaction
    ): Promise<ICompany> {
        // Validate user existence
        const user = await User.findById(userId).session(session ?? null);
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        // Start a transaction if not already in one
        let isTransactionInitiated = false;
        if (!session) {
            session = await mongoose.startSession();
            session.startTransaction();
            isTransactionInitiated = true;
        }

        try {
            // Create the company
            // Create the company
            const company: ICompany[] = await Company.create(
                [
                    {
                        ...companyData,
                        owner: userId,
                        users: [
                            {
                                userId: new Types.ObjectId(userId),
                                role: "owner",
                            },
                        ],
                    },
                ],
                { session },
            );

            // Update the user's companies list
            (
                user.companies as {
                    companyId?: mongoose.Types.ObjectId;
                    role: "owner" | "admin" | "employee" | "manager";
                }[]
            ).push({
                companyId: company[0]._id,
                role: "owner",
            });

            await user.save({ session });

            // Commit the transaction if it was initiated in this method
            if (isTransactionInitiated) {
                await session.abortTransaction();
                await session.endSession();
            }

            return company[0];
        } catch (err) {
            // Rollback transaction if any step fails
            if (isTransactionInitiated) {
                await session.abortTransaction();
                await session.endSession();
            }
            throw createHttpError(500, "Failed to create company");
        }
    }

    /**
     * Add a user to an existing company
     */
    async addUserToCompany(
        companyId: string,
        userId: string,
        role: "admin" | "employee" | "owner" | "manager",
        session?: mongoose.ClientSession,
    ): Promise<ICompany> {
        const company = await Company.findById(companyId).session(
            session ?? null,
        );
        if (!company) {
            throw createHttpError(404, "Company not found");
        }

        // Check if the user is already part of the company
        if (company.users.some((u) => u.userId.toString() === userId)) {
            throw createHttpError(400, "User is already part of the company");
        }

        // Add the user to the company
        company.users.push({ userId: new Types.ObjectId(userId), role: role });
        await company.save({ session });

        // Add the company to the user's list
        await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    companies: {
                        companyId: companyId,
                        role: role,
                    },
                },
            },
            { session },
        );

        return company;
    }

    /**
     * Fetch all companies associated with a user
     */
    async getUserCompanies(userId: string): Promise<ICompany[]> {
        const user: IUser | null = await User.findById(userId).populate(
            "companies.companyId",
        );

        if (user?.companies) {
            const uniqueCompanies = Array.from(
                new Set(user.companies.map((c) => JSON.stringify(c.companyId))),
            ).map((company) => JSON.parse(company) as ICompany);

            return uniqueCompanies;
        }

        return [];
    }
}
