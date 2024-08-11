import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { loginSchema, registerSchema } from "../validator/authValidationSchema";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import {
    AuthRequest,
    RegisterUserRequest,
    UserData,
    UserData_delPassword,
} from "../types";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    async register(req: Request, res: Response, next: NextFunction) {
        await checkSchema(registerSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            fullName,
            companyName,
            companyWebsite,
            email,
            phone,
            password,
        } = req.body;

        this.logger.debug("New request to register a user", {
            fullName,
            companyName,
            companyWebsite,
            email,
            phone,
            password: "******",
        });

        try {
            const user = await this.userService.create({
                fullName,
                companyName,
                companyWebsite,
                email,
                phone,
                password,
            });
            this.logger.info("User has benn Register", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // presist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken.id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });

            res.status(201).json({ id: user.id, role: user.role });
        } catch (err) {
            return next(err);
        }
        // Generate OTP for phone verification
        // await this.otpService.generateOTP(user.id);
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        await checkSchema(loginSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //check the user exist or not
        const { phone, password } = req.body;

        try {
            const user = await this.userService.findByPhone(String(phone));
            if (!user) {
                const err = createHttpError(
                    400,
                    "Phone or password was worong!",
                );
                return next(err);
            }

            // check password
            const isMatchPassword =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );
            if (!isMatchPassword) {
                const err = createHttpError(
                    400,
                    "Phone or password was worong!",
                );
                return next(err);
            }

            this.logger.info("User has benn Login", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // presist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken.id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });
            res.json({ id: user.id, role: user.role });
        } catch (err) {
            return next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const userData = await this.userService.findById(req.auth.sub);
        const userWithoutPassword = (userData: UserData) => {
            const userCopy: UserData_delPassword = { ...userData }; // CREATE A COPY OF THE OBJECT
            if (userCopy.password) {
                delete userCopy.isActive;
                delete userCopy.isEmailVerified;
                delete userCopy.isPhoneVerified;
                delete userCopy.isVerified;
                delete userCopy.role;
                delete userCopy.password; // DELETE THE PASSWORD PROPERTY
            }
            return userCopy; // RETURN UPDATED USER
        };
        return res.json(userData && userWithoutPassword(userData));
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const user = await this.userService.findById(req.auth.sub);

            this.logger.info("User has ben Refresh", { id: req.auth.sub });

            if (!user) {
                const err = createHttpError(404, "User not found");
                return next(err);
            }

            const accessToken = this.tokenService.generateAccessToken(payload);

            // presist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken.id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });
            res.json({ id: user.id });
        } catch (err) {
            return next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out", { id: req.auth.sub });

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({});
        } catch (err) {
            return next(err);
        }
    }

    // Other methods for OTP verification, forgot password, reset password, etc.
}
