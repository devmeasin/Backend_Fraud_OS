import crypto from "crypto";

/**
 * Generates a unique delivery URL for each webhook.
 * Ensures no conflicts between multiple channels of the same company.
 */
export const generateUniqueDeliveryUrl = (
    companyId: string,
    channelName: string,
    integrationId: string,
): string => {
    const uniqueHash = crypto
        .createHash("sha256")
        .update(`${companyId}-${channelName}-${integrationId}`)
        .digest("hex")
        .substring(0, 8);
    return `/api/v1/webhooks/${channelName}/${companyId}-${uniqueHash}`;
};
