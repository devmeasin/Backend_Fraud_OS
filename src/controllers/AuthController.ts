import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";

// import services
import { assignFreeTrialPackage } from "../services/AssignFreeTrialPkService";
import { CredentialService } from "../services/CredentialService";
import { OTPService } from "../services/OTPService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";

import { processUserRegistration } from "../api/pathao/registerService";

// import types
import { Config } from "../config";
import { AuthRequest, UserData_delPassword } from "../types";
import {
    forgetPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../validator/authValidationSchema";
import { genarateOTPShema } from "../validator/genarateOTP";
import { verifyOTPShema } from "../validator/VerifyOTPShema";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
        private otpService: OTPService,
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

            this.logger.info("User has been registered", { id: user._id });

            if (!user.isPhoneVerified) {
                const otp = await this.otpService.generateOTP(user);
                // await this.otpService.sendOTP(phone, otp);
                await this.otpService.sendOTP(phone as string, otp);
            }

            const payload: JwtPayload = {
                sub: String(user._id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });

            res.status(201).json({ id: user._id, role: user.role });
        } catch (err) {
            return next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        await checkSchema(loginSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, password }: { phone: string; password: string } =
            req.body;

        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(400, "Phone or password is incorrect!");
            }

            if (!user.isPhoneVerified) {
                const otp = await this.otpService.generateOTP(user);
                // await this.otpService.sendOTP(phone, otp);
                await this.otpService.sendOTP(phone, otp);
            }

            const isMatchPassword =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );
            if (!isMatchPassword) {
                throw createHttpError(400, "Phone or password is incorrect!");
            }

            this.logger.info("User has been logged in", { id: user._id });

            const payload: JwtPayload = {
                sub: String(user._id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });
            res.json({ id: user._id, role: user.role });
        } catch (err) {
            return next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(req.auth.sub);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userWithoutPassword: UserData_delPassword = {
            ...user.toObject(),
        }; // Convert Mongoose document to plain object
        if (userWithoutPassword.password) {
            delete userWithoutPassword.isEmailVerified;
            delete userWithoutPassword.password;
            delete userWithoutPassword.createdAt;
            delete userWithoutPassword.updatedAt;
            delete userWithoutPassword.__v;
            delete userWithoutPassword.pathaoMerchantInfo;
        }
        return res.json(userWithoutPassword);
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const user = await this.userService.findById(req.auth.sub);

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            this.logger.info("User has been refreshed", { id: req.auth.sub });

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(req.auth.id);

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
                // secure: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: Config.MAIN_DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true,
            });
            res.json({ id: user._id });
        } catch (err) {
            return next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(req.auth.sub);
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

    // forgetpassword system
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        await checkSchema(forgetPasswordSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone }: { phone: string } = req.body;

        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(404, "User not found!");
            }

            const otp = await this.otpService.generateOTP(user);
            // await this.otpService.sendOTP(phone, otp);
            await this.otpService.sendOTP(phone, otp);

            this.logger.info("OTP sent for password reset", { phone });

            res.status(200).json({ message: "OTP sent to your phone number" });
        } catch (err) {
            return next(err);
        }
    }

    // verify otp
    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        await checkSchema(verifyOTPShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, otp }: { phone: string; otp: string } = req.body;

        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(404, "User not found!");
            }

            const isOtpValid = await this.otpService.verifyOTP(user, otp);
            if (!isOtpValid) {
                throw createHttpError(400, "Invalid or expired OTP");
            }

            if (isOtpValid) {
                const merchantInfoData = await processUserRegistration(user);
                await this.userService.updatePathaoMerchantInfo(
                    user._id,
                    merchantInfoData,
                );
                await assignFreeTrialPackage(user._id);
            }

            this.logger.info("OTP verified for password reset", { phone });

            res.status(200).json({ message: "OTP verified", userId: user._id });
        } catch (err) {
            return next(err);
        }
    }

    async genarateOTP(req: Request, res: Response, next: NextFunction) {
        await checkSchema(genarateOTPShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone }: { phone: string } = req.body;

        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(404, "User not found!");
            }

            if (!user.isPhoneVerified) {
                const otp = await this.otpService.generateOTP(user);
                // await this.otpService.sendOTP(phone, otp);
                await this.otpService.sendOTP(phone, otp);
                this.logger.info("OTP sent you phone number", { phone });
                res.status(200).json({
                    message: "Otp sent to your phone number",
                    userId: user._id,
                });
            }

            this.logger.info("Not generate otp you are verified phone number", {
                phone,
            });
            res.status(200).json({
                message: "Already verified your phone number",
                userId: user._id,
            });
        } catch (err) {
            return next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        await checkSchema(resetPasswordSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            phone,
            otp,
            newPassword,
        }: { phone: string; otp: string; newPassword: string } = req.body;

        try {
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isValidOTP = await this.otpService.verifyOTP(user, otp);
            if (!isValidOTP) {
                return res
                    .status(400)
                    .json({ error: "Invalid or expired OTP" });
            }

            await this.credentialService.updatePassword(user, newPassword);
            res.status(200).json({
                message: "Password has been updated successfully",
            });
        } catch (err) {
            return next(err);
        }
    }
}
