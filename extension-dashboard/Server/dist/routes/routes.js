"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../api/controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// check-otp-polling
// router.get('/check-otp', Controller.getLatestOtps);
router.get('/number/api/', controller_1.Controller.getAllNumbersApiController);
router.get('/number/sms', controller_1.Controller.getAllSmsController);
router.get('/api/jwt', auth_1.isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
}); // user set by isAuthenticated middleware
router.post('/auth/login', controller_1.Controller.loginController);
// router.post('/sms-webhook', Controller.handleInboundSms);
router.get('/number/', controller_1.Controller.getAllNumbersWithQueryController);
router.get('/inbox/', controller_1.Controller.getDetailsOfNumberController);
router.delete('/number/delete/', controller_1.Controller.deleteNumberController);
router.post('/add/number', controller_1.Controller.addNumberController);
router.post('/add/inbox', controller_1.Controller.addMessageController);
// router.put('/update/number/', Controller.updateNumberController);
router.get('/all/number', controller_1.Controller.getAllNumbersController);
router.get('/inbox/all', controller_1.Controller.getDetailsOfAllInbox);
router.put('/numbers/save/', controller_1.Controller.saveEditedNUmber);
router.get('/inbox/new/', controller_1.Controller.getNewOtpController);
router.get('/carrier/', controller_1.Controller.getCarrierController);
router.get('/areacode/', controller_1.Controller.getAreaCodeController);
router.get('/phone-checker/', controller_1.Controller.getPhoneCheckerController);
router.get('/phone-validator/', controller_1.Controller.getPhoneValidatorController);
router.get('/reverse-lookup/', controller_1.Controller.getReverseLookupController);
router.get('/social-media-finder/', controller_1.Controller.getSocialMediaFinderController);
router.post('/speech-to-text/', controller_1.Controller.getSpeechToTextController);
router.get('/text-to-speech/', controller_1.Controller.getTextToSpeechController);
router.get('voicemail-generator', controller_1.Controller.getVoicemailGeneratorController);
exports.default = router;
