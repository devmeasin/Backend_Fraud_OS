import { Request } from "express";

export interface UserData {
    fullName: string;
    companyName: string;
    companyWebsite: string;
    email: string;
    phone: string;
    password: string;
}

export interface UserData_delPassword {
    fullName: string;
    companyName: string;
    companyWebsite: string;
    email: string;
    phone: string;
    password?: string;
    isEmailVerified?: false;
    isPhoneVerified?: false;
    isVerified?: false;
    role?: "customer";
    isActive?: false;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id: string;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}
