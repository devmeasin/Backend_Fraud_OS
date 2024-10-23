import { Schema, model, Document } from "mongoose";

export interface IPackage extends Document {
    name: string;
    price: string;
    priceText: string;
    requestLimit?: number;
    validityDays: number;
    packageType?: string;
    apiAccess?: boolean;
    isUnlimited?: boolean;
    features: string[];
    unavailableFeatures?: string[];
    isFree: boolean;
    isPopular: boolean;
    duration: string;
    discount?: string;
}

const packageSchema = new Schema<IPackage>({
    name: { type: String, required: true },
    price: { type: String, required: true },
    priceText: { type: String, required: true },
    requestLimit: { type: Number, required: false },
    validityDays: { type: Number, required: true },
    packageType: { type: String, required: false },
    apiAccess: { type: Boolean, default: false },
    isUnlimited: { type: Boolean, default: false },
    features: { type: [String], required: true },
    unavailableFeatures: { type: [String], required: false },
    isFree: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    duration: { type: String, required: true },
    discount: { type: String, required: false },
});

const Package = model<IPackage>("Package", packageSchema);

export default Package;
