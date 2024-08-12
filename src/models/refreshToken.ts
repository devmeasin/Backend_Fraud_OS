import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./userModel"; // Import the user interface

export interface IRefreshToken extends Document {
    expiredAt: Date;
    user: IUser | mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RefreshTokenSchema: Schema = new Schema(
    {
        expiredAt: { type: Date, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    },
);

export const RefreshTokenModel = mongoose.model<IRefreshToken>(
    "RefreshToken",
    RefreshTokenSchema,
);
