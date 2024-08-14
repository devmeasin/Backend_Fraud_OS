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

// courier data type

export type RedXData = {
    totalParcels: string;
    deliveredParcels: string;
    returnPercentage: string;
    customerSegment: string;
};

export type TRedXData = {
    code: number;
    isError: boolean;
    message: string;
    data: RedXData;
};

export interface LoginResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    // Add other properties as needed
}

export interface IPathaoCustomerData {
    customer_id: number;
    customer_number: string;
    successful_delivery: number;
    total_delivery: number;
    fraud_level: number;
    fraud_count: number;
    fraud_reason: null;
    customer_email: null;
    customer_country_id: number;
    customer_country_name: string;
}
export interface IPathaoCustomerCheckData {
    success_rate: number;
    fraud_level: number;
    fraud_count: number;
    fraud_reason: string;
    is_new: boolean;
    address_book: [];
    customer: IPathaoCustomerData;
}
