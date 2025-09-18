import { Router } from 'express';
import { Controller } from "../api/controller";
import { registerInstall } from '../api/extRegisterController';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() }); // or use diskStorage

const router = Router();

// check-otp-polling
// router.get('/check-otp', Controller.getLatestOtps);

router.get('/number/api/', Controller.getAllNumbersApiController);
router.get('/number/sms', Controller.getAllSmsController);
router.get('/api/jwt', isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});// user set by isAuthenticated middleware
router.post('/auth/login',  Controller.loginController);
// router.post('/sms-webhook', Controller.handleInboundSms);
router.get('/number/', Controller.getAllNumbersWithQueryController);
router.get('/inbox/', Controller.getDetailsOfNumberController);
router.delete('/number/delete/', Controller.deleteNumberController);
router.post('/add/number', Controller.addNumberController);
router.post('/add/inbox', Controller.addMessageController);
// router.put('/update/number/', Controller.updateNumberController);
router.get('/all/number', Controller.getAllNumbersController);
router.get('/inbox/all', Controller.getDetailsOfAllInbox);
router.put('/numbers/save/', Controller.saveEditedNUmber);
router.get('/inbox/new/', Controller.getNewOtpController);
router.get('/carrier/', Controller.getCarrierController);
router.get('/areacode/', Controller.getAreaCodeController);
router.get('/phone-checker/', Controller.getPhoneCheckerController);
router.get('/phone-validator/', Controller.getPhoneValidatorController);
router.get('/reverse-lookup/', Controller.getReverseLookupController);
router.get('/social-media-finder/', Controller.getSocialMediaFinderController);
router.post("/speech-to-text", upload.single('audio_file'), Controller.getSpeechToTextController);

router.get('/text-to-speech/', Controller.getTextToSpeechController);
router.get('/voicemail-generator', Controller.getVoicemailGeneratorController);

router.post('/ext-register/', registerInstall);
export default router;