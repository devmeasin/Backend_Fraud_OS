import axios from "axios";

// Utility to get bKash token
export const getBkashToken = async () => {
    try {
        const { data } = await axios.post(
            "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant",
            {
                app_key: "4f6o0cjiki2rfm34kfdadl1eqq",
                app_secret:
                    "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    username: "sandboxTokenizedUser02",
                    password: "sandboxTokenizedUser02@12345",
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
