import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import cors from "cors";
import "reflect-metadata";
import logger from "./utils/logger";
import authRouter from "./routes/authRoutes";
import fraudCheckerRouter from "./routes/fraudCheckerRoutes";
import companiesRoute from "./routes/companiesRoute";
import paymentRouter from "./routes/paymentRoutes";
import packageRouter from "./routes/packageRoutes";
import manualActivePackage from "./routes/manualActivePackage";
import billingRouter from "./routes/billingRoutes";
import apiSecretRouter from "./routes/apiSecretRoute";
import productRoutes from "./routes/productRoutes";

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

// company = "Ecommos";
app.use("/api/v1/companies", companiesRoute);

// for payment routes
app.use("/api/v1/payment", paymentRouter);

// for package routes
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/packages", manualActivePackage);

// for billing routes
app.use("/api/v1/billing", billingRouter);

// for user generated api secret routes
app.use("/api/v1/api-secret", apiSecretRouter);

// for products routes
app.use("/api/v1/products", productRoutes);

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
