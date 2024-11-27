import { Request } from "express";
import { IMerchantInfo } from "../models/userModel";

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
    status?: false;
    pathaoMerchantInfo?: IMerchantInfo;
    apiSecret?: string;
    apiSecretStatus?: boolean;
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
        cid: string;
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
    code: number;
    success_rate: number;
    fraud_level: number;
    fraud_count: number;
    fraud_reason: string;
    is_new: boolean;
    address_book: [];
    customer: IPathaoCustomerData;
}

interface CustomerRecord {
    customer_name: string;
    customer_phone: string;
    delivered: string;
    returned: string;
}

export interface IPaperflyApiResponse {
    code: number;
    draw: number;
    page: number;
    limit: number;
    totalFiltered: number;
    totalRecords: number;
    records: CustomerRecord[];
}

interface IPaperflyUser {
    user_type: string;
    full_name: string;
    category: string;
    merchant_code: string;
    rate_chart_id: string;
    email: string;
    phone_number: string;
    verified: boolean;
    complete_account_info: boolean;
    authed: boolean;
    user_name: string;
    password: string;
    otp_verification_needed: boolean;
    token: string;
    app_codename: string;
    queries: any[]; // Adjust type if more specific type information is available
}

export interface IPaperflyApiloginResponse {
    username: string;
    password: string;
    otp_verification_needed: boolean;
    token: string;
    type: string;
    emp_code: string;
    privilege_id: string;
    user_role_id: string;
    sip_call_permission: string;
    delivery_service: string;
    delivery_supervisor: string;
    counter_operation: string;
    express_delivery: string;
    point_codes: string;
    sip_config: string;
    user: IPaperflyUser;
    only_delivery_officer: string;
}
