import { NextFunction, Request, Response, Router } from "express";
import authenticate from "../middlewares/authenticate";
import { checkSchema, validationResult } from "express-validator";
import { BDNumberShema } from "../validator/BDNumberShema";
import { RedX_Data } from "../api/redx";
import { Steadfast_Data } from "../api/steadfast";
import { Pathao_Data } from "../api/pathao";
import { Paperfly_Data } from "../api/paperfly";
import { AuthRequest } from "../types";
import logger from "../utils/logger";
import { courierDataTransform } from "../utils/dtos/courierDataTransform";
import checkApiLimit from "../middlewares/checkAPILimit";

// Define a type that includes the `code` field
interface ApiResponse {
    code: number;
    [key: string]: any; // Additional fields can be added as needed
}

// Function to retry API calls if they fail or return a non-200 code
const retryApiCallWithCodeCheck = async <T extends ApiResponse>(
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

// Function to handle API calls with retry logic
const fetchData = async (customerNumber: string, userId: string) => {
    const redxPromise = retryApiCallWithCodeCheck(() =>
        RedX_Data(customerNumber),
    );
    const steadfastPromise = retryApiCallWithCodeCheck(() =>
        Steadfast_Data(customerNumber),
    );
    const pathaoPromise = retryApiCallWithCodeCheck(() =>
        Pathao_Data(userId, customerNumber),
    );
    const paperflyPromise = retryApiCallWithCodeCheck(() =>
        Paperfly_Data(customerNumber),
    );

    return Promise.all([
        redxPromise,
        steadfastPromise,
        pathaoPromise,
        paperflyPromise,
    ]);
};

const router = Router();

router.post(
    "/qc-data",
    authenticate,
    checkApiLimit,
    async (req: Request, res: Response, next: NextFunction) => {
        const authRequest = req as AuthRequest;

        await checkSchema(BDNumberShema).run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const customerNumber = req.body.customer_number as string;
            const userId = authRequest.auth.sub;

            const [redx, steadfast, pathao, paperfly] = await fetchData(
                customerNumber,
                userId,
            );
            const transformData = courierDataTransform({
                redx,
                steadfast,
                pathao,
                paperfly,
            });

            res.status(200).json({
                ...transformData,
            });
        } catch (error) {
            logger.error("Error fetching data:", error);
            res.status(500).json({ error: "Failed to fetch data" });
            next(error);
        }
    },
);

export default router;
