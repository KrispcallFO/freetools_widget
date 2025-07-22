"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../api/controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/number/api/', controller_1.Controller.getAllNumbersApiController);
router.get('/number/sms', controller_1.Controller.getAllSmsController);
router.get('/api/jwt', auth_1.isAuthenticated, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
}); // user set by isAuthenticated middleware
router.post('/auth/login', controller_1.Controller.loginController);
router.post('/sms-webhook', controller_1.Controller.handleInboundSms);
router.get('/number/', controller_1.Controller.getAllNumbersWithQueryController);
router.get('/inbox/', controller_1.Controller.getDetailsOfNumberController);
router.delete('/number/delete/', controller_1.Controller.deleteNumberController);
router.post('/add/number', controller_1.Controller.addNumberController);
router.post('/add/inbox', controller_1.Controller.addMessageController);
exports.default = router;
