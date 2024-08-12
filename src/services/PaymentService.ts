// import sslcommerz from "sslcommerz";
// import { User } from "../entities/User";
// import { Package } from "../entities/Package";
// import { Payment } from "../entities/Payment";

// export class PaymentService {
//     static async initiatePayment(
//         userId: number,
//         packageId: number,
//     ): Promise<any> {
//         const user = await User.findOne(userId);
//         const pkg = await Package.findOne(packageId);
//         if (!user || !pkg) throw new Error("User or Package not found");

//         const paymentData = {
//             total_amount: pkg.price,
//             currency: "BDT",
//             tran_id: `TRAN_${Date.now()}`,
//             success_url: "http://yourdomain.com/payment/success",
//             fail_url: "http://yourdomain.com/payment/fail",
//             cancel_url: "http://yourdomain.com/payment/cancel",
//             // more SSLCommerz configuration options
//         };

//         // Replace with your SSLCommerz credentials
//         const sslcommerzInstance = new sslcommerz(
//             "your_store_id",
//             "your_store_password",
//             false,
//         );

//         return sslcommerzInstance.init(paymentData);
//     }

//     static async handlePaymentSuccess(
//         transactionId: string,
//         userId: number,
//         packageId: number,
//     ): Promise<void> {
//         const user = await User.findOne(userId);
//         const pkg = await Package.findOne(packageId);
//         if (!user || !pkg) throw new Error("User or Package not found");

//         // Record payment
//         const payment = new Payment();
//         payment.user = user;
//         payment.package = pkg;
//         payment.amount = pkg.price;
//         payment.date = new Date();
//         payment.transactionId = transactionId;
//         await payment.save();

//         // Update user's query limit or balance
//         user.queryCount += pkg.queryLimit;
//         await user.save();
//     }
// }
