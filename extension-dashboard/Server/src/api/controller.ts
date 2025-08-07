

import { RequestHandler, Request, Response } from "express";
import { Services } from "./service";
import { ALLOWED_COUNTRIES } from "../config/allowedCountries";

export class Controller {
  static getAllNumbersController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const numbers = await Services.getAllNumbers();
      if (!numbers || numbers.length === 0) {
        res.status(404).json({ error: "No numbers found" });
        return;
      }
      res.status(200).json(numbers);
    } catch (error) {
      console.error("Error in getAllNumbersController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  public static getDetailsOfAllInbox: RequestHandler = async (req: Request, res: Response) => {
        try {
            const details = await Services.getDetailsOfAllInbox();
            if (!details || details.length === 0) {
                res.status(404).json({ error: 'No inbox details found' });
                return;
            }
            res.status(200).json(details);
        } catch (error) {
            console.error('Error in getDetailsOfAllInbox:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

  public static getAllNumbersApiController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const rawCountry = ((req.query.country as string) || "").toLowerCase();

      if (!rawCountry) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }

      const countryToSend = ALLOWED_COUNTRIES[rawCountry] || rawCountry;

      const numbersResponse = await Services.getAllNumbersAPI(countryToSend);

      const numbersArray = (numbersResponse as any)?.Data;

      if (!Array.isArray(numbersArray)) {
        res
          .status(500)
          .json({ error: "Invalid response format from external API" });
        return;
      }

      const isAllowed = Boolean(ALLOWED_COUNTRIES[rawCountry]);
      const limit = isAllowed ? 1 : 5;

      const result = numbersArray.slice(0, );

      res.status(200).json({ Data: numbersArray });
      return;
    } catch (error) {
      console.error("Error in getAllNumbersApiController:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  };


  public static getAllNumbersWithQueryController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {

      const country = (req.query.country as string).toUpperCase();
      console.log("Country:", country);
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      const numbers = await Services.getAllNumbersWithQuery(country);
      res.status(200).json(numbers);
    } catch (error) { }
  };

  // get all sms 
  public static getAllSmsController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const smsList = await Services.getAllSms();

      if (!smsList || smsList.length === 0) {
        res.status(404).json({ error: "No SMS Found" });
        return;
      }

      res.status(200).json(smsList);
    } catch (error) {
      console.error("Error in getAllSmsController:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  };

  // LOGIN
  public static loginController: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      console.log(email, password)
      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      await Services.login(email, password, res);

      // Optionally, if your Services.login sends the token & response,
      // no need to send another response here.
      // Otherwise, you can send success here if login returns data.

    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message || 'Unauthorized' });
      return;
    }
  };

  public static getDetailsOfNumberController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      let number = req.query.number as string;
      if (number) {
        number = number.replace(/[^0-9]/g, "");
      }

      if (!number) {
        res.status(400).json({ error: "Number query parameter is required" });
        return;
      }
      const details = await Services.getDetailsOfNumber(number);
      if (!details || details.length === 0) {
        res
          .status(404)
          .json({ error: `No details found for the number ${number}` });
        return;
      }
      res.status(200).json(details);
    } catch (error) {
      console.error("Error in getDetailsOfNumberController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static deleteNumberController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      let number = req.query.number as string;
      if (number) {
        number = number.replace(/[^0-9]/g, "");
      }
      if (!number) {
        res.status(400).json({ error: "Number query parameter is required" });
        return;
      }
      const deletedNumber = await Services.deleteNumber(number);
      res.status(200).json(deletedNumber);
    } catch (error) {
      console.error("Error in deleteNumberController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static addNumberController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { number, countries, country_code, expiry_date, extension_date } = req.body;
      if (!number || !countries || !country_code) {
        res.status(400).json({ error: "Number and country are required" });
        return;
      }
      const addedNumber = await Services.addNumber(
        number,
        countries,
        country_code,
        expiry_date,
        extension_date
      );
      res.status(201).json(addedNumber);
    } catch (error) {
      console.error("Error in addNumberController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static addMessageController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { SMS_SRC_ADDR, SMS_DST_ADDR } = req.body;
      const SMS_Text = req.body["SMS-Text"];
      if (!SMS_SRC_ADDR || !SMS_DST_ADDR || !SMS_Text) {
        res.status(400).json({ error: "Required fields missing" });
        return;
      }
      const addedMessage = await Services.addMessageToNumber(
        SMS_DST_ADDR,
        SMS_SRC_ADDR,
        SMS_Text
      );
      res.status(201).json(addedMessage);
    } catch (error) {
      console.error("Error in addMessageController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static saveEditedNUmber: RequestHandler = async (
    req: Request, res: Response
  ) => {
    try {
      const { countries, number, country_code, expiry_date, extension_date } = req.body;
      if (!countries || !number || !country_code) {
        res.status(400).json({ error: "Countries, number and country_code are required" });
        return;
      }
      const updatedNumber = await Services.saveEditedNumber(
        countries,
        number,
        country_code,
        expiry_date,
        extension_date
      );
      res.status(200).json(updatedNumber);
    } catch (error) {
      console.error("Error in saveEditedNUmber:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getNewOtpController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      let phoneNumber = req.query.number as string;
      if (phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      }
      const timestamp = req.query.since as string;
      if (!timestamp) {
        res.status(400).json({ error: "timestamp query parameter is required" });
        return;
      }
      if (!phoneNumber) {
        res.status(400).json({ error: "phoneNumber query parameter is required" });
        return;
      }
      const newOtp = await Services.getNewOtp(phoneNumber, timestamp);
      if (!newOtp) {
        res.status(404).json({ error: `No new OTP found for ${phoneNumber} after ${timestamp}` });
        return;
      }
      res.status(200).json(newOtp);
    } catch (error) {
      console.error("Error in getNewOtpController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getCarrierController: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const number = req.query.number as string;
      const country = req.query.country as string;
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      if (!number) {
        res.status(400).json({ error: "Number query parameter is required" });
        return;
      }
      const carrierInfo = await Services.getCarrierInfo(number,country);
      if (!carrierInfo) {
        res.status(404).json({ error: `No carrier information found for ${number}` });
        return;
      }
      res.status(200).json(carrierInfo);
    } catch (error) {
      console.error("Error in getCarrierController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public static getAreaCodeController: RequestHandler = async (
    req: Request, res: Response )=>{
    try {
      const country = req.query.country as string || '';
      const areaCode = req.query.area_code as string || '';
      const stateName = req.query.state_name as string || '';
      const cityName = req.query.city_name as string || '';
      const areaCodeInfo = await Services.getAreaCodeInfo(country, areaCode, stateName, cityName);
      if (!areaCodeInfo) {
        res.status(404).json({ error: `No information found for area code ${areaCode}` });
        return;
      }
      res.status(200).json(areaCodeInfo);
    } catch (error) {
      console.error("Error in getAreaCodeController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

public static getPhoneCheckerController: RequestHandler = async (
  req: Request, res: Response) => {
    try {
      const phoneNumber = req.query.number as string ;

      const country = (req.query.country as string).toUpperCase(); ;


      if (!phoneNumber) {
        res.status(400).json({ error: "Phone number query parameter is required" });
        return;
      }
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      const phoneCheckerInfo = await Services.getPhoneCheckerInfo(phoneNumber, country);
      if (!phoneCheckerInfo) {
        res.status(404).json({ error: `No information found for phone number ${phoneNumber}` });
        return;
      }
      res.status(200).json(phoneCheckerInfo);
    } catch (error) {
      console.error("Error in getPhoneCheckerController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getPhoneValidatorController: RequestHandler = async (
    req: Request, res: Response) => {
    try {
      const phoneNumber = req.query.number as string;
      const country = (req.query.country as string).toUpperCase();
      if (!phoneNumber) {
        res.status(400).json({ error: "Phone number query parameter is required" });
        return;
      }
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      const phoneValidatorInfo = await Services.getPhoneValidatorInfo(phoneNumber, country);
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
}

  public static getReverseLookupController: RequestHandler = async (
    req: Request, res: Response) => {
    try {
      const phoneNumber = req.query.number as string;
      const country = (req.query.country as string).toUpperCase();
      if (!phoneNumber) {
        res.status(400).json({ error: "Phone number query parameter is required" });
        return;
      }
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      const reverseLookupInfo = await Services.getReverseLookupInfo(phoneNumber, country);
      if (!reverseLookupInfo) {
        res.status(404).json({ error: `No information found for phone number ${phoneNumber}` });
        return;
      }
      res.status(200).json(reverseLookupInfo);
    } catch (error) {
      console.error("Error in getReverseLookupController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getSocialMediaFinderController: RequestHandler = async (
    req: Request, res: Response) => {
    try {
      const phoneNumber = req.query.phone as string;
      const country = (req.query.country as string).toUpperCase();
      if (!phoneNumber) {
        res.status(400).json({ error: "Phone number query parameter is required" });
        return;
      }
      if (!country) {
        res.status(400).json({ error: "Country query parameter is required" });
        return;
      }
      const socialMediaFinderInfo = await Services.getSocialMediaFinderInfo(phoneNumber, country);
      if (!socialMediaFinderInfo) {
        res.status(404).json({ error: `No social media information found for phone number ${phoneNumber}` });
        return;
      }
      res.status(200).json(socialMediaFinderInfo);
    } catch (error) {
      console.error("Error in getSocialMediaFinderController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getSpeechToTextController: RequestHandler = async (
    req: Request, res: Response) => {
    try {

      const audio_file = req.file;
      const model = req.body.string || '';
      if (!audio_file) {
        res.status(400).json({ error: "audio_file parameter is required" });
        return;
      }

      const speechToTextInfo = await Services.getSpeechToTextInfo(audio_file, model);

      if (!speechToTextInfo) {
        res.status(404).json({ error: `No speech to text information found for audio URL ${audio_file.originalname}` });
        return;
      }
      res.status(200).json(speechToTextInfo);
    } catch (error) {
      console.error("Error in getSpeechToTextController:");
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getTextToSpeechController: RequestHandler = async (
    req: Request, res: Response) => {
    try {
      const text = req.query.sentence as string;
      const voice = req.query.voice as string || '';
      if (!text) {
        res.status(400).json({ error: "Text query parameter is required" });
        return;
      }
      const textToSpeechInfo = await Services.getTextToSpeechInfo(text,voice);
      if (!textToSpeechInfo) {
        res.status(404).json({ error: `No text to speech information found for text ${text}` });
        return;
      }
      res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=voicemail.mp3");
    res.status(200).send(textToSpeechInfo);
    } catch (error) {
      console.error("Error in getTextToSpeechController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public static getVoicemailGeneratorController: RequestHandler = async (
    req: Request, res: Response) => {
    try {
      const sentence = req.query.sentence as string;
      const voice =  req.query.voice as string || '';
      const bgSound = req.query.bg_sound as string || '';
      if (!sentence) {
        res.status(400).json({ error: "Text query parameter is required" });
        return;
      }
      const audioBuffer = await Services.getVoicemailGeneratorInfo(sentence, voice, bgSound);
      if (!audioBuffer) {
        res.status(404).json({ error: `No voicemail generated for text ${sentence}` });
        return;
      }
        res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=voicemail.mp3");
    res.status(200).send(audioBuffer);
    } catch (error) {
      console.error("Error in getVoicemailGeneratorController:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

}
