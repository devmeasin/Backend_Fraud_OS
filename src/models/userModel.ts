import mongoose, { Document, Schema } from "mongoose";

export interface IMerchantInfo extends Document {
    owner_name: string;
    owner_number: string;
    owner_email: string;
    name: string;
    merchant_id: number;
    password: string;
    country_id: string;
}

export interface IUser extends Document {
    _id: string;
    fullName: string;
    companyName?: string;
    companyWebsite?: string;
    phone: string;
    email?: string;
    password: string;
    role: "customer" | "admin" | "manager";
    status: string;
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    pathaoMerchantInfo?: IMerchantInfo;
    currentPackage?: Schema.Types.ObjectId;
    remainingRequests: number;
    apiSecret?: string;
    apiSecretEnabled?: boolean; // New field to enable/disable API secret
}

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true },
        companyName: { type: String },
        companyWebsite: { type: String },
        phone: { type: String, required: true, unique: true },
        email: { type: String, unique: true },
        password: { type: String, required: true },
        status: {
            type: String,
            enum: ["active", "blocked", "pending"],
            default: "active",
        },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        role: {
            type: String,
            enum: ["customer", "admin", "manager"],
            default: "customer",
        },
        pathaoMerchantInfo: {
            type: {
                owner_name: String,
                owner_number: String,
                owner_email: String,
                name: String,
                merchant_id: Number,
                password: String,
                country_id: String,
            },
            default: {
                isHavepathaoUser: false,
                owner_name: "",
                owner_number: "",
                owner_email: "",
                name: "",
                merchant_id: 0,
                password: "",
                country_id: "",
            },
        },
        apiSecret: { type: String },
        apiSecretEnabled: { type: Boolean, default: true }, // Default to enabled
    },
    { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
