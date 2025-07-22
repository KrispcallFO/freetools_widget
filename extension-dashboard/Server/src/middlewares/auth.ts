import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from './asyncHandler';
import ErrorHandler from '../utils/ErrorHandler';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken {
    userId: number;
    iat: number;
    exp: number;
    role:string;
}

// Optionally define a safer user type (without password)
type SafeUser = Omit<User, 'password'>;

// Extend Express Request to include `user`
declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}

// Middleware: check if user is authenticated
const isAuthenticated = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies?.jwt;

        if (!token) {
            return next(new ErrorHandler('Please login to access this resource', 401));
        }

        let decoded: DecodedToken;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        } catch (error) {
            return next(new ErrorHandler('Token is invalid or expired', 401));
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId, role: decoded.role },
        });

        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }

        // Omit sensitive fields (like password) from user object
        const { password, ...safeUser } = user;

        req.user = safeUser as SafeUser;
        next();
    }
);

// Middleware: restrict route to specific roles
const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const role = req.user?.role;
        console.log(role)

        if (!roles.includes(role || '')) {
            return next(
                new ErrorHandler(`Role: ${role} is not allowed to access this route`, 403)
            );
        }

        next();
    };
};

export { isAuthenticated, authorizeRoles };
 