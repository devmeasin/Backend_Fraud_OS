export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: (partner: string) => `Invalid ${partner} credentials`,
    INVALID_PARTNER_TYPE: "Invalid delivery partner type",
    DELIVERY_PARTNER_NOT_FOUND: "Delivery Partner not found",
} as const;
