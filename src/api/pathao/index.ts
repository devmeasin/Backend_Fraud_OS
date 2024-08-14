import logger from "../../utils/logger";
import { pathao_makeRequestWithToken } from "./requestGetData";

export const Pathao_Data = async (userId: string, customer_number: string) => {
    try {
        const data = await pathao_makeRequestWithToken(userId, customer_number);
        return data;
    } catch (error) {
        logger.error("Data fetch network error from Pathao");
        throw new Error("Data fetch network error! from Pathao");
    }
};
