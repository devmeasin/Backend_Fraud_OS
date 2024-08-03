import { NextFunction, Request, Response } from "express";
import { OTPService } from "../services/OTPService";
import { Logger } from "winston";
import { UserService } from "../services/UserService";

interface verifyOtp {
    userId: number;
    otp: string;
}

export class OTPController {

    constructor(private otpService: OTPService,userService : UserService, private logger: Logger) {}

    async generateOTP(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;
       try {
        const otp = await this.otpService.generateOTP(Number(userId));
        res.status(200).json({ message: `OTP generated successfully ${otp}` });
       } catch (err) {
           next(err);
       }
    }

    // async verifyOTP(req: Request, res: Response, next: NextFunction) {
    //     const { userId, otp } : verifyOtp = req.body;
    //    try {
    //     const isVerified = await this.otpService.verifyOTP(Number(userId), otp);
    //     res.status(200).json({ isVerified });
    //    } catch (err) {
    //        next(err);
    //    }
    // }

}