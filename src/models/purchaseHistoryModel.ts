import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
    userId: Schema.Types.ObjectId;
    packageId: Schema.Types.ObjectId;
    amount?: number;
    paymentID: string;
    purchaseDate: Date;
    transactionId?: string;
    payerAccount?: string;
    payerReference?: string;
    paymentStatus: string;
    transactionStatus: string;
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    paymentID: { type: String, required: true },
    amount: { type: Number }, // Make this optional
    purchaseDate: { type: Date, default: Date.now },
    transactionId: { type: String }, // Make this optional
    payerAccount: { type: String },
    payerReference: { type: String },
    transactionStatus: { type: String, default: "Pending" },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Successful", "Failed", "Cancelled"],
        default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
});

export default model<ITransaction>("Transaction", TransactionSchema);
