// // utils/otpSender.ts
// import axios from "axios";

// export const sendOTP = async (phone: string, otp: string): Promise<void> => {
//     const apiKey = "your_api_key";
//     const apiSecret = "your_api_secret";
//     const sender = "your_sender_id";

//     try {
//         const response = await axios.post("https://api.smsprovider.com/send", {
//             apiKey,
//             apiSecret,
//             to: phone,
//             message: `Your OTP is ${otp}`,
//             sender,
//         });
//         // return response.data;
//         // console.log(response.data);
//         // Must log otp winston log here
//     } catch (error) {
//         // console.error("Error sending OTP:", error);

//     }
// };
