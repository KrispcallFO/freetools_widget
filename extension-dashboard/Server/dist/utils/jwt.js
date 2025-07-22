"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
/**
 * Sends a JWT as an HTTP-only cookie
 * @param userId - The user's ID
 * @param res - Express response object
 */
const sendToken = (userId, res) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const payload = { userId };
    // Create the JWT token
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
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
exports.sendToken = sendToken;
