import axios from "axios";
import crypto from "crypto";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { OTP } from "../models/otpModel";
import { IUser as UserDocument } from "../models/userModel";
import { Config } from "../config";

export class OTPService {
    private static readonly OTP_COOLDOWN = 5 * 60 * 1000; // 5 minutes
    private static readonly MAX_DAILY_ATTEMPTS = 10;

    constructor(private logger: Logger) {}

    async hasActiveOTP(userId: string): Promise<boolean> {
        const activeOTP = await OTP.findOne({
            user: userId,
            expiresAt: { $gt: new Date() },
        });
        return !!activeOTP;
    }

    async generateOTP(user: UserDocument): Promise<string> {
        // Check for active OTP
        const activeOTP = await this.hasActiveOTP(user._id.toString());
        if (activeOTP) {
            throw createHttpError(
                429,
                "Please wait before requesting a new OTP",
            );
        }

        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const otpCount = await OTP.countDocuments({
            user: user._id,
            createdAt: { $gte: today },
        });

        if (otpCount >= OTPService.MAX_DAILY_ATTEMPTS) {
            throw createHttpError(
                429,
                "Daily OTP limit exceeded. Please try again tomorrow",
            );
        }

        // Delete any existing OTP
        await OTP.deleteMany({ user: user._id });

        const otp = crypto.randomInt(1000, 9999).toString();

        const otpEntry = new OTP({
            user: user._id,
            otp,
            expiresAt: new Date(Date.now() + OTPService.OTP_COOLDOWN),
        });
        await otpEntry.save();

        this.logger.info("OTP generated", { userId: user._id });
        return otp;
    }

    async sendOTP(phone: string, otp: string) {
        try {
            await axios.post("http://bulksmsbd.net/api/smsapi", {
                api_key: "qEGNwSZ2CkWegZMgX8PO",
                senderid: Config.SMS_SENDER_ID,
                number: `88${phone}`,
                message: `eCommOS Your OTP is ${otp}`,
            });
            this.logger.info("OTP sent successfully", { phone });
        } catch (error) {
            this.logger.error("Failed to send OTP via SMS", error);
            throw createHttpError(500, "Failed to send OTP via SMS");
        }
    }

    async verifyOTP(user: UserDocument, otp: string): Promise<boolean> {
        const otpEntry = await OTP.findOne({
            user: user._id,
            otp,
            expiresAt: { $gt: new Date() },
        });

        if (!otpEntry) {
            this.logger.warn("OTP verification failed", { userId: user._id });
            return false;
        }

        // OTP is valid, clean up and update user
        await otpEntry.deleteOne();

        // Update user verification status
        user.isVerified = true;
        user.isPhoneVerified = true;
        await user.save();

        this.logger.info("OTP verified successfully", { userId: user._id });
        return true;
    }
}
