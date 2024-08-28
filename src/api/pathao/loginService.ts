import axios from "axios";
import { CourierURI } from "../../constants";
import { UserService } from "../../services/UserService";
import { PathaoTokenService } from "../../services/pathaoToken";
import { LoginResponse } from "../../types";
import logger from "../../utils/logger";

const { login_url } = CourierURI.pathao_url;

// const PATHAO_CREDENTIALS = {
//     username: "easinwebpro@gmail.com",
//     password: "E@sin$018208##",
// };

const userSertvice = new UserService();
const pathaoToken = new PathaoTokenService();

export async function loginToPathao(userId: string) {
    const user = await userSertvice.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    const PATHAO_CREDENTIALS = {
        username: user.pathaoMerchantInfo?.owner_email,
        password: user.pathaoMerchantInfo?.password,
    };
    try {
        const response = await axios.post(login_url, PATHAO_CREDENTIALS);

        // Store new token in the database
        await pathaoToken.storePathaoTokenfromDB(
            user._id,
            response.data as LoginResponse,
        );
        logger.info(
            `Logged in successfully for Pathao user ${user._id} ${user.pathaoMerchantInfo?.owner_email}`,
        );
        return response.data as LoginResponse;
    } catch (error) {
        logger.info(
            `Login failed for Pathao user ${user._id} ${user.pathaoMerchantInfo?.owner_email}`,
        );
        throw new Error(
            `Login failed for Pathao user ${user._id} ${user.pathaoMerchantInfo?.owner_email}`,
        );
    }
}
