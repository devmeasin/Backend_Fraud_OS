import axios from "axios";
import logger from "../../utils/logger";
import getSessionData from "./loginService";
import { CourierURI } from "../../constants";

const { fraud_check_url } = CourierURI.steadfast_url;

export const Steadfast_Data = async (customer_number: string) => {
    try {
        const sessionData = await getSessionData();

        const response = await axios.get(
            `${fraud_check_url}${customer_number}`,
            {
                headers: {
                    Cookie: sessionData.remember_web_cookie,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );
        return { code: response.status, data: response.data };
    } catch (error) {
        logger.error(
            "Data fetch network Error fraud check! from Steadfast",
            error,
        );
        throw new Error("Data fetch network Error fraud check! from Steadfast");
    }
};
