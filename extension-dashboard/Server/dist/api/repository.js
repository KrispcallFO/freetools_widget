"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const client_1 = require("@prisma/client");
class Repository {
    static async getAllNumbersFromDatabase() {
        try {
            return await this.prisma.countries_Number.findMany({
                orderBy: {
                    number: "asc",
                },
            });
        }
        catch (error) {
            console.error("Error fetching all numbers from database:", error);
            throw error;
        }
    }
    static async getAllMessages() {
        try {
            const messages = await this.prisma.otpMessages.findMany({
                orderBy: {
                    parsedTimestamp: "desc",
                },
            });
            return messages.map((msg) => msg.text);
        }
        catch (error) {
            console.error("Error fetching all messages:", error);
            throw error;
        }
    }
    static async addNumber(country, number, country_code, expiry_date, extension) {
        try {
            await this.prisma.countries_Number.create({
                data: {
                    countries: country,
                    country_code: country_code,
                    number: number,
                    expiry_date: expiry_date,
                    extension_date: extension,
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
    static async addNumberToCountry(text, code, phoneNumber, expiry_date, extension) {
        try {
            const createdEntry = await this.prisma.countries_Number.create({
                data: {
                    countries: text,
                    country_code: code,
                    number: phoneNumber,
                    expiry_date: expiry_date,
                    extension_date: extension,
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
    // Get all sms 
    static async getSmsNumbers() {
        return await this.prisma.otpMessages.findMany({
            orderBy: {
                parsedTimestamp: "desc",
            },
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
                    time_stamp: true,
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
    static async getDetailsOfAllInbox() {
        try {
            const inbox = await this.prisma.number_Details.findMany({
                select: {
                    to_number: true,
                    messages: true,
                    from_number: true,
                    time_stamp: true
                }
            });
            if (!inbox || inbox.length === 0) {
                console.log('No messages found in inbox');
                return [];
            }
            console.log('Inbox details:', inbox);
            return JSON.parse(JSON.stringify(inbox));
        }
        catch (error) {
            console.error('Error fetching inbox details:', error);
            throw error;
        }
    }
    static async saveEditedNumber(countries, number, country_code, expiry_date, extension_date) {
        try {
            const updatedNumber = await this.prisma.countries_Number.update({
                where: { number: number },
                data: {
                    countries: countries,
                    number: number,
                    country_code: country_code,
                    expiry_date: expiry_date,
                    extension_date: extension_date
                },
            });
            console.log(`Number ${number} updated successfully`);
            return JSON.parse(JSON.stringify(updatedNumber));
        }
        catch (error) {
            console.error("Error updating number:", error);
            throw error;
        }
    }
    static async getNewOtp(phoneNumber, timestamp) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            const newOtp = await this.prisma.number_Details.findMany({
                where: {
                    to_number: phoneNumber,
                    time_stamp: { gt: new Date(timestamp) }
                },
                orderBy: {
                    time_stamp: "asc",
                },
                take: 10,
            });
            if (!newOtp) {
                throw new Error(`No OTP found for the phone number ${phoneNumber}`);
            }
            return newOtp;
        }
        catch (error) {
            console.error("Error fetching new OTP:", error);
            throw error;
        }
    }
}
exports.Repository = Repository;
Repository.prisma = new client_1.PrismaClient();
