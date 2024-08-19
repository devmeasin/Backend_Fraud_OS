import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import cors from "cors";
import "reflect-metadata";
import logger from "./utils/logger";
import authRouter from "./routes/authRoutes";
import fraudCheckerRouter from "./routes/fraudCheckerRoutes";
import paymentRouter from "./routes/paymentRoutes";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("<h1>Amr Sonar Bangla 🎉</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/fraud-checker", fraudCheckerRouter);

// for testing
app.use("/api/v1/payment", paymentRouter);

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
