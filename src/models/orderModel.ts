import { Schema, model, Document, Model } from "mongoose";

export enum OrderStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD",
    IN_TRANSIT = "IN_TRANSIT",
    RETURNED = "RETURNED",
    FLAGGED = "FLAGGED",
}

export enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    OTHER = "OTHER",
}

export enum OrderSource {
    WOOCOMMERCE = "WOOCOMMERCE",
    SHOPIFY = "SHOPIFY",
    MANUAL = "MANUAL",
    WEBSITE = "WEBSITE",
    OTHER = "OTHER",
    WHATSAPP = "WHATSAPP",
    MESSENGER = "MESSENGER",
    UNKNOWN = "UNKNOWN",
}

export interface IOrder extends Document {
    internalId: string;
    externalId?: string;
    source: OrderSource;
    status: OrderStatus;
    customerPhone: string;
    customerId: string;
    productId: string;
    shipping: {
        address: string;
        district: string;
        division: string;
        postCode?: string;
        country: string;
    };
    amounts: {
        subtotal: number;
        discount: number;
        deliveryCharge: number;
        total: number;
    };
    payment: {
        method: PaymentMethod;
        paid: number;
        due: number;
    };
    dates: {
        orderDate: Date;
        deliveryDate?: Date;
        approvedAt?: Date;
        processedAt?: Date;
        shippedAt?: Date;
        deliveredAt?: Date;
        cancelledAt?: Date;
    };
    metadata: {
        sourceUrl?: string;
        integrationId?: string;
        notes: string[];
        flags: Array<{
            reason: string;
            createdAt: Date;
        }>;
    };
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        companyId: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerId: { type: String, required: true },
        productId: { type: String },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        source: {
            type: String,
            enum: Object.values(OrderSource),
            required: true,
            default: OrderSource.UNKNOWN,
        },
        internalId: { type: String, unique: true, required: true },
        externalId: { type: String },
        shipping: {
            address: { type: String, required: true },
            district: { type: String, required: true },
            division: { type: String, required: true },
            postCode: String,
            country: { type: String, default: "BD" },
        },
        amounts: {
            subtotal: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            deliveryCharge: { type: Number, default: 0 },
            total: { type: Number, required: true },
        },
        payment: {
            method: {
                type: String,
                enum: Object.values(PaymentMethod),
                required: true,
                default: "CASH_ON_DELIVERY",
            },
            paid: { type: Number, default: 0 },
            due: { type: Number, required: true },
        },
        dates: {
            orderDate: { type: Date, required: true },
            deliveryDate: Date,
            approvedAt: Date,
            processedAt: Date,
            shippedAt: Date,
            deliveredAt: Date,
            cancelledAt: Date,
        },
        metadata: {
            sourceUrl: String,
            integrationId: String,
            notes: [String],
            flags: [
                {
                    reason: String,
                    createdAt: Date,
                },
            ],
        },
    },
    { timestamps: true },
);

// Indexes
orderSchema.index({ companyId: 1, createdAt: -1 });

// Pre-save hook to generate sequential internalId
orderSchema.pre<IOrder>("save", async function (next) {
    if (this.isNew) {
        const lastOrder = await Order.findOne({ companyId: this.companyId })
            .sort({ createdAt: -1 })
            .select("internalId")
            .exec();

        const lastId = lastOrder?.internalId?.split("-")[1] || "000000";
        const nextId = (parseInt(lastId, 10) + 1).toString().padStart(6, "0");

        this.internalId = `INT-${nextId}`;
    }
    next();
});

export const Order: Model<IOrder> = model<IOrder>("Order", orderSchema);
