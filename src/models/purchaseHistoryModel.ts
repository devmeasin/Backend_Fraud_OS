import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
    userId: Schema.Types.ObjectId;
    packageId: Schema.Types.ObjectId;
    amount: number;
    purchaseDate: Date;
    transactionId: string;
    paymentStatus: string;
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    amount: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    transactionId: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
});

export default model<ITransaction>("Transaction", TransactionSchema);
