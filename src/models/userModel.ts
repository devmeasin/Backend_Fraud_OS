import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    fullName: string;
    companyName?: string;
    companyWebsite?: string;
    phone: string;
    email?: string;
    password: string;
    role: "customer" | "admin" | "manager";
    isActive: boolean;
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    currentPackage?: Schema.Types.ObjectId;
    remainingRequests: number;
}

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true },
        companyName: { type: String },
        companyWebsite: { type: String },
        phone: { type: String, required: true, unique: true },
        email: { type: String, unique: true },
        password: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false }, // Flag for OTP verification
        role: {
            type: String,
            enum: ["customer", "admin", "manager"],
            default: "customer",
        },
    },
    { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
