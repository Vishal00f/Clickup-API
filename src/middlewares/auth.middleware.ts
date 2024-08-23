// import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';

// export const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

// export interface CustomRequest extends Request {
//  token: string | JwtPayload;
// }

// export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
//  try {
//    const token = req.header('Authorization')?.replace('Bearer ', '');

//    if (!token) {
//      throw new Error();
//    }

//    const decoded = jwt.verify(token, SECRET_KEY as Secret);
//    (req as CustomRequest).token = decoded;

//    next();
//  } catch (err) {
//    res.status(401).send('Please authenticate');
//  }
// };























import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")?.trim();
        if (!token) {
            throw new ApiError(401, "Unauthorized access: No token provided");
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError(500, "Server error: ACCESS_TOKEN_SECRET is not defined");
        }

        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;

            if (!decodedToken._id) {
                throw new ApiError(401, "Invalid token: No user ID in token");
            }

            const user = await User.findById(decodedToken._id).select("-password -refreshToken");

            if (!user) {
                throw new ApiError(404, "User not found: Invalid access token");
            }

            req.user = user;
            next();
        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError);
            throw new ApiError(401, "Invalid access token: JWT verification failed");
        }
    } catch (error) {
        next(error);
    }
});
