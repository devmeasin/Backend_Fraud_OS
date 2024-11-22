import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authRequest = req as AuthRequest;

    if (!authRequest.auth) {
        return next(createHttpError(401, "Unauthorized Request!"));
    }

    const userRole = authRequest.auth.role;

    if (userRole !== "admin") {
        return next(createHttpError(403, "Admin access required."));
    }

    next();
};

export default isAdmin;
