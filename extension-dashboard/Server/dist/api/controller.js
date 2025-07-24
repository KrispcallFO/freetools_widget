"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const service_1 = require("./service");
const allowedCountries_1 = require("../config/allowedCountries");
class Controller {
}
exports.Controller = Controller;
_a = Controller;
Controller.getAllNumbersController = async (req, res) => {
    try {
        const numbers = await service_1.Services.getAllNumbers();
        if (!numbers || numbers.length === 0) {
            res.status(404).json({ error: "No numbers found" });
            return;
        }
        res.status(200).json(numbers);
    }
    catch (error) {
        console.error("Error in getAllNumbersController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getDetailsOfAllInbox = async (req, res) => {
    try {
        const details = await service_1.Services.getDetailsOfAllInbox();
        if (!details || details.length === 0) {
            res.status(404).json({ error: 'No inbox details found' });
            return;
        }
        res.status(200).json(details);
    }
    catch (error) {
        console.error('Error in getDetailsOfAllInbox:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
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
        const result = numbersArray.slice(0);
        res.status(200).json({ Data: numbersArray });
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
        const country = req.query.country.toUpperCase();
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
        const { number, countries, country_code, expiry_date, extension_date } = req.body;
        if (!number || !countries || !country_code) {
            res.status(400).json({ error: "Number and country are required" });
            return;
        }
        const addedNumber = await service_1.Services.addNumber(number, countries, country_code, expiry_date, extension_date);
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
Controller.saveEditedNUmber = async (req, res) => {
    try {
        const { countries, number, country_code, expiry_date, extension_date } = req.body;
        if (!countries || !number || !country_code) {
            res.status(400).json({ error: "Countries, number and country_code are required" });
            return;
        }
        const updatedNumber = await service_1.Services.saveEditedNumber(countries, number, country_code, expiry_date, extension_date);
        res.status(200).json(updatedNumber);
    }
    catch (error) {
        console.error("Error in saveEditedNUmber:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getNewOtpController = async (req, res) => {
    try {
        const phoneNumber = req.query.number;
        const timestamp = req.query.since;
        if (!timestamp) {
            res.status(400).json({ error: "timestamp query parameter is required" });
            return;
        }
        if (!phoneNumber) {
            res.status(400).json({ error: "phoneNumber query parameter is required" });
            return;
        }
        const newOtp = await service_1.Services.getNewOtp(phoneNumber, timestamp);
        if (!newOtp) {
            res.status(404).json({ error: `No new OTP found for ${phoneNumber} after ${timestamp}` });
            return;
        }
        res.status(200).json(newOtp);
    }
    catch (error) {
        console.error("Error in getNewOtpController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getCarrierController = async (req, res) => {
    try {
        const number = req.query.number;
        const country = req.query.country;
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        if (!number) {
            res.status(400).json({ error: "Number query parameter is required" });
            return;
        }
        const carrierInfo = await service_1.Services.getCarrierInfo(number, country);
        if (!carrierInfo) {
            res.status(404).json({ error: `No carrier information found for ${number}` });
            return;
        }
        res.status(200).json(carrierInfo);
    }
    catch (error) {
        console.error("Error in getCarrierController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getAreaCodeController = async (req, res) => {
    try {
        const country = req.query.country || '';
        const areaCode = req.query.area_code || '';
        const stateName = req.query.state_name || '';
        const cityName = req.query.city_name || '';
        const areaCodeInfo = await service_1.Services.getAreaCodeInfo(country, areaCode, stateName, cityName);
        if (!areaCodeInfo) {
            res.status(404).json({ error: `No information found for area code ${areaCode}` });
            return;
        }
        res.status(200).json(areaCodeInfo);
    }
    catch (error) {
        console.error("Error in getAreaCodeController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getPhoneCheckerController = async (req, res) => {
    try {
        const phoneNumber = req.query.number;
        const country = req.query.country.toUpperCase();
        ;
        if (!phoneNumber) {
            res.status(400).json({ error: "Phone number query parameter is required" });
            return;
        }
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const phoneCheckerInfo = await service_1.Services.getPhoneCheckerInfo(phoneNumber, country);
        if (!phoneCheckerInfo) {
            res.status(404).json({ error: `No information found for phone number ${phoneNumber}` });
            return;
        }
        res.status(200).json(phoneCheckerInfo);
    }
    catch (error) {
        console.error("Error in getPhoneCheckerController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getPhoneValidatorController = async (req, res) => {
    try {
        const phoneNumber = req.query.number;
        const country = req.query.country.toUpperCase();
        if (!phoneNumber) {
            res.status(400).json({ error: "Phone number query parameter is required" });
            return;
        }
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const phoneValidatorInfo = await service_1.Services.getPhoneValidatorInfo(phoneNumber, country);
        if (!phoneValidatorInfo) {
            res.status(404).json({ error: `No validation found for phone number ${phoneNumber}` });
            return;
        }
        res.status(200).json(phoneValidatorInfo);
    }
    catch (error) {
        console.error("Error in getPhoneValidatorController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getReverseLookupController = async (req, res) => {
    try {
        const phoneNumber = req.query.number;
        const country = req.query.country.toUpperCase();
        if (!phoneNumber) {
            res.status(400).json({ error: "Phone number query parameter is required" });
            return;
        }
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const reverseLookupInfo = await service_1.Services.getReverseLookupInfo(phoneNumber, country);
        if (!reverseLookupInfo) {
            res.status(404).json({ error: `No information found for phone number ${phoneNumber}` });
            return;
        }
        res.status(200).json(reverseLookupInfo);
    }
    catch (error) {
        console.error("Error in getReverseLookupController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getSocialMediaFinderController = async (req, res) => {
    try {
        const phoneNumber = req.query.phone;
        const country = req.query.country.toUpperCase();
        if (!phoneNumber) {
            res.status(400).json({ error: "Phone number query parameter is required" });
            return;
        }
        if (!country) {
            res.status(400).json({ error: "Country query parameter is required" });
            return;
        }
        const socialMediaFinderInfo = await service_1.Services.getSocialMediaFinderInfo(phoneNumber, country);
        if (!socialMediaFinderInfo) {
            res.status(404).json({ error: `No social media information found for phone number ${phoneNumber}` });
            return;
        }
        res.status(200).json(socialMediaFinderInfo);
    }
    catch (error) {
        console.error("Error in getSocialMediaFinderController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getSpeechToTextController = async (req, res) => {
    try {
        const { audioUrl, model } = req.body;
        if (!audioUrl) {
            res.status(400).json({ error: "audio_url query parameter is required" });
            return;
        }
        const speechToTextInfo = await service_1.Services.getSpeechToTextInfo(audioUrl, model);
        if (!speechToTextInfo) {
            res.status(404).json({ error: `No speech to text information found for audio URL ${audioUrl}` });
            return;
        }
        res.status(200).json(speechToTextInfo);
    }
    catch (error) {
        console.error("Error in getSpeechToTextController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getTextToSpeechController = async (req, res) => {
    try {
        const text = req.query.sentence;
        const voice = req.query.voice || '';
        if (!text) {
            res.status(400).json({ error: "Text query parameter is required" });
            return;
        }
        const textToSpeechInfo = await service_1.Services.getTextToSpeechInfo(text, voice);
        if (!textToSpeechInfo) {
            res.status(404).json({ error: `No text to speech information found for text ${text}` });
            return;
        }
        res.status(200).json(textToSpeechInfo);
    }
    catch (error) {
        console.error("Error in getTextToSpeechController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
Controller.getVoicemailGeneratorController = async (req, res) => {
    try {
        const sentence = req.query.sentence;
        const voice = req.query.voice || '';
        const bgSound = req.query.bg_sound || '';
        if (!sentence) {
            res.status(400).json({ error: "Text query parameter is required" });
            return;
        }
        const voicemailGeneratorInfo = await service_1.Services.getVoicemailGeneratorInfo(sentence, voice, bgSound);
        if (!voicemailGeneratorInfo) {
            res.status(404).json({ error: `No voicemail generated for text ${sentence}` });
            return;
        }
        res.status(200).json(voicemailGeneratorInfo);
    }
    catch (error) {
        console.error("Error in getVoicemailGeneratorController:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
