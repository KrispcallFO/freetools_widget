"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
(async () => {
    try {
        const email = "admin@town.com";
        const password = "admin@123";
        const name = "Admin";
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            console.log("Admin already exists!");
            process.exit(0);
        }
        // Create the admin
        await prisma.user.create({
            data: {
                name,
                email,
                password,
                phone: "9829192922",
                address: "kalopul, ktm",
                role: "admin",
                isVerified: true,
            },
        });
        console.log("Admin has been created successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
})();
