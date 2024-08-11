import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm";
import { OTP } from "./OTP";

@Entity({ name: "users" })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ unique: true })
    // username: string;

    @Column()
    fullName: string;

    @Column()
    companyName: string;

    @Column()
    companyWebsite: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    phone: string;

    @Column()
    password: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: false })
    isPhoneVerified: boolean;

    @Column({ default: false })
    isVerified: boolean; // New flag for OTP verification

    @Column({ default: "customer" })
    role: string;

    @Column({ default: false })
    isActive: boolean;

    @OneToMany(() => OTP, (otp) => otp.user)
    otps: OTP[];

    // Other fields like queryCount, balance, etc.
}
