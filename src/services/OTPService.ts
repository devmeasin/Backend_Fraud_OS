// services/OTPService.ts
import crypto from 'crypto';
import { OTP } from '../entities/OTP';
import { User } from '../entities/User';
import { sendOTP } from '../utils/otpSender';
import { Repository } from 'typeorm';
import { UserService } from './UserService';

export class OTPService {

  constructor(private userRepository: Repository<User>, private userService : UserService, private otpRepository: Repository<OTP>) {}
  
   async generateOTP(userId: number) {

    // const user = await User.findOne(userId);
   try {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');

    const otp = crypto.randomInt(1000, 9999); // Simple 6-digit OTP generation
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 3);

    const otpSaveOnDB = await this.createOTPEntry(user, otp, expiry);

    console.log(otpSaveOnDB)

    return otpSaveOnDB.otp;
     // Implement sendOTP to send OTP via SMS
    // await sendOTP(user.phone, otp);

   } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
   }

    
  }

  async createOTPEntry(user: User, otp: number, expiry: Date) {
    // const otpEntry = new OTP();
   return await this.otpRepository.save({
      user,
      otp,
      expiresAt: expiry, 
    });

  }

  // async verifyOTP(userId: number, otp: string): Promise<boolean> {
  //   const otpEntry = await OTP.findOne({ where: { user: userId, otp, isUsed: false } });

  //   if (otpEntry && otpEntry.expiresAt > new Date()) {
  //     otpEntry.isUsed = true;
  //     await otpEntry.save();
  //     return true;
  //   }

  //   return false;
  // }

  // static async deleteExpiredOTPs(): Promise<void> {
  //   await OTP.delete({ expiresAt: LessThan(new Date()) });
  // }
}
