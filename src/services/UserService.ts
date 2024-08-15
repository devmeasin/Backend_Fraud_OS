import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import { IMerchantInfo, IUser, User } from "../models/userModel";
import { UserData } from "../types";
import logger from "../utils/logger";

export class UserService {
    async create({
        fullName,
        companyName,
        companyWebsite,
        email,
        phone,
        password,
    }: UserData): Promise<IUser> {
        const existingUserByPhone = await User.findOne({ phone });
        const existingUserByEmail = await User.findOne({ email });

        if (existingUserByPhone || existingUserByEmail) {
            throw createHttpError(400, "Phone already registered!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = new User({
                fullName,
                companyName,
                companyWebsite,
                email,
                phone,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            return await newUser.save();
        } catch (err) {
            throw createHttpError(
                500,
                "Failed to store the data in the database",
            );
        }
    }

    async updatePathaoMerchantInfo(
        userId: string,
        newMerchantInfo: IMerchantInfo,
    ) {
        try {
            const existingUser = await User.findById(userId).exec();

            if (!existingUser) {
                throw createHttpError(404, "User not found!");
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                {
                    isVerified: true,
                    isPhoneVerified: true,
                    pathaoMerchantInfo: newMerchantInfo,
                },
                { new: true },
            ).exec();

            return updatedUser;
        } catch (error) {
            logger.error("Error updating Pathao merchant info:", error);
            throw createHttpError(
                500,
                "Error while updating Pathao merchant info!",
            );
        }
    }

    async findByPhone(phone: string): Promise<IUser | null> {
        return await User.findOne({ phone }).exec();
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).exec();
    }
}
