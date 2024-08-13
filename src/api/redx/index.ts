import axios from "axios";
import { CourierURI } from "../../constants";
import { TRedXData } from "../../types";

export const RedX_Data = async ({ phone }: { phone: string }) => {
    const response = await axios.get(`${CourierURI.redx_uri}${phone}`);
    return response.data as TRedXData;
};
