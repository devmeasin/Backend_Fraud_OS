import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import cors from "cors";
import "reflect-metadata";
import logger from "./utils/logger";
import authRouter from "./routes/authRoutes";
import fraudCheckerRouter from "./routes/fraudCheckerRoutes";
import paymentRouter from "./routes/paymentRoutes";
import packageRouter from "./routes/packageRoutes";
import billingRouter from "./routes/billingRoutes";
import apiSecretRouter from "./routes/apiSecretRoute";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: [
            "https://app.ecommos.com",
            "https://ecommos.com",
            "http://localhost:5173",
        ],
        credentials: true,
    }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect("https://app.ecommos.com/");
});

// for auth routes
app.use("/api/v1/auth", authRouter);

// for fraud checker routes
app.use("/api/v1/fraud-checker", fraudCheckerRouter);

// for payment routes
app.use("/api/v1/payment", paymentRouter);

// for package routes
app.use("/api/v1/packages", packageRouter);

// for billing routes
app.use("/api/v1/billing", billingRouter);

// for user generated api secret routes
app.use("/api/v1/api-secret", apiSecretRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
