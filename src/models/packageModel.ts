import { Schema, model, Document } from "mongoose";

export interface IPackage extends Document {
    name: string;
    duration: number;
    price: number;
    requestLimit: number;
    apiAccess: boolean;
}

const PackageSchema = new Schema<IPackage>({
    name: { type: String, required: true },
    duration: { type: Number, required: true }, // In days
    price: { type: Number, required: true },
    requestLimit: { type: Number, required: true },
    apiAccess: { type: Boolean, default: false },
});

export default model<IPackage>("Package", PackageSchema);
