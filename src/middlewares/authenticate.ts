import { Request } from "express";
import { expressjwt } from "express-jwt";
import jwksClient, { GetVerificationKey } from "jwks-rsa";
import { Config } from "../config";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],

    getToken: (req: Request) => {
        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "Bearer"
        ) {
            return req.headers.authorization.split(" ")[1];
        }
        type AuthCookies = {
            accessToken: string;
        };
        const { accessToken } = req.cookies as AuthCookies;
        return accessToken;
    },
});
