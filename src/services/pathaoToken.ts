import createHttpError from "http-errors";
import PathaoToken from "../models/pathaoTokenModel";
import { LoginResponse } from "../types";

export class PathaoTokenService {
    constructor(private pathaoToken = PathaoToken) {}

    async getPathaoTokenfromDB(userId: string) {
        try {
            return await this.pathaoToken
                .findOne(
                    { user: userId },
                    "access_token refresh_token expires_at",
                )
                .exec();
        } catch (error) {
            throw createHttpError(500, "Error while getPTokenfromDB!");
        }
    }

    async storePathaoTokenfromDB(userId: string, tokenData: LoginResponse) {
        try {
            // Use findOneAndUpdate with upsert option to update or create token data
            const updatedToken = await this.pathaoToken
                .findOneAndUpdate(
                    { user: userId },
                    { ...tokenData },
                    { new: true, upsert: true }, // upsert ensures update if exists, insert if not
                )
                .exec();

            return updatedToken;
        } catch (error) {
            throw createHttpError(
                500,
                "Error while storing Pathao token in DB!",
            );
        }
    }
}
