import axios from "axios";
import { Config } from "../config";

// Utility to get bKash token
export const getBkashToken = async () => {
    try {
        const { data } = await axios.post(
            Config.BKASH_GRANT_TOKEN_URL as string,
            {
                app_key: Config.BKASH_API_KEY,
                app_secret: Config.BKASH_SECRET_KEY,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    username: Config.BKASH_USERNAME,
                    password: Config.BKASH_PASSWORD,
                },
            },
        );

        if (data.statusCode === "0000") {
            return data.id_token as string;
        } else {
            throw new Error("Failed to obtain token");
        }
    } catch (error) {
        throw new Error("Failed to obtain token error");
    }
};
