import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../utils/logger";
// import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entities/User";
// import authenticate from "../middlewares/authenticate";
// import { CredentialService } from "../services/CredentialService";
// import { TokenService } from "../services/TokenService";
// import { AuthRequest } from "../types";
// import loginValidator from "../validator/login-validator";
// import resgisterValidator from "../validator/register-validator";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
// import { container } from "../di-container";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
// const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
// const tokenService = new TokenService(refreshTokenRepository);
// const credentialService = new CredentialService();
const authController = new AuthController(userService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", (req : Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
// router.post("/login",loginValidator, (req : Request, res: Response, next: NextFunction) =>
//     authController.login(req, res, next)
// );



export default router;