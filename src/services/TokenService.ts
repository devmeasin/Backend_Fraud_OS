import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Config } from "../config";
import { IUser } from "../models/userModel"; // Import the User model
import { RefreshTokenModel, IRefreshToken } from "../models/refreshToken"; // Import the RefreshToken model

export class TokenService {
    constructor(private refreshTokenModel = RefreshTokenModel) {}

    generateAccessToken(payload: JwtPayload): string {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (err) {
            throw createHttpError(500, "Error while reading private key");
        }

        return sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
        });
    }

    generateRefreshToken(payload: JwtPayload): string {
        return sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            jwtid: String(payload.jwtid),
        });
    }

    async persistRefreshToken(
        user: IUser,
        cid: string,
    ): Promise<IRefreshToken> {
        const newRefreshToken = new this.refreshTokenModel({
            expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            user: user._id, // Assuming `user` is an object with `_id` property
            cid: cid,
        });

        return await newRefreshToken.save();
    }

    async deleteRefreshToken(tokenId: string, cid: string): Promise<void> {
        await this.refreshTokenModel
            .deleteMany({ user: tokenId, cid: cid })
            .exec();
    }
}
