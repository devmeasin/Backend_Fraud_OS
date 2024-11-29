export interface Location {
    id: string;
    label: string;
    type: string;
    address: string;
    district: string;
    division: string;
    postCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    type: string;
    paymentMethod: string;
    customerTagId: number;
}

export interface Order {
    id: string;
    authorId: string;
    customerPhone: string;
    companyId: string;
    deliveryDate: Date;
    paymentMethod: string;
    additionalNotes: string;
    status: OrderStatus;
    totalAmount: string;
    shortId: number;
    discount: string;
    transportFareAmount: string;
    internalId: string;
    locationId: string;
    orderDate: Date;
    deliveryCharge: string;
    totalDueAmount: string;
    totalPaidAmount: string;
    source: string;
    district: string;
    division: string;
    location: Location;
    customer: Customer;
    createdAt: Date;
    updatedAt: Date;
}

export enum OrderStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    CANCELLED = "CANCELLED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    RETURNED = "RETURNED",
    FLAGGED = "FLAGGED",
    ON_HOLD = "ON_HOLD",
    IN_TRANSIT = "IN_TRANSIT",
}

export interface OrderQueryFilters {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    district?: string;
    division?: string;
    search?: string;
    page?: number;
    limit?: number;
}
