import axios from "axios";
import crypto from "crypto";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { OTP } from "../models/otpModel";
import { IUser as UserDocument } from "../models/userModel";
import { Config } from "../config";

export class OTPService {
    constructor(private logger: Logger) {}

    async generateOTP(user: UserDocument): Promise<string> {
        // beforeGenerateOTP check
        const prevOTP = await OTP.findOne({ user: user._id });
        if (prevOTP) {
            await prevOTP.deleteOne();
        }

        const otp = crypto.randomInt(1000, 9999).toString(); // Generate a 6-digit OTP

        // Store the OTP in the database with an expiration time (e.g., 10 minutes)
        const otpEntry = new OTP({
            user: user._id,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        });
        await otpEntry.save();

        this.logger.info("OTP generated", { userId: user._id, otp });

        return otp;
    }

    // async sendOTP(phone: string, otp: string): Promise<void> {
    async sendOTP(phone: string, otp: string) {
        // Logic to send the OTP to the user's phone via SMS
        this.logger.info("OTP sent to phone", { phone, otp });

        try {
            await axios.post("http://bulksmsbd.net/api/smsapi", {
                api_key: "qEGNwSZ2CkWegZMgX8PO",
                senderid: Config.SMS_SENDER_ID,
                number: `88${phone}`,
                message: `eCommOS Your OTP is ${otp}`,
            });
        } catch (error) {
            this.logger.error("Failed to send OTP via SMS", error);
            throw createHttpError(500, "Failed to send OTP via SMS");
        }

        // Example of sending OTP via a fake SMS service (replace with actual implementation)
    }

    async verifyOTP(user: UserDocument, otp: string): Promise<boolean> {
        // Find the OTP in the database and check if it matches
        const otpEntry = await OTP.findOne({ user: user._id, otp });

        if (!otpEntry) {
            this.logger.warn("OTP verification failed: OTP not found", {
                userId: user._id,
            });
            return false;
        }

        // Check if the OTP has expired
        if (otpEntry.expiresAt < new Date()) {
            await otpEntry.deleteOne(); // Delete the expired OTP
            this.logger.warn("OTP verification failed: OTP expired", {
                userId: user._id,
            });
            throw createHttpError(400, "OTP has expired");
        }

        // OTP is valid, so remove it from the database
        await otpEntry.deleteOne();
        this.logger.info("OTP verified successfully", { userId: user._id });

        // Mark the user's phone number as verified
        user.isVerified = true;
        user.isPhoneVerified = true;
        await user.save();

        return true;
    }
}
