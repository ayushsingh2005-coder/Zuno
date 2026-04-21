const express = require('express');
const router = express.Router();

// Controllers
const{
   sendOtp,
   verifyOtp,
   register,
   resendOtp,
   login,
   logout,
   getProfile,
   sendResetOtp,
   resetPassword,
} = require('../controllers/auth.controller');

// Middlewares

const { authMiddleware } = require("../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
  validateSendOtp,
  validateVerifyOtp,
  validateResetPassword,
} = require("../middleware/validate.middleware");

// PUBLIC ROUTES : no token required
router.post("/send-otp", validateSendOtp, sendOtp);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.post("/register", validateRegister, register);
router.post("/resend-otp", validateSendOtp, resendOtp);
router.post("/login", validateLogin, login);
router.post("/send-reset-otp", validateSendOtp, sendResetOtp);
router.post("/reset-password", validateResetPassword, resetPassword);


// PROTECTED ROUTES : token required
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logout);

module.exports = router;