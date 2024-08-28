import mongoose, { Schema, Document } from "mongoose";

export interface ICourierData {
    total: number;
    delivered: number;
    returned: number;
    successRatio: string;
}

export interface ICouerierRecord {
    Pathao: ICourierData;
    Steadfast: ICourierData;
    Redx: ICourierData;
    Paperfly: ICourierData;
    Total: ICourierData;
}

interface ICourierDataReport extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    customerNumber: string;
    courierData: ICouerierRecord;
}

const CourierDataSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerNumber: { type: String, required: true },
    date: { type: Date, required: true },
    courierData: {
        Pathao: {
            total: Number,
            delivered: Number,
            returned: Number,
            successRatio: String,
        },
        Steadfast: {
            total: Number,
            delivered: Number,
            returned: Number,
            successRatio: String,
        },
        Redx: {
            total: Number,
            delivered: Number,
            returned: Number,
            successRatio: String,
        },
        Paperfly: {
            total: Number,
            delivered: Number,
            returned: Number,
            successRatio: String,
        },
        Total: {
            total: Number,
            delivered: Number,
            returned: Number,
            successRatio: String,
        },
    },
});

export default mongoose.model<ICourierDataReport>(
    "CustomerQCData",
    CourierDataSchema,
);
