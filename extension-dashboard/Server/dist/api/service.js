"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const jwt_1 = require("../utils/jwt");
const repository_1 = require("./repository");
class Services {
    static async getAllNumbersAPI(country) {
        try {
            const url = `https://freetoolsv2.marktivities.guru/api/phone/number-generator/?country=${country}`;
            const Param = {
                country: country,
            };
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("API key is missing in environment variables");
            }
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ERROR: ${response.statusText}`);
            }
            console.log("Response status:", response.status);
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching numbers:", error);
            throw error;
        }
    }
    static async getAllNumbersWithQuery(country) {
        try {
            const allNumbers = await repository_1.Repository.getAllNumbers(country);
            if (!allNumbers || allNumbers.length === 0) {
                throw new Error("No numbers found for the specified country");
            }
            return allNumbers;
        }
        catch (error) {
            console.error("Error fetching numbers with query:", error);
            return [];
        }
    }
    // Login 
    static async login(email, password, res) {
        const user = await repository_1.Repository.login(email);
        if (!user)
            throw new Error('Invalid email or password');
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }
        // const isPasswordValid = await user.comparePassword(password);
        // if (!isPasswordValid) {
        //   throw new Error('Invalid email or password');
        // }
        // ✅ Token logic — send JWT
        (0, jwt_1.sendToken)(user.id, res);
    }
    static async getDetailsOfNumber(number) {
        try {
            if (!number) {
                throw new Error("Number query parameter is required");
            }
            const messages = await repository_1.Repository.getMessagesOfNumber(number);
            if (!messages || messages.length === 0) {
                throw new Error(`No messages found for the number ${number}`);
            }
            return messages;
        }
        catch (error) {
            console.error("Error fetching details of number:", error);
            throw error;
        }
    }
    // Get all sms
    static async getAllSms() {
        try {
            const allNumbers = await repository_1.Repository.getSmsNumbers();
            if (!allNumbers || allNumbers.length === 0) {
                // Instead of throwing, just return empty array silently
                return [];
            }
            return allNumbers;
        }
        catch (error) {
            console.error("Error fetching SMS:", error); // Log only unexpected errors
            return [];
        }
    }
    static async deleteNumber(number) {
        try {
            if (!number) {
                throw new Error("Number is required for deletion");
            }
            const deletedNumber = await repository_1.Repository.deleteNumber(number);
            return deletedNumber;
        }
        catch (error) {
            console.error("Error deleting number:", error);
            throw error;
        }
    }
    static async otpMessage(phoneNumber, text, code, parsedTimestamp) {
        if (!phoneNumber || !text) {
            throw new Error("phoneNumber and text are required");
        }
        return await repository_1.Repository.otpMessage(phoneNumber, text, code, parsedTimestamp);
    }
    // NEW: Get OTPs for specific phone numbers (optimized service method)
    static async getOtpsForPhoneNumbers(phoneNumbers, limit = 5) {
        if (!phoneNumbers || phoneNumbers.length === 0) {
            throw new Error("phoneNumbers array is required and cannot be empty");
        }
        return await repository_1.Repository.getRecentOtpsForNumbers(phoneNumbers, limit);
    }
    // NEW: Get latest OTPs (optimized service method)
    static async getLatestOtps(limit = 10) {
        return await repository_1.Repository.getLatestOtps(limit);
    }
    // NEW: Get OTPs for a specific phone number (optimized service method)
    static async getOtpsForPhoneNumber(phoneNumber, limit = 5) {
        if (!phoneNumber) {
            throw new Error("phoneNumber is required");
        }
        return await repository_1.Repository.getOtpsForPhoneNumber(phoneNumber, limit);
    }
    static async addNumber(number, country, country_code) {
        try {
            if (!number || !country || !country_code) {
                throw new Error("Number and country are required for adding a number");
            }
            const addedNumber = await repository_1.Repository.addNumber(country, number, country_code);
            return addedNumber;
        }
        catch (error) {
            console.error("Error adding number:", error);
            throw error;
        }
    }
    static async addMessageToNumber(number, from_number, messages) {
        try {
            if (!number || !messages || !from_number) {
                throw new Error("Number and message are required for adding a message");
            }
            const addedMessage = await repository_1.Repository.addMessageToNumber(number, from_number, messages);
            return addedMessage;
        }
        catch (error) {
            console.error("Error adding message to number:", error);
            throw error;
        }
    }
}
exports.Services = Services;
