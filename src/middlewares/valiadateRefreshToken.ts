import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { AuthCookie, IRefreshTokenPayload } from "../types";
import { RefreshTokenModel as RefreshToken } from "../models/refreshToken";
import logger from "../utils/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],

    getToken: (req: Request) => (req.cookies as AuthCookie).refreshToken,

    async isRevoked(req: Request, token) {
        try {
            const refreshTokenId = (token?.payload as IRefreshTokenPayload).id;
            const userId = token?.payload?.sub;

            const refreshToken = await RefreshToken.findOne({
                _id: refreshTokenId,
                user: userId,
            });

            return refreshToken === null;
        } catch (error) {
            logger.error("Error while validating refresh token", {
                refreshTokenId: (token?.payload as IRefreshTokenPayload).id,
            });
        }

        return true;
    },
});
