import axios, { AxiosResponse } from "axios";
import qs from "qs";
import logger from "../../utils/logger";
import { CourierURI } from "../../constants";
import axiosRetry from "axios-retry";

const { login_url } = CourierURI.steadfast_url;

const STEADFAST_CREDENTIALS = {
    email: "easinislam299@gmail.com",
    password: "E@sin$018208##",
    remember: "on",
};

interface SessionData {
    xsrfToken: string;
    steadfast_merchant_session: string;
    remember_web_cookie: string;
    expires: Date;
}

let sessionData: SessionData | null = null;

const extractCsrfToken = (html: string): string | null => {
    const csrfTokenRegex = /<input type="hidden" name="_token" value="(.+?)">/i;
    const csrfTokenMatch = html.match(csrfTokenRegex);
    return csrfTokenMatch ? csrfTokenMatch[1] : null;
};

const setCookieExpiration = (cookies: string[]): Date => {
    const expirationCookie = cookies.find((cookie) =>
        cookie.includes("expires"),
    );
    if (expirationCookie) {
        const expiresString = expirationCookie
            .split(";")
            .find((part) => part.trim().startsWith("expires="))
            ?.split("=")[1]
            .trim();
        if (expiresString) {
            return new Date(expiresString);
        }
    }
    return new Date(Date.now() + 30 * 60 * 1000); // Default to 30 minutes if no expiration is provided
};

async function login(): Promise<SessionData> {
    const response: AxiosResponse<string> = await axios.get(login_url);
    const csrfToken = extractCsrfToken(response.data);
    const cookies = response.headers["set-cookie"] as string[];

    if (!csrfToken) {
        logger.error("CSRF token not found.");
        throw new Error("CSRF token not found.");
    }

    const xsrfToken = cookies
        .find((cookie) => cookie.startsWith("XSRF-TOKEN"))
        ?.split(";")[0]
        .split("=")[1];
    const steadfast_merchant_session = cookies
        .find((cookie) => cookie.startsWith("steadfast_merchant_session"))
        ?.split(";")[0]
        .split("=")[1];

    if (!xsrfToken || !steadfast_merchant_session) {
        logger.error("Required cookies not found.");
        throw new Error("Required cookies not found.");
    }

    const formData = qs.stringify({
        ...STEADFAST_CREDENTIALS,
        _token: csrfToken,
    });

    const loginResponse: AxiosResponse<string> = await axios.post(
        login_url,
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Cookie: `XSRF-TOKEN=${xsrfToken}; steadfast_merchant_session=${steadfast_merchant_session}`,
            },
        },
    );

    const newCookies = loginResponse.headers["set-cookie"] as string[];
    const rememberWebCookie = newCookies.find((cookie) =>
        cookie.startsWith("remember_web"),
    );

    if (!rememberWebCookie) {
        logger.error("Remember web cookie not found.");
        throw new Error("Remember web cookie not found.");
    }

    sessionData = {
        xsrfToken,
        steadfast_merchant_session,
        remember_web_cookie: rememberWebCookie,
        expires: setCookieExpiration(newCookies),
    };
    if (sessionData.remember_web_cookie) {
        logger.info(
            "Session successfully created. Remember web cookie:🍪",
            sessionData.remember_web_cookie,
        );
    } else {
        logger.error("Session creation failed.");
    }

    return sessionData;
}

// Initialize Axios retry
axiosRetry(axios, {
    retries: 3, // Maximum number of retries
    retryDelay: (retryCount) => {
        return retryCount * 1000; // Delay between retries (1 second)
    },
    retryCondition: (error) => {
        // Retry on network errors or 5xx errors
        return (
            !!(error.response && error.response?.status >= 500) ||
            error.code === "ECONNABORTED"
        );
    },
});

// Refresh session if expired
async function getSessionData(): Promise<SessionData> {
    if (!sessionData || sessionData.expires < new Date()) {
        logger.info("Session expired or not found, logging in again.");
        sessionData = await login();
    }
    return sessionData;
}

export default getSessionData;
