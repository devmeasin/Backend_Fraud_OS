import crypto from "node:crypto";
import { User } from "../models/userModel"; // Adjust the path to your User model
import createHttpError from "http-errors";

// Function to generate a random API secret
export const generateApiSecret = (): string => {
    return crypto.randomBytes(32).toString("hex"); // Generates a 64-character hex string
};

// Function to create or update a user with a new API secret
export const updateUserApiSecret = async (userId: string) => {
    try {
        const apiSecret = generateApiSecret(); // Generate a new API secret
        const user = await User.findById(userId);

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        user.apiSecret = apiSecret;
        user.apiSecretStatus = true;
        await user.save(); // Save the user with the new API secret
    } catch (error) {
        throw createHttpError(500, "Failed to update API secret");
    }
};

export const getUserApiSecret = async (userId: string) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw createHttpError(404, "User not found");
        }
        return user;
    } catch (error) {
        throw createHttpError(500, "Failed to update API secret");
    }
};

// Function to enable or disable the API secret
export const setApiSecretStatus = async (
    userId: string,
    apiSecretStatus: boolean,
) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        user.apiSecretStatus = apiSecretStatus;
        await user.save(); // Save the user with the updated API secret status
    } catch (error) {
        throw createHttpError(500, "Failed to update API secret status");
    }
};
