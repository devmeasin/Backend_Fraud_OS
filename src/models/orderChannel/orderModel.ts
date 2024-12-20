import { Document, Model, Schema, model } from "mongoose";

// Enums for Order Status, Payment Method, and Order Source
export enum OrderStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD",
    RTO = "RTO",
    RETURNED = "RETURNED",
    FLAGGED = "FLAGGED",
    PICKUP_REQUESTED = "PICKUP_REQUESTED",
    ASSIGNED_FOR_PICKUP = "ASSIGNED_FOR_PICKUP",
    PICKED = "PICKED",
    PICKUP_FAILED = "PICKUP_FAILED",
    PICKUP_CANCELLED = "PICKUP_CANCELLED",
    AT_THE_SORTING_HUB = "AT_THE_SORTING_HUB",
    IN_TRANSIT = "IN_TRANSIT",
    RECEIVED_AT_LAST_MILE_HUB = "RECEIVED_AT_LAST_MILE_HUB",
    ASSIGNED_FOR_DELIVERY = "ASSIGNED_FOR_DELIVERY",
    PARTIAL_DELIVERY = "PARTIAL_DELIVERY",
    RETURN = "RETURN",
    DELIVERY_FAILED = "DELIVERY_FAILED",
    PAYMENT_INVOICE = "PAYMENT_INVOICE",
    PAID_RETURN = "PAID_RETURN",
    EXCHANGE = "EXCHANGE",
}

export enum PaymentMethod {
    CASH = "CASH",
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    CREDIT_CARD = "CREDIT_CARD",
    OTHER = "OTHER",
}

export enum OrderSource {
    WOOCOMMERCE = "WOOCOMMERCE",
    SHOPIFY = "SHOPIFY",
    DARAZ = "DARAZ",
    SYSTEM = "SYSTEM",
    WEBSITE = "WEBSITE",
    OTHER = "OTHER",
    WHATSAPP = "WHATSAPP",
    MESSENGER = "MESSENGER",
    PHONE_CALL = "PHONE_CALL",
    UNKNOWN = "UNKNOWN",
}

// Interface for Order Document
export interface IOrder extends Document {
    companyId: Schema.Types.ObjectId;
    internalId: string;
    externalId?: string;
    source: OrderSource;
    status: OrderStatus;
    customerPhone: string;
    customer: Schema.Types.ObjectId;
    products: Array<{
        productId: Schema.Types.ObjectId;
        quantity: number;
    }>;
    shippingAddress: {
        address: string;
        district: string;
        division: string;
        postCode?: string;
        country?: string;
    };
    amounts: {
        discount?: number;
        deliveryCharge?: number;
        totalDueAmount: number;
        totalPaidAmount: number;
        subTotal: number;
        totalAmount: number;
    };
    payment: {
        method: PaymentMethod;
        paid: number;
        due: number;
    };
    comments?: Array<{
        comment: string;
        authorId: Schema.Types.ObjectId;
        createdAt: Date;
    }>;
    deliveryConsignment?: Schema.Types.ObjectId;
    deliveryPartner?: Schema.Types.ObjectId;
    deliveryStatus?: string;
    deliveryTrackingId?: string;
    deliveryTrackingUrl?: string;
    additionalNotes?: string;
    internalNotes?: Array<{
        note: string;
        createdAt: Date;
        updatedAt?: Date;
        authorId: Schema.Types.ObjectId;
    }>;
    integrationId?: string;
    metadata: {
        sourceUrl?: string;
        notes: string[];
        flags: Array<{ reason: string; createdAt: Date }>;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Order Schema
const orderSchema = new Schema<IOrder>(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        customerPhone: { type: String, required: true },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        source: {
            type: String,
            enum: Object.values(OrderSource),
            required: true,
            default: OrderSource.UNKNOWN,
        },
        internalId: { type: String, unique: true },
        externalId: { type: String },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, default: 1 },
            },
        ],
        shippingAddress: {
            address: String,
            district: String,
            division: String,
            postCode: String,
            country: { type: String, default: "BD" },
        },
        amounts: {
            discount: { type: Number, default: 0 },
            deliveryCharge: { type: Number, default: 0 },
            totalDueAmount: { type: Number, default: 0 },
            totalPaidAmount: { type: Number, default: 0 },
            subTotal: { type: Number, default: 0 },
            totalAmount: { type: Number, required: true },
        },
        payment: {
            method: {
                type: String,
                enum: Object.values(PaymentMethod),
                default: PaymentMethod.CASH_ON_DELIVERY,
            },
            paid: { type: Number, default: 0 },
            due: { type: Number, required: true },
        },
        comments: [
            {
                comment: { type: String, required: true },
                authorId: { type: Schema.Types.ObjectId, ref: "User" },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        deliveryConsignment: {
            type: Schema.Types.ObjectId,
            ref: "DeliveryConsignment",
        },
        deliveryPartner: {
            type: Schema.Types.ObjectId,
            ref: "DeliveryPartner",
        },
        deliveryStatus: { type: String },
        deliveryTrackingId: { type: String },
        deliveryTrackingUrl: { type: String },
        additionalNotes: { type: String },
        internalNotes: [
            {
                note: { type: String },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date },
                authorId: { type: Schema.Types.ObjectId, ref: "User" },
            },
        ],
        integrationId: { type: String },
        metadata: {
            sourceUrl: String,
            notes: [String],
            flags: [
                {
                    reason: { type: String },
                    createdAt: { type: Date, default: Date.now },
                },
            ],
        },
    },
    { timestamps: true },
);

// Indexes
orderSchema.index({ companyId: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Pre-save hook for generating dynamic internalId
orderSchema.pre<IOrder>("save", async function (next) {
    if (this.isNew) {
        const prefixMap = {
            [OrderSource.WOOCOMMERCE]: "WOO",
            [OrderSource.SHOPIFY]: "SHO",
            [OrderSource.DARAZ]: "DRZ",
            [OrderSource.WHATSAPP]: "WHA",
            [OrderSource.SYSTEM]: "EOS",
            [OrderSource.PHONE_CALL]: "PHC",
            [OrderSource.UNKNOWN]: "UNK",
        };

        const prefix =
            prefixMap[this.source as keyof typeof prefixMap] || "ORD";
        const lastOrder = await Order.findOne({ companyId: this.companyId })
            .sort({ createdAt: -1 })
            .select("internalId")
            .exec();

        const lastId = lastOrder?.internalId?.split("-")[1] || "0000";
        const nextId = (parseInt(lastId, 10) + 1).toString().padStart(4, "0");

        this.internalId = `${prefix}-${nextId}`;
    }
    next();
});

// Order Model
export const Order: Model<IOrder> = model<IOrder>("Order", orderSchema);
