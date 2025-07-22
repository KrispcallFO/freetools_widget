"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const client_1 = require("@prisma/client");
class Repository {
    static async addNumber(country, number, country_code) {
        try {
            await this.prisma.countries_Number.create({
                data: {
                    countries: country,
                    country_code: country_code,
                    number: number,
                },
            });
            console.log(`Number ${number} added for country ${country}`);
            return JSON.parse(JSON.stringify({
                message: `Number ${number} added for country ${country}`,
            }));
        }
        catch (error) {
            console.error("Error adding number:", error);
            throw error;
        }
    }
    static async addNumberToCountry(text, code, phoneNumber) {
        try {
            const createdEntry = await this.prisma.countries_Number.create({
                data: {
                    countries: text,
                    country_code: code,
                    number: phoneNumber,
                },
            });
            console.log(`✅ Number ${phoneNumber} added for country ${text}`);
            return {
                message: `Number ${phoneNumber} added for country ${text}`,
                data: createdEntry,
            };
        }
        catch (error) {
            console.error(`❌ Failed to add number for ${text}:`, error);
            throw new Error("Database error while adding number");
        }
    }
    static async deleteNumber(number) {
        try {
            const deletedNumber = await this.prisma.countries_Number.deleteMany({
                where: {
                    number: number,
                },
            });
            if (!deletedNumber) {
                console.log(`Number ${number} not found`);
                return JSON.parse(JSON.stringify({ message: `Number ${number} not found` }));
            }
            console.log(`Number ${number} deleted successfully`);
            return JSON.parse(JSON.stringify(deletedNumber));
        }
        catch (error) {
            console.error("Error deleting number:", error);
            return JSON.parse(JSON.stringify({
                error: "Error deleting number",
                details: error instanceof Error ? error.message : error,
            }));
        }
    }
    static async getAllNumbers(country) {
        try {
            const numbers = await this.prisma.countries_Number.findMany({
                where: { country_code: country },
                select: {
                    countries: false,
                    number: true,
                },
            });
            const numbersArray = numbers.map((item) => item.number);
            console.log("Fetched numbers:", numbers);
            return numbersArray;
        }
        catch (error) {
            console.error("Error fetching numbers:", error);
            throw error;
        }
    }
    // login 
    static async login(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new Error('User not found');
            }
            console.log("✅ Fetched user:", user);
            return user;
        }
        catch (error) {
            console.error("❌ Error fetching user:", error);
            throw error;
        }
    }
    //   static async login(email: string, password: string): Promise < { token: string, userId: number } > {
    //   try {
    //     // Find user by email
    //     const user = await this.prisma.user.findUnique({
    //       where: { email },
    //     });
    //     if(!user) {
    //       throw new Error('Invalid email or password');
    //     }
    //       // Compare hashed password
    //       const isPasswordValid = await bcrypt.compare(password, user.password);
    //     if(!isPasswordValid) {
    //       throw new Error('Invalid email or password');
    //     }
    //       console.log(`✅ User logged in: ${email}`);
    //     // For real apps, return a JWT or session token
    //     return {
    //       token: 'dummy-auth-token',  // replace with actual JWT token
    //       userId: user.id,
    //     };
    //   } catch(error) {
    //     console.error(`❌ Login failed for email ${email}:`, error);
    //     throw new Error(error instanceof Error ? error.message : 'Database error during login');
    //   }
    // }
    // Get all sms 
    static async getSmsNumbers() {
        return await this.prisma.otpMessages.findMany({
            orderBy: {
                parsedTimestamp: "desc",
            },
        });
    }
    // OPTIMIZED: Create OTP message
    static async otpMessage(phoneNumber, text, code, parsedTimestamp) {
        return await this.prisma.otpMessages.create({
            data: {
                phoneNumber,
                text,
                code,
                parsedTimestamp: parsedTimestamp ?? new Date(),
            },
        });
    }
    // OPTIMIZED: Get limited recent SMS numbers instead of all
    static async getAllSmsNumbers(limit = 50) {
        return await this.prisma.otpMessages.findMany({
            orderBy: {
                parsedTimestamp: "desc",
            },
            take: limit, // Limit the number of records returned
        });
    }
    // NEW: Get recent OTPs for specific phone numbers (for initial socket load)
    static async getRecentOtpsForNumbers(phoneNumbers, limit = 5) {
        if (!phoneNumbers.length)
            return [];
        return await this.prisma.otpMessages.findMany({
            where: {
                phoneNumber: {
                    in: phoneNumbers,
                },
            },
            orderBy: {
                parsedTimestamp: "desc",
            },
            take: limit * phoneNumbers.length, // Get top N for each number
        });
    }
    // NEW: Get latest OTPs (for broadcasting new OTPs only)
    static async getLatestOtps(limit = 10) {
        return await this.prisma.otpMessages.findMany({
            orderBy: {
                parsedTimestamp: "desc",
            },
            take: limit,
        });
    }
    // OPTIMIZED: Get OTPs for a specific phone number with limit
    static async getOtpsForPhoneNumber(phoneNumber, limit = 5) {
        return await this.prisma.otpMessages.findMany({
            where: {
                phoneNumber: phoneNumber,
            },
            orderBy: {
                parsedTimestamp: "desc",
            },
            take: limit,
        });
    }
    static async getMessagesOfNumber(number) {
        try {
            const details = await this.prisma.number_Details.findMany({
                where: { to_number: number },
                select: {
                    to_number: true,
                    messages: true,
                    from_number: true,
                },
            });
            if (!details) {
                console.log(`No details found for number ${number}`);
                return null;
            }
            console.log(`Details for number ${number}:`, details);
            return JSON.parse(JSON.stringify(details));
        }
        catch (error) {
            console.error("Error fetching details of number:", error);
            throw error;
        }
    }
    static async addMessageToNumber(number, from_number, messages) {
        try {
            await this.prisma.number_Details.create({
                data: {
                    to_number: number,
                    from_number: from_number,
                    messages: messages,
                },
            });
            console.log(`Messages added for number ${number}`);
            return JSON.parse(JSON.stringify({ message: `Messages added for number ${number}` }));
        }
        catch (error) {
            console.error("Error adding messages to number:", error);
            throw error;
        }
    }
}
exports.Repository = Repository;
Repository.prisma = new client_1.PrismaClient();
