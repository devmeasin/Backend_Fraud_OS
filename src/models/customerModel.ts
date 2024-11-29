import mongoose, { Schema, Document } from "mongoose";

interface Location {
    label?: string;
    address: string;
    district?: string;
    division?: string;
    postCode?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
}

interface CustomerTag {
    id: number;
    name: string;
}

export interface ICustomer extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    type: "E_COMMERCE_CUSTOMER" | "DISTRIBUTOR" | "RETAILER";
    paymentMethod: "CASH_ON_DELIVERY" | "CASH" | "OTHER";
    paymentTerms: number;
    locations: Location[];
    customerTag: CustomerTag;
    salesOrderCount: number;
    lastSalesOrderCreatedAt?: Date;
    source: string;
    disabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema = new Schema<Location>(
    {
        label: { type: String, default: null },
        address: { type: String, required: true },
        district: { type: String, default: null },
        division: { type: String, default: null },
        postCode: { type: String, default: null },
        country: { type: String, default: "BD" },
        latitude: { type: String, default: null },
        longitude: { type: String, default: null },
    },
    { _id: false },
);

const CustomerSchema = new Schema<ICustomer>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company", // Assuming you have a Company model
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            default: null,
            trim: true,
        },
        type: {
            type: String,
            enum: ["E_COMMERCE_CUSTOMER", "DISTRIBUTOR", "RETAILER"],
            default: "E_COMMERCE_CUSTOMER",
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["CASH_ON_DELIVERY", "CASH", "OTHER"],
            default: "CASH_ON_DELIVERY",
            required: true,
        },
        paymentTerms: {
            type: Number,
            default: 0,
        },
        locations: [LocationSchema],
        customerTag: {
            id: { type: Number, default: null },
            name: { type: String, default: null, trim: true },
        },
        salesOrderCount: {
            type: Number,
            default: 0,
        },
        lastSalesOrderCreatedAt: {
            type: Date,
            default: null,
        },
        source: {
            type: String,
            default: "OTHER",
            trim: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
    },
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
