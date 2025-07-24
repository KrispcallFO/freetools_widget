"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const jwt_1 = require("../utils/jwt");
const repository_1 = require("./repository");
class Services {
    static getAllNumbers() {
        try {
            return repository_1.Repository.getAllNumbersFromDatabase();
        }
        catch (error) {
            console.error("Error in getAllNumbers:", error);
            throw error;
        }
    }
    static async getAllNumbersAPI(country) {
        try {
            const url = `https://freetoolsv3.marktivities.guru/api/phone/number-generator/?country=${country}`;
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
    static async getDetailsOfAllInbox() {
        try {
            const allInboxDetails = await repository_1.Repository.getDetailsOfAllInbox();
            if (!allInboxDetails || allInboxDetails.length === 0) {
                throw new Error('No inbox details found');
            }
            return allInboxDetails;
        }
        catch (error) {
            console.error('Error fetching details of all inbox:', error);
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
    // NEW: Get OTPs for a specific phone number (optimized service method)
    static async getOtpsForPhoneNumber(phoneNumber, limit = 5) {
        if (!phoneNumber) {
            throw new Error("phoneNumber is required");
        }
        return await repository_1.Repository.getOtpsForPhoneNumber(phoneNumber, limit);
    }
    static async addNumber(number, country, country_code, expiry_date, extension) {
        try {
            if (!number || !country || !country_code) {
                throw new Error("Number and country are required for adding a number");
            }
            const addedNumber = await repository_1.Repository.addNumber(country, number, country_code, expiry_date, extension);
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
    static async saveEditedNumber(countries, number, country_code, expiry_date, extension_date) {
        try {
            if (!countries || !number || !country_code) {
                throw new Error("Countries, number, and country_code are required");
            }
            const updatedNumber = await repository_1.Repository.saveEditedNumber(countries, number, country_code, expiry_date, extension_date);
            return updatedNumber;
        }
        catch (error) {
            console.error("Error saving edited number:", error);
            throw error;
        }
    }
    static async getNewOtp(phoneNumber, timestamp) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            const newOtp = await repository_1.Repository.getNewOtp(phoneNumber, timestamp);
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
    static async getCarrierInfo(phoneNumber, country) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Carrier API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/phone/carrier/?number=${phoneNumber}&country=${country}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching carrier info:", error);
            throw error;
        }
    }
    static async getAreaCodeInfo(country, areaCode, stateName, cityName) {
        try {
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Area code API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/areaCode/area-code/?country=${country}&area_code=${areaCode}&state_name=${stateName}&city_name=${cityName}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching area code info:", error);
            throw error;
        }
    }
    static async getPhoneCheckerInfo(phoneNumber, country) {
        console.log("Fetching phone checker info for:", phoneNumber, "in country:", country);
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            if (!country) {
                throw new Error("country is required");
            }
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Phone checker API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/phone/checker/?number=${phoneNumber}&country=${country}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Response status:", response.status);
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching phone checker info:", error);
            throw error;
        }
    }
    static async getPhoneValidatorInfo(phoneNumber, country) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            if (!country) {
                throw new Error("country is required");
            }
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Phone validator API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/phone/validator/?number=${phoneNumber}&country=${country}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching phone validator info:", error);
            throw error;
        }
    }
    static async getReverseLookupInfo(phoneNumber, country) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            if (!country) {
                throw new Error("country is required");
            }
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Reverse lookup API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/phone/reverse-lookup/?number=${phoneNumber}&country=${country}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching reverse lookup info:", error);
            throw error;
        }
    }
    static async getSocialMediaFinderInfo(phoneNumber, country) {
        try {
            if (!phoneNumber) {
                throw new Error("phoneNumber is required");
            }
            if (!country) {
                throw new Error("country is required");
            }
            const apiKey = process.env.number_generator_api_key;
            if (!apiKey) {
                throw new Error("Social media finder API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/socialMedia/social-media-finder/?number=${phoneNumber}&country=${country}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching social media finder info:", error);
            throw error;
        }
    }
    static async getSpeechToTextInfo(audioFile, model) {
        try {
            if (!audioFile) {
                throw new Error("Audio file is required for speech to text conversion");
            }
            const apiKey = process.env.speech_to_text_api_key;
            if (!apiKey) {
                throw new Error("Speech to text API key is missing in environment variables");
            }
            const formData = new FormData();
            formData.append('audio_file', audioFile);
            formData.append('model', model);
            const url = 'https://freetoolsv3.marktivities.guru/api/speech-to-text/';
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: headers,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching speech to text info:", error);
            throw error;
        }
    }
    static async getTextToSpeechInfo(text, language) {
        try {
            if (!text) {
                throw new Error("Text is required for text to speech conversion");
            }
            const apiKey = process.env.text_to_speech_api_key;
            if (!apiKey) {
                throw new Error("Text to speech API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/textTools/text-to-speech/?sentence=${encodeURIComponent(text)}&voice=${language}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching text to speech info:", error);
            throw error;
        }
    }
    static async getVoicemailGeneratorInfo(sentence, voice, bgSound) {
        try {
            if (!sentence) {
                throw new Error("Sentence is required for voicemail generation");
            }
            const apiKey = process.env.voicemail_generator_api_key;
            if (!apiKey) {
                throw new Error("Voicemail generator API key is missing in environment variables");
            }
            const url = `https://freetoolsv3.marktivities.guru/api/textTools/voicemail-generator/?sentence=${encodeURIComponent(sentence)}&voice=${voice}&bg_sound=${bgSound}`;
            const headers = {
                "api-key": apiKey,
            };
            const response = await fetch(url, { headers: headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching voicemail generator info:", error);
            throw error;
        }
    }
}
exports.Services = Services;
