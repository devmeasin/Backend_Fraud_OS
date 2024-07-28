import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { Logger } from 'winston';
import { User } from '../entities/User';
import { UserService } from '../services/UserService';
import { loginSchema, registerSchema } from '../validator/authValidationSchema';

export class AuthController {


  constructor(private userService: UserService, private logger: Logger) 
  {}

  async register(req: Request, res: Response, next: NextFunction) {

    await checkSchema(registerSchema).run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {fullName,companyName,companyWebsite, email, phone, password } = req.body;

    this.logger.debug("New request to register a user", {
      fullName,companyName,companyWebsite, email, phone,
      password: "******",
    });

    try {
      const user = await this.userService.create({
        fullName,companyName,companyWebsite, email, phone,password,
      });
      this.logger.info("User has benn Register", { id: user.id });
     
      res.status(201).json({ id: user.id, role: user.role });

  } catch (err) {
      return next(err);
  }
     // Generate OTP for phone verification
    // await this.otpService.generateOTP(user.id);
  }

  async login(req: Request, res: Response) {
    await checkSchema(loginSchema).run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    const user = await User.findOne({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }

    // Generate JWT tokens
    // const accessToken = this.authService.generateAccessToken(user);
    // const refreshToken = this.authService.generateRefreshToken(user);

    // res.json({ accessToken, refreshToken });
  }

  // Other methods for OTP verification, forgot password, reset password, etc.
}
