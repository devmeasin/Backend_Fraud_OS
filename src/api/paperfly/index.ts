import logger from "../../utils/logger";
import { paperfly_makeRequestWithToken } from "./requestGetData";

export const Paperfly_Data = async (customer_number: string) => {
    try {
        const data = await paperfly_makeRequestWithToken(customer_number);
        return data;
    } catch (error) {
        logger.error("Data fetch network error from Paperfly_Data");
        throw new Error("Data fetch network error! Paperfly_Data");
    }
};
