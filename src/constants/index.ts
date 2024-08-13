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
};
