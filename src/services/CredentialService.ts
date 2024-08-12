import bcrypt from "bcrypt";
import { IUser as UserDocument } from "../models/userModel";
import { Logger } from "winston";

export class CredentialService {
    constructor(private logger: Logger) {}

    async comparePassword(password: string, hashPassword: string) {
        return bcrypt.compare(password, hashPassword);
    }

    async updatePassword(
        user: UserDocument,
        newPassword: string,
    ): Promise<void> {
        user.password = await this.hashPassword(newPassword); // Hash the new password
        await user.save(); // Save the updated user to the database
        this.logger.info("Password updated successfully", { userId: user._id });
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10); // Hash with a salt of 10 rounds
    }
}
