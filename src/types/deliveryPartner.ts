export type DeliveryPartnerType = "PATHAO" | "STEADFAST";

export interface DeliveryPartner {
    id: string;
    type: DeliveryPartnerType;
    companyId: string;
    name: string;
    integrationConfig: {
        clientId?: string;
        secretKey: string;
        username?: string;
        password?: string;
        apiKey?: string;
    };
    accessToken?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
