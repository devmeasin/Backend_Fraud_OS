import logger from "./logger";

// Function to retry API calls if they fail or return a non-200 code
interface ApiResponse {
    code: number;
    [key: string]: any; // Additional fields can be added as needed
}

export const retryApiCallWithCodeCheck = async <T extends ApiResponse>(
    apiCall: () => Promise<T | undefined>,
    retries = 3,
): Promise<T> => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const result = await apiCall();
            if (result && result.code === 200) {
                return result;
            } else {
                throw new Error(`Non-200 response code or undefined result`);
            }
        } catch (error) {
            attempt++;
            logger.error(`Retry attempt ${attempt} failed: `);
            if (attempt >= retries) {
                throw error;
            }
        }
    }
    throw new Error("Max retries reached");
};
