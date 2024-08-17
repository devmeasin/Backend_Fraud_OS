import { Schema, model, Document } from "mongoose";

export interface IPackage extends Document {
    name: string;
    price: number;
    requestLimit: number;
    packegeType: string;
    validityDays: number;
    apiAccess?: boolean;
}

const PackageSchema = new Schema<IPackage>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    packegeType: { type: String, enum: ["Free", "Monthly", "Yearly"] },
    requestLimit: { type: Number, required: true },
    validityDays: { type: Number, required: true }, // In days
    apiAccess: { type: Boolean, default: false },
});

export default model<IPackage>("Package", PackageSchema);
