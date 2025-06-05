const express = require('express');
const { login, register, getUser, sendOTP, verifyOTP, changePassword,updateProfile } = require('@controllers/authController');
const { contactUs, getContactUs } = require('@controllers/contactUs');
const { authenticate } = require('@middlewares/authMiddleware');
const user = require('@controllers/user');


const router = express.Router();
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/profile', authenticate, getUser);
router.post("/auth/sendOTP", sendOTP);
router.post("/auth/updateProfile", updateProfile);
router.post("/auth/verifyOTP", verifyOTP);
router.post("/auth/changePassword", changePassword);

router.post("/contactUs", contactUs);
router.get("/getContactUs", getContactUs)

router.post("/add-subscriber", user.addNewsLetter);
router.get("/get-subscriber", user.getNewsLetter);
router.post("/del-subscriber", user.DeleteNewsLetter);

module.exports = router;
