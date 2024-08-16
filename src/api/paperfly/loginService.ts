import axios from "axios";
import { CourierURI } from "../../constants";
import logger from "../../utils/logger";
import { IPaperflyApiloginResponse } from "../../types";

const { login_url } = CourierURI.paperfly_url;

// Function to log in and retrieve the token
export const paperflyLogin = async () => {
    try {
        const response = await axios.post(login_url, {
            username: "c165904",
            password: "5459",
        });
        const data = response.data as IPaperflyApiloginResponse;

        return data;
    } catch (error) {
        logger.error("Data fetch network error from Paperfly_Data login area");
        throw new Error("Data fetch network error! Paperfly_Data login area");
    }
};

// Helper function to check if the token is expired
