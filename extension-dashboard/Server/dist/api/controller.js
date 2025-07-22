"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const service_1 = require("./service");
const allowedCountries_1 = require("../config/allowedCountries");
const socket_1 = require("../socket");
const repository_1 = require("./repository");
class Controller {
    // OPTIMIZED: Handle inbound SMS with efficient OTP broadcasting
    static async handleInboundSms(req, res) {
        const { phoneNumber, text, code, timestamp } = req.body;
        if (!phoneNumber || !text) {
            res.status(400).json({ error: "Missing phoneNumber or text" });
            return;
        }
        try {
            const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
            // Save the new OTP message
            const newOtp = await service_1.Services.otpMessage(phoneNumber, text, code, parsedTimestamp);
            // OPTIMIZATION: Instead of fetching ALL OTPs, only broadcast the new OTP
            // and optionally a limited set of recent OTPs for context
            socket_1.io.emit('new-otp', {
                id: newOtp.id,
                phoneNumber: newOtp.phoneNumber,
                text: newOtp.text,
                code: newOtp.code,
                parsedTimestamp: newOtp.parsedTimestamp,
                createdAt: newOtp.createdAt
            });
            // OPTIONAL: If clients need recent context, send limited recent OTPs
            // This is much more efficient than sending ALL OTPs
            const recentOtps = await repository_1.Repository.getLatestOtps(10); // Only get latest 10
            socket_1.io.emit('recent-otps', recentOtps);
            console.log(`New OTP saved and broadcasted for ${phoneNumber}`);
            res.status(201).json({ success: true });
        }
        catch (err) {
            console.error("Error in handleInboundSms:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    // OPTIMIZED: Alternative method that still provides all OTPs but with limit
    static async handleInboundSmsWithLimitedAll(req, res) {
        const { phoneNumber, text, code, timestamp } = req.body;
        if (!phoneNumber || !text) {
            res.status(400).json({ error: "Missing phoneNumber or text" });
            return;
        }
        try {
            const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
            await service_1.Services.otpMessage(phoneNumber, text, code, parsedTimestamp);
            // OPTIMIZATION: Get only recent OTPs instead of ALL
            const limitedOtps = await repository_1.Repository.getAllSmsNumbers(50); // Limit to 50 instead of all
            console.log(`Broadcasting ${limitedOtps.length} recent OTPs instead of all`);
            socket_1.io.emit('all-otps', limitedOtps);
            res.status(201).json({ success: true });
        }
        catch (err) {
            console.error("Error in handleInboundSmsWithLimitedAll:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.Controller = Controller;
_a = Controller;
Controller.getAllNumbersApiController = async (req, res) => {
    try {
        const rawCountry = (req.query.country || "").toLowerCase();
        if (!rawCountry) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const countryToSend = allowedCountries_1.ALLOWED_COUNTRIES[rawCountry] || rawCountry;
        const numbersResponse = await service_1.Services.getAllNumbersAPI(countryToSend);
        const numbersArray = numbersResponse?.Data;
        if (!Array.isArray(numbersArray)) {
            res
                .status(500)
                .json({ error: "Invalid response format from external API" });
            return;
        }
        const isAllowed = Boolean(allowedCountries_1.ALLOWED_COUNTRIES[rawCountry]);
        const limit = isAllowed ? 1 : 5;
        const result = numbersArray.slice(0, limit);
        res.status(200).json({ Data: result });
        return;
    }
    catch (error) {
        console.error("Error in getAllNumbersApiController:", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};
Controller.getAllNumbersWithQueryController = async (req, res) => {
    try {
        const country = req.query.country;
        console.log("Country:", country);
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const numbers = await service_1.Services.getAllNumbersWithQuery(country);
        res.status(200).json(numbers);
    }
    catch (error) { }
};
// get all sms 
Controller.getAllSmsController = async (req, res) => {
    try {
        const smsList = await service_1.Services.getAllSms();
        if (!smsList || smsList.length === 0) {
            res.status(404).json({ error: "No SMS Found" });
            return;
        }
        res.status(200).json(smsList);
    }
    catch (error) {
        console.error("Error in getAllSmsController:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};
// LOGIN
Controller.loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        await service_1.Services.login(email, password, res);
        // Optionally, if your Services.login sends the token & response,
        // no need to send another response here.
        // Otherwise, you can send success here if login returns data.
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message || 'Unauthorized' });
        return;
    }
};
Controller.getDetailsOfNumberController = async (req, res) => {
    try {
        const number = req.query.number;
        if (!number) {
            res.status(400).json({ error: "Number query parameter is required" });
            return;
        }
        const details = await service_1.Services.getDetailsOfNumber(number);
        if (!details || details.length === 0) {
            res
                .status(404)
                .json({ error: `No details found for the number ${number}` });
            return;
        }
        res.status(200).json(details);
    }
    catch (error) {
        console.error("Error in getDetailsOfNumberController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.deleteNumberController = async (req, res) => {
    try {
        const number = req.query.number;
        if (!number) {
            res.status(400).json({ error: "Number query parameter is required" });
            return;
        }
        const deletedNumber = await service_1.Services.deleteNumber(number);
        res.status(200).json(deletedNumber);
    }
    catch (error) {
        console.error("Error in deleteNumberController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.addNumberController = async (req, res) => {
    try {
        const { number, countries, country_code } = req.body;
        if (!number || !countries || !country_code) {
            res.status(400).json({ error: "Number and country are required" });
            return;
        }
        const addedNumber = await service_1.Services.addNumber(number, countries, country_code);
        res.status(201).json(addedNumber);
    }
    catch (error) {
        console.error("Error in addNumberController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.addMessageController = async (req, res) => {
    try {
        const { SMS_SRC_ADDR, SMS_DST_ADDR } = req.body;
        const SMS_Text = req.body["SMS-Text"];
        if (!SMS_SRC_ADDR || !SMS_DST_ADDR || !SMS_Text) {
            res.status(400).json({ error: "Required fields missing" });
            return;
        }
        const addedMessage = await service_1.Services.addMessageToNumber(SMS_DST_ADDR, SMS_SRC_ADDR, SMS_Text);
        res.status(201).json(addedMessage);
    }
    catch (error) {
        console.error("Error in addMessageController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// NEW: Get OTPs for specific phone numbers (useful for frontend)
Controller.getOtpsForNumbers = async (req, res) => {
    try {
        const phoneNumbers = req.body.phoneNumbers;
        const limit = parseInt(req.query.limit) || 5;
        if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
            res.status(400).json({ error: "phoneNumbers array is required" });
            return;
        }
        const otps = await repository_1.Repository.getRecentOtpsForNumbers(phoneNumbers, limit);
        res.status(200).json({ otps });
    }
    catch (error) {
        console.error("Error in getOtpsForNumbers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
