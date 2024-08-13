import crypto from "crypto";
import { Logger } from "winston";
import { IUser as UserDocument } from "../models/userModel";
import { OTP } from "../models/otpModel";
import createHttpError from "http-errors";

export class OTPService {
    constructor(private logger: Logger) {}

    async generateOTP(user: UserDocument): Promise<string> {
        const otp = crypto.randomInt(1000, 9999).toString(); // Generate a 6-digit OTP

        // Store the OTP in the database with an expiration time (e.g., 10 minutes)
        const otpEntry = new OTP({
            userId: user._id,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        });
        await otpEntry.save();

        this.logger.info("OTP generated", { userId: user._id, otp });

        return otp;
    }

    // async sendOTP(phone: string, otp: string): Promise<void> {
    sendOTP(phone: string, otp: string) {
        // Logic to send the OTP to the user's phone via SMS
        this.logger.info("OTP sent to phone", { phone, otp });

        // Example of sending OTP via a fake SMS service (replace with actual implementation)
        // console.log(`Sending OTP ${otp} to phone number ${phone}`);
    }

    async verifyOTP(user: UserDocument, otp: string): Promise<boolean> {
        // Find the OTP in the database and check if it matches
        const otpEntry = await OTP.findOne({ userId: user._id, otp });

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
