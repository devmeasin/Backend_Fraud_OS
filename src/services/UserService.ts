import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import { IUser, User } from "../models/userModel";
import { UserData } from "../types";

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

    async findByPhone(phone: string): Promise<IUser | null> {
        return await User.findOne({ phone }).exec();
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).exec();
    }
}
