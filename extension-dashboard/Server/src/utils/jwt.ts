import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

dotenv.config();

interface TokenPayload {
    userId: number;
}

/**
 * Sends a JWT as an HTTP-only cookie
 * @param userId - The user's ID
 * @param res - Express response object
 */
export const sendToken = (userId: number, res: Response): void => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload: TokenPayload = { userId };

    // Create the JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });

    // Set the token in an HTTP-only cookie
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // secure: true in production
        sameSite: 'strict',
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // Optional: send a JSON response as confirmation
    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token, // Optional: include token in response (avoid in strict security contexts)
    });
};
