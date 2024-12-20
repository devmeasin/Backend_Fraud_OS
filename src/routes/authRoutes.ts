import express, { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// Controller imports
import { AuthController } from "../controllers/AuthController";

// Service imports
import { CredentialService } from "../services/CredentialService";
import { OTPService } from "../services/OTPService";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";

// Middleware imports
import authenticate from "../middlewares/authenticate";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import valiadateRefreshToken from "../middlewares/valiadateRefreshToken";

// Type imports
import { AuthRequest } from "../types";
import isAdmin from "../middlewares/isAdmin";
import { CompanyService } from "../services/CompanyService";

const router = express.Router();

const userService = new UserService();
const otpService = new OTPService(logger);
const tokenService = new TokenService();
const credentialService = new CredentialService(logger);
const companyService = new CompanyService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
    otpService,
    companyService,
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
    "/reset-password",
    (req: Request, res: Response, next: NextFunction) =>
        authController.resetPassword(req as AuthRequest, res, next),
);

router.post(
    "/verify-otp",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.verifyOTP(req as AuthRequest, res, next),
);

router.post(
    "/generate-otp",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.generateOTP(req as AuthRequest, res, next),
);

// router.post(
//     "/generate-otp",
//     (req: Request, res: Response, next: NextFunction) =>
//         otpController.generateOTP(req, res, next),
// );

// All Admin Routes here

router.post(
    "/admin/reset-password",
    authenticate,
    isAdmin, // Ensures only admins can access this route
    (req: Request, res: Response, next: NextFunction) =>
        authController.adminResetPassword(req as AuthRequest, res, next),
);

router.post(
    "/admin/active_user_profile",
    authenticate,
    isAdmin,
    (req: Request, res: Response, next: NextFunction) =>
        authController.activateUserProfile(req as AuthRequest, res, next),
);

export default router;
