import mongoose, { Document, Schema } from "mongoose";

// Interface for Charge
interface ICharge {
    region?: string;
    boundary: "INSIDE" | "OUTSIDE" | "SUBURB";
    charge: number;
}

// Interface for Delivery Partner
interface IDeliveryPartner extends Document {
    type: "PATHAO" | "STEADFAST" | "REDX" | "PAPERFLY" | "OTHER";
    name: string;
    contactPerson: string;
    phone: string;
    companyId: string;
    locationId?: string;
    warehouseId?: string;
    storeId?: string;
    disabled: boolean;
    integrationConfig: {
        apiKey?: string;
        clientId?: string;
        username?: string;
        phone?: string;
        password?: string;
        secretKey?: string;
        accessToken?: string;
    };
    charges: ICharge[];
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose Schema
const ChargeSchema = new Schema<ICharge>(
    {
        region: { type: String, required: false },
        boundary: {
            type: String,
            enum: ["INSIDE", "OUTSIDE", "SUBURB"],
            required: true,
        },
        charge: {
            type: Number,
            required: true,
        },
    },
    { _id: true },
);

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
    {
        type: {
            type: String,
            enum: ["PATHAO", "STEADFAST", "REDX", "PAPERFLY", "OTHER"],
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        contactPerson: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        companyId: {
            type: String,
            required: true,
        },
        locationId: {
            type: String,
            required: false,
        },
        storeId: {
            type: String,
            required: false,
        },
        warehouseId: {
            type: String,
            required: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        integrationConfig: {
            apiKey: { type: String },
            clientId: { type: String },
            secretKey: { type: String },
            username: { type: String },
            phone: { type: String },
            password: { type: String },
            accessToken: { type: String },
        },
        charges: [ChargeSchema],
    },
    {
        timestamps: true,
    },
);

// Create and export the model
const DeliveryPartner = mongoose.model<IDeliveryPartner>(
    "DeliveryPartner",
    DeliveryPartnerSchema,
);

export { DeliveryPartner, ICharge, IDeliveryPartner };
