"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("./asyncHandler");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Middleware: check if user is authenticated
const isAuthenticated = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
        return next(new ErrorHandler_1.default('Please login to access this resource', 401));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Token is invalid or expired', 401));
    }
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId, role: decoded.role },
    });
    if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404));
    }
    // Omit sensitive fields (like password) from user object
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
});
exports.isAuthenticated = isAuthenticated;
// Middleware: restrict route to specific roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        console.log(role);
        if (!roles.includes(role || '')) {
            return next(new ErrorHandler_1.default(`Role: ${role} is not allowed to access this route`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
