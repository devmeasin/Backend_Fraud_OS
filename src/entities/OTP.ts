import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BaseEntity,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "otps" })
export class OTP extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    otp: number;

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    isUsed: boolean;

    @ManyToOne(() => User, (user) => user.otps)
    user: User;
}
