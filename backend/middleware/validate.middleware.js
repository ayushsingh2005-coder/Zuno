const {body , validationResult} = require('express-validator');
const {errorResponse} = require("../utils/apiResponse");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, errors.array()[0].msg, 400);
  }
  next();
};

// REGISTER validation

module.exports.validateRegister = [
  body("firstname")
    .trim()
    .isLength({ min: 3 })
    .withMessage("First name must be atleast 3 characters"),

  body("lastname")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Last name must be atleast 3 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters"),

  validate, 
];

// LOGIN validation
// ─────────────────────────────────────────
module.exports.validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  validate,
];

// ─────────────────────────────────────────
// SEND OTP validation
// ─────────────────────────────────────────
module.exports.validateSendOtp = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  validate,
];

// ─────────────────────────────────────────
// VERIFY OTP validation
// ─────────────────────────────────────────
module.exports.validateVerifyOtp = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),

  validate,
];

// ─────────────────────────────────────────
// RESET PASSWORD validation
// ─────────────────────────────────────────
module.exports.validateResetPassword = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters"),

  validate,
];


