import axios from "axios";
import { CourierURI } from "../../constants";
import { TRedXData } from "../../types";
import logger from "../../utils/logger";

export const RedX_Data = async (customer_number: string) => {
    try {
        const response = await axios.get(
            `${CourierURI.redx_url}${customer_number}`,
        );
        return response.data as TRedXData;
    } catch (error) {
        logger.error("Data fetch network error");
        throw new Error("Data fetch network error!");
    }
};
