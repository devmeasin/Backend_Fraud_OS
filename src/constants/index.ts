export const Roles = {
    CUSTOMER: "customer",
    MANAGER: "manager",
    ADMIN: "admin",
} as const;

export const CourierURI = {
    redx_url:
        "https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=",

    steadfast_url: {
        login_url: "https://steadfast.com.bd/login",
        fraud_check_url: "https://steadfast.com.bd/user/frauds/check/",
    },

    pathao_url: {
        login_url: "https://merchant.pathao.com/api/v1/login",
        register_url: "https://merchant.pathao.com/api/v1/register/account",
        fraud_check_url: "https://merchant.pathao.com/api/v1/user/success",
    },
};
