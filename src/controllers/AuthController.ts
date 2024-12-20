import { NextFunction, Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import createHttpError, { HttpError } from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { Types } from "mongoose";

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
    resetPasswordByAdminSchema,
    resetPasswordSchema,
} from "../validator/authValidationSchema";
import { genarateOTPShema } from "../validator/genarateOTP";
import { verifyOTPShema } from "../validator/VerifyOTPShema";
import { ICompany } from "../models/companyModel";
import { CompanyService } from "../services/CompanyService";

interface EnhancedJwtPayload {
    name: string;
    role: string;
    cid: string; // Company ID
    plan: string;
    sub: string;
}

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
        private otpService: OTPService,
        private companyService: CompanyService,
    ) {}

    private generateAuthTokens(user: any, activeCompanyId?: string) {
        const company = activeCompanyId
            ? user.companies.find(
                  (c: { companyId: { toString: () => string } }) =>
                      c.companyId.toString() === activeCompanyId,
              )
            : user.companies[0];

        const payload: EnhancedJwtPayload = {
            name: user.fullName,
            role: user.role.toLowerCase(), // Converting OWNER -> owner
            cid: company?.companyId.toString() || "",
            plan: user.currentPackage?.name || "basic",
            sub: user._id.toString(),
        };

        const accessToken = this.tokenService.generateAccessToken(payload);
        return accessToken;
    }

    private async setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ) {
        await Promise.resolve();
        res.cookie("accessToken", accessToken, {
            domain: Config.MAIN_DOMAIN,
            maxAge: 1000 * 60 * 60, // 1h
            sameSite: "lax",
            path: "/",
            httpOnly: true,
            secure: true,
        });

        res.cookie("refreshToken", refreshToken, {
            domain: Config.MAIN_DOMAIN,
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
            sameSite: "lax",
            path: "/",
            httpOnly: true,
            secure: true,
        });
    }

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

            const companyData = await this.companyService.createCompany(
                user._id,
                {
                    name: companyName,
                    website: companyWebsite,
                    owner: new Types.ObjectId(user._id),
                },
            );

            this.logger.info("User has been registered", { id: user._id });

            if (!user.isPhoneVerified) {
                const otp = await this.otpService.generateOTP(user);
                // await this.otpService.sendOTP(phone, otp);
                await this.otpService.sendOTP(phone as string, otp);
            }

            const payload: EnhancedJwtPayload = {
                name: user.fullName,
                role:
                    user.role === "OWNER"
                        ? "owner"
                        : user.role === "ADMIN"
                        ? "admin"
                        : "employee", // Converting OWNER -> owner
                cid: companyData._id as string,
                plan: "basic",
                sub: user._id,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist refresh token
            const newRefreshToken = await this.tokenService.persistRefreshToken(
                user,
                companyData._id as string,
            );

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                ...payload,
            });

            res.cookie("accessToken", accessToken, {
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60, // 1h
                sameSite: "lax",
                path: "/", // Ensure it's available across all subdomains
                httpOnly: true,
                secure: true, // Use secure if you're running over HTTPS
            });

            res.cookie("refreshToken", refreshToken, {
                domain: Config.MAIN_DOMAIN,
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                sameSite: "lax",
                path: "/", // Ensure it's available across all subdomains
                httpOnly: true,
                secure: true, // Use secure if you're running over HTTPS
            });

            res.status(201).json({ id: user._id, role: user.role });
        } catch (err) {
            return next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                phone,
                password,
                companyId,
            }: { phone: string; password: string; companyId: string } =
                req.body;

            const user = await this.userService.findByPhone(phone);

            if (!user) {
                throw createHttpError(400, "Phone or password is incorrect!");
            }

            const isMatchPassword =
                await this.credentialService.comparePassword(
                    password,
                    user.password,
                );
            if (!isMatchPassword) {
                throw createHttpError(400, "Phone or password is incorrect!");
            }

            // Check if user has a company
            const activeCompany = companyId
                ? user.companies.find((c) => String(c.companyId) === companyId)
                : user.companies[0];

            // Generate tokens with simplified payload
            const accessToken = this.generateAuthTokens(
                user,
                activeCompany?.companyId.toString(),
            );

            // Persist refresh token
            const newRefreshToken = await this.tokenService.persistRefreshToken(
                user,
                activeCompany?.companyId?.toString() as string,
            );

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                sub: user._id.toString(),
                cid: activeCompany?.companyId?.toString() as string,
            });

            // Set cookies
            await this.setAuthCookies(res, accessToken, refreshToken);

            // Return the same structure as the token payload
            res.json({
                name: user.fullName,
                plan: user?.currentPackage || "basic",
            });
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
            const user = await this.userService.findById(req.auth.sub);

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            // Ensure cid exists in auth payload
            if (!req.auth.cid) {
                throw createHttpError(400, "Company ID is required");
            }

            const accessToken = this.generateAuthTokens(user, req.auth.cid);

            // Delete old refresh token before creating new one
            await this.tokenService.deleteRefreshToken(
                req.auth.sub,
                req.auth.cid,
            );

            const newRefreshToken = await this.tokenService.persistRefreshToken(
                user,
                req.auth.cid,
            );

            const refreshToken = this.tokenService.generateRefreshToken({
                id: String(newRefreshToken._id),
                sub: user._id.toString(),
                cid: req.auth.cid,
            });

            await this.setAuthCookies(res, accessToken, refreshToken);

            res.json({
                name: user.fullName,
                role: user.role.toLowerCase(),
                cid: req.auth.cid,
                plan: user?.currentPackage || "basic",
                sub: user._id.toString(),
            });
        } catch (err) {
            return next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(
                req.auth.sub,
                req.auth.cid,
            );
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out", { id: req.auth.sub });

            res.clearCookie("accessToken", {
                domain: Config.MAIN_DOMAIN,
                path: "/",
            });
            res.clearCookie("refreshToken", {
                domain: Config.MAIN_DOMAIN,
                path: "/",
            });
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

            // Process additional steps after successful verification
            const merchantInfoData = await processUserRegistration(user);
            await this.userService.updatePathaoMerchantInfo(
                user._id,
                merchantInfoData,
            );
            await assignFreeTrialPackage(user._id);

            this.logger.info("OTP verification completed", { phone });
            res.status(200).json({ message: "OTP verified", userId: user._id });
        } catch (err) {
            return next(err);
        }
    }

    async generateOTP(req: Request, res: Response, next: NextFunction) {
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

            if (user.isPhoneVerified) {
                return res.status(200).json({
                    message: "Phone number already verified",
                    userId: user._id,
                });
            }

            const otp = await this.otpService.generateOTP(user);
            await this.otpService.sendOTP(phone, otp);

            this.logger.info("OTP generation successful", { phone });
            res.status(200).json({
                message: "OTP sent to your phone number",
                userId: user._id,
            });
        } catch (err) {
            if (err instanceof HttpError && err.status === 429) {
                return res.status(429).json({ message: err.message });
            }
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

    async adminResetPassword(req: Request, res: Response, next: NextFunction) {
        await checkSchema(resetPasswordByAdminSchema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, newPassword }: { phone: string; newPassword: string } =
            req.body;

        try {
            // Validate request inputs (you can integrate this with `express-validator` if desired)
            if (!phone || !newPassword) {
                throw createHttpError(
                    400,
                    "Phone and new password are required.",
                );
            }

            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(404, "User not found.");
            }

            // Admin resets the user's password
            await this.credentialService.updatePassword(user, newPassword);

            res.status(200).json({
                message: `Password for user with phone ${phone} has been updated successfully.`,
            });
        } catch (error) {
            return next(error);
        }
    }

    async activateUserProfile(req: Request, res: Response, next: NextFunction) {
        const { phone }: { phone: string } = req.body;

        try {
            // Find the user by phone
            const user = await this.userService.findByPhone(phone);
            if (!user) {
                throw createHttpError(404, "User not found");
            }

            // Check if the user is already active, verified, and phone-verified
            if (
                user.status === "active" &&
                user.isVerified &&
                user.isPhoneVerified
            ) {
                return res.status(400).json({
                    message: "User profile is already active and verified",
                });
            }

            // Process registration data
            const merchantInfoData = await processUserRegistration(user);

            // Update Pathao Merchant Info
            const updatedUser = await this.userService.updatePathaoMerchantInfo(
                user._id,
                merchantInfoData,
            );

            res.status(200).json({
                message: "User profile activated successfully",
                user: updatedUser,
            });
        } catch (error) {
            return next(error);
        }
    }
}
