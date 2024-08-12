// import { User } from "../entities/User";

// export class BillingService {
//     static async chargeForQuery(userId: number): Promise<void> {
//         const user = await User.findOne(userId);
//         if (!user) throw new Error("User not found");

//         const charge = user.queryCharge;
//         if (user.balance < charge) throw new Error("Insufficient balance");

//         user.balance -= charge;
//         user.queryCount += 1;

//         await user.save();
//     }
// }
