export type DeliveryPartnerType =
    | "PATHAO"
    | "STEADFAST"
    | "REDX"
    | "PAPERFLY"
    | "OTHER";

export interface DeliveryPartner {
    id: string;
    type: DeliveryPartnerType;
    name: string;
    companyId: string;
    storeId?: string;
    integrationConfig: {
        clientId?: string;
        secretKey: string;
        phone?: string;
        username?: string;
        password?: string;
        apiKey?: string;
    };
    accessToken?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
