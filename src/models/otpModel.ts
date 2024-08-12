import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel";

export interface IOTP extends Document {
    userId: IUser["_id"];
    otp: string;
    expiresAt: Date;
}

const otpSchema = new Schema<IOTP>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
