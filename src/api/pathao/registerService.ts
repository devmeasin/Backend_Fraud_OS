import axios from "axios";
import { CourierURI } from "../../constants";
import { IMerchantInfo, IUser } from "../../models/userModel";
import logger from "../../utils/logger";

const { register_url } = CourierURI.pathao_url;

// Function to generate a random Bangladesh phone number
// Function to generate a random Bangladesh phone number based on operator prefixes
function generateRandomBDPhoneNumber(): string {
    // Define the operator prefixes
    const operatorPrefixes = ["013", "017", "014", "019", "015", "016", "018"];

    // Randomly select an operator prefix
    const prefix =
        operatorPrefixes[Math.floor(Math.random() * operatorPrefixes.length)];

    // Generate the remaining 8 digits
    const randomNumber = Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, "0");

    // Return the complete phone number
    return `${prefix}${randomNumber}`;
}

// Function to generate a random email
function generateRandomEmail(baseEmail: string): string {
    const randomString = Math.random().toString(36).substring(7);
    return `${randomString}-${baseEmail}`;
}

// Function to register in Pathao
export async function registerInPathao(userData: IUser, maxRetries = 5) {
    let attempt = 0;
    while (attempt < maxRetries) {
        const Pathao_Merchant_Info = {
            name: `${userData.fullName}-${Math.random()
                .toString(36)
                .substring(2, 7)}`,
            owner_name: `${userData.companyName}-${Math.random()
                .toString(36)
                .substring(2, 7)}`,
            owner_email: generateRandomEmail(userData.email as string),
            owner_number: generateRandomBDPhoneNumber(),
            confirm_terms: true,
        };

        try {
            const response = await axios.post(
                register_url,
                Pathao_Merchant_Info,
            );

            // Check if the response contains merchant_info
            const merchantInfoData = response.data.data.merchant_info;

            if (merchantInfoData) {
                return merchantInfoData as IMerchantInfo;
            } else {
                throw new Error("Invalid response structure");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Check for duplicate error messages
                const { data, code } = error.response.data;

                if (code === 422 && (data.owner_number || data.merchant_name)) {
                    logger.error(
                        "Duplicate entry detected. Retrying with new values...",
                    );
                    attempt++;
                    continue; // Retry with new values
                } else {
                    logger.error(
                        `${error.response.status}, ${error.response.data}`,
                    );
                    throw new Error(
                        `Registration failed: ${error.response.data.message}`,
                    );
                }
            } else {
                logger.error(`Unexpected error:'Registration failed`);
                throw new Error(`Registration failed: `);
            }
        }
    }
    logger.error(`Max retries reached for registration`);
    throw new Error("Max retries reached for registration");
}

// Example usage
export async function processUserRegistration(user: IUser) {
    try {
        // Wait for the registration to complete and get merchantInfoData
        const merchantInfoData = await registerInPathao(user);
        logger.info(
            `Received Merchant Info Data: ${
                (merchantInfoData.owner_name,
                merchantInfoData.merchant_id,
                merchantInfoData.owner_email)
            }`,
        );

        // Use the merchantInfoData to update the user's merchant info in the database
        // await userService.updatePathaoMerchantInfo(user._id, merchantInfoData as IMerchantInfo);
        return merchantInfoData;
    } catch (error) {
        throw new Error("Error during registration process");
    }
}
