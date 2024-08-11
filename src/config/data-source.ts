import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";
import { User } from "../entities/User";
import { OTP } from "../entities/OTP";
import { RefreshToken } from "../entities/RefreshToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASS,
    database: Config.DB_NAME,
    // Don't use this in production
    synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",
    logging: false,
    entities: [User, OTP, RefreshToken],
    migrations: [],
    subscribers: [],
});
