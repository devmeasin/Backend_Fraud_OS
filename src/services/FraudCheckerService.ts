import { Paperfly_Data } from "../api/paperfly";
import { Pathao_Data } from "../api/pathao";
import { RedX_Data } from "../api/redx";
import { Steadfast_Data } from "../api/steadfast";
import { retryApiCallWithCodeCheck } from "../utils/retryApiCall";

export class FraudCheckerService {
    // Function to handle API calls with retry logic
    async fetchAllCourierData(customerNumber: string, userId: string) {
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
    }
}
