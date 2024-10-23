export const Roles = {
    CUSTOMER: "customer",
    MANAGER: "manager",
    ADMIN: "admin",
} as const;

export const CourierURI = {
    redx_url: {
        login_url: "https://api.redx.com.bd/v4/auth/login",
        fraud_check_url:
            "https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=",
    },
    steadfast_url: {
        login_url: "https://steadfast.com.bd/login",
        fraud_check_url: "https://steadfast.com.bd/user/frauds/check/",
    },

    pathao_url: {
        login_url: "https://merchant.pathao.com/api/v1/login",
        register_url: "https://merchant.pathao.com/api/v1/register/account",
        fraud_check_url: "https://merchant.pathao.com/api/v1/user/success",
    },

    paperfly_url: {
        login_url:
            "https://go-app.paperfly.com.bd/merchant/api/react/authentication/login_using_password.php",
        fraud_check_url:
            "https://go-app.paperfly.com.bd/merchant/api/react/smart-check/list.php?",
    },
};
