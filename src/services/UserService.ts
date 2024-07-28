import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Repository } from "typeorm";
import { User } from "../entities/User";

import { UserData } from "../types";

export class UserService {

    constructor(private userRepository: Repository<User>) {}

    async create({fullName,companyName,companyWebsite, email, phone, password }: UserData) {
        // check in user db
        const user = await this.userRepository.findOne({ where: { phone } });
        if (user) {
            const err = createHttpError(400, "Phone already Register!");
            throw err;
        }
        // passWord Has saltRound
        const saltRounds = 10;
        // password hash func here
        const hasPassword = await bcrypt.hash(password, saltRounds);

        try {
            return await this.userRepository.save({
                fullName,companyName,companyWebsite, email, phone,
                password: hasPassword,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "faild to store the data in the db",
            );
            throw error;
        }
    }

    async findByPhone(phone: string) {
        return await this.userRepository.findOne({ where: { phone } });
    }
    async findById(id: number) {
        return await this.userRepository.findOne({ where: { id } });
    }
}