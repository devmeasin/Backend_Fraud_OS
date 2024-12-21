import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import { IMerchantInfo, IUser, User } from "../models/userModel";
import { UserData } from "../types";
import logger from "../utils/logger";
import mongoose from "mongoose";

export class UserService {
    async create(
        { fullName, email, phone, password }: UserData,
        session?: mongoose.ClientSession, // Optional session for transactions
    ): Promise<IUser> {
        // Check for existing users
        const existingUser = await User.findOne({
            $or: [{ phone }, { email }],
        }).session(session ?? null);
        if (existingUser) {
            throw createHttpError(400, "Phone or email already registered!");
        }

        // Hash password securely
        if (!password) {
            throw createHttpError(
                400,
                "Password is required and cannot be empty",
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = new User({
                fullName,
                email,
                phone,
                password: hashedPassword,
                role: Roles.OWNER,
                companies: [],
            });

            const validationError = user.validateSync();
            if (validationError) {
                throw createHttpError(
                    400,
                    `Validation error: ${validationError.message}`,
                );
            }

            return await user.save({ session });
        } catch (err: any) {
            logger.error("Error during user registration", { error: err });

            // Handle specific error cases

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
