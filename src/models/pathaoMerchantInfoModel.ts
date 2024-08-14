import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the MerchantInfo document
export interface IMerchantInfo extends Document {
    owner_name: string;
    owner_number: string;
    owner_email: string;
    name: string;
    merchant_id: number;
    password: string;
    country_id: string;
    user: mongoose.Types.ObjectId; // Reference to User
}

// Define the MerchantInfo schema
const MerchantInfoSchema: Schema = new Schema({
    owner_name: { type: String },
    owner_number: { type: String },
    owner_email: { type: String },
    name: { type: String },
    merchant_id: { type: Number },
    password: { type: String },
    country_id: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Create and export the MerchantInfo model
const PathaoMerchantInfo: Model<IMerchantInfo> = mongoose.model<IMerchantInfo>(
    "PathaoMerchantInfo",
    MerchantInfoSchema,
);

export default PathaoMerchantInfo;
