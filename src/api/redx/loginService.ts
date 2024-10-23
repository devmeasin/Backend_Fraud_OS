import axios from "axios";
import { CourierURI } from "../../constants";
import logger from "../../utils/logger";

const { login_url } = CourierURI.redx_url;

// Function to log in and retrieve the token and cookies
export const redxLogin = async () => {
    try {
        const response = await axios.post(login_url, {
            phone: "8801850463208",
            password: "E@sin$018208##",
        });
        const cookies = response.headers?.["set-cookie"]?.[1] || "";
        // Check if cookies are present
        if (!cookies) {
            logger.error("Required cookies not found.");
            throw new Error("Required cookies not found.");
        }
        return {
            cookies,
            responseData: response.data,
        };
    } catch (error) {
        logger.error("Data fetch network error from RedX login area");
        throw new Error("Data fetch network error! RedX login area");
    }
};
