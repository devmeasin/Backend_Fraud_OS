import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel";
import { IPackage } from "./packageModel";

export interface IUserPackage extends Document {
    user: IUser["_id"];
    package: IPackage["_id"];
    usedRequests: number;
    remainingRequests: number;
    purchaseDate: Date;
    expiryDate: Date;
}

const userPackageSchema = new Schema<IUserPackage>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        package: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
            required: true,
        },
        usedRequests: { type: Number, default: 0 },
        remainingRequests: { type: Number, default: 50 },
        purchaseDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, required: true },
    },
    { timestamps: true },
);

export const UserPackage = mongoose.model<IUserPackage>(
    "UserPackage",
    userPackageSchema,
);
