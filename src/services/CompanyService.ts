import { Types } from "mongoose";
import { Company, ICompany } from "../models/companyModel";
import { User, IUser } from "../models/userModel";

export class CompanyService {
    /**
     * Create a new company and associate it with the owner
     */
    async createCompany(
        userId: string,
        companyData: Partial<ICompany>,
    ): Promise<ICompany> {
        const company: ICompany = await Company.create({
            ...companyData,
            owner: userId,
            users: [{ userId, role: "OWNER" }],
        });

        await User.findByIdAndUpdate(userId, {
            $push: {
                companies: {
                    companyId: company._id,
                    role: "OWNER",
                },
            },
        });

        return company;
    }

    /**
     * Add a user to an existing company
     */
    async addUserToCompany(
        companyId: string,
        userId: string,
        role: "ADMIN" | "EMPLOYEE",
    ): Promise<ICompany> {
        const company = await Company.findById(companyId);
        if (!company) {
            throw new Error("Company not found");
        }

        if (
            company.users.some(
                (u) => JSON.stringify(u.userId).toString() === userId,
            )
        ) {
            throw new Error("User is already part of the company");
        }

        company.users.push({ userId: new Types.ObjectId(userId), role });
        await company.save();

        await User.findByIdAndUpdate(userId, {
            $push: {
                companies: {
                    companyId,
                    role,
                },
            },
        });

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
            // Use a Set to filter unique company IDs
            const uniqueCompanies = Array.from(
                new Set(user.companies.map((c) => JSON.stringify(c.companyId))),
            ).map((company) => JSON.parse(company) as ICompany);

            return uniqueCompanies;
        }

        return [];
    }
}
