import express, { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// Controller imports
import { AuthController } from "../controllers/authController";

// Service imports
import { TokenService } from "../services/tokenService";
import { UserService } from "../services/userService";
import { CredentialService } from "../services/credentialService";
import { OTPService } from "../services/OTPService";

// Middleware imports
import authenticate from "../middlewares/authenticate";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import valiadateRefreshToken from "../middlewares/valiadateRefreshToken";

// Type imports
import { AuthRequest } from "../types";

const router = express.Router();

const userService = new UserService();
const otpService = new OTPService(logger);
const tokenService = new TokenService();
const credentialService = new CredentialService(logger);
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
    otpService,
);
// const otpController = new OTPController(otpService, userService, logger);

router.post("/register", (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);

router.post("/login", (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res),
);

router.post(
    "/refresh",
    valiadateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next),
);

router.post(
    "/logout",
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next),
);

router.post(
    "/forget-password",
    (req: Request, res: Response, next: NextFunction) =>
        authController.forgotPassword(req as AuthRequest, res, next),
);

router.post(
    "/verify-otp",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.verifyOTP(req as AuthRequest, res, next),
);

router.post(
    "/reset-password",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.resetPassword(req as AuthRequest, res, next),
);

router.post(
    "/generate-otp",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.genarateOTP(req as AuthRequest, res, next),
);

// router.post(
//     "/generate-otp",
//     (req: Request, res: Response, next: NextFunction) =>
//         otpController.generateOTP(req, res, next),
// );

export default router;
