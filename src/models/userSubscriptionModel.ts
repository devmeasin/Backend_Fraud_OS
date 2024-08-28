import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel";
import { IPackage } from "./packageModel";

export interface IUserPackage extends Document {
    userId: IUser | mongoose.Types.ObjectId;
    packageId: IPackage | mongoose.Types.ObjectId;
    usedRequests: number;
    remainingRequests: number;
    purchaseDate: Date;
    expiryDate: Date;
    isActive: boolean;
    isUnlimited: boolean; // New field for unlimited requests
}

const userPackageSchema = new Schema<IUserPackage>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
            required: true,
        },
        usedRequests: { type: Number, default: 0 },
        remainingRequests: { type: Number, required: true },
        purchaseDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        isUnlimited: { type: Boolean, default: false }, // New field for unlimited requests
    },
    { timestamps: true },
);

export const UserPackage = mongoose.model<IUserPackage>(
    "UserPackage",
    userPackageSchema,
);
