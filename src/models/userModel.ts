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
    _id: mongoose.Types.ObjectId; // Ensure `_id` uses mongoose's ObjectId type
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    role: "owner" | "admin" | "employee";
    status: "active" | "blocked" | "pending"; // Match enum in schema
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    companies?: {
        companyId: mongoose.Types.ObjectId; // Consistent ObjectId type
        role: "owner" | "admin" | "employee" | "manager";
    }[];
    pathaoMerchantInfo?: IMerchantInfo;
    currentPackage?: mongoose.Types.ObjectId;
    remainingRequests: number;
    apiSecret?: string;
    apiSecretStatus?: boolean;
    allowedDomains: string[];
}

const userSchema = new Schema<IUser>(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true }, // `sparse` allows multiple documents with no email
        password: { type: String, required: true },
        status: {
            type: String,
            enum: ["active", "blocked", "pending"],
            default: "active",
        },
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        companies: {
            type: [
                {
                    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
                    role: {
                        type: String,
                        enum: ["owner", "admin", "manager", "employee"],
                        default: "owner",
                    },
                },
            ],
            default: [],
        },
        role: {
            type: String,
            enum: ["owner", "admin", "employee"],
            default: "owner",
            immutable: true, // Prevent role changes after creation
        },
        pathaoMerchantInfo: {
            type: {
                owner_name: { type: String, default: "" },
                owner_number: { type: String, default: "" },
                owner_email: { type: String, default: "" },
                name: { type: String, default: "" },
                merchant_id: { type: Number, default: 0 },
                password: { type: String, default: "" },
                country_id: { type: String, default: "" },
            },
        },
        apiSecret: { type: String, default: "" },
        apiSecretStatus: { type: Boolean, default: true },
        allowedDomains: { type: [String], default: [] },
    },
    { timestamps: true }, // Automatically adds `createdAt` and `updatedAt`
);

export const User = mongoose.model<IUser>("User", userSchema);
