const userService = require("../services/user.service.js");
const sendEmail = require("../utils/sendEmail.js");
const generateOtp = require("../utils/generateOtp.js");
const redis = require("../config/redis.js");
const {successResponse , errorResponse} = require("../utils/apiResponse.js");
const {validationResult} = require("express-validator");

//SEND OTP TO EMAIL
module.exports.sendOtp = async(req,res) =>{
    try{
        const {email} = req.body;

        if(!email){
            return errorResponse(res,"Email is required" , 400);
        }

        // email already exists
        const existingUser = await userService.findByEmail(email);
        
        if(existingUser){
            return errorResponse(res,"Email already exists" , 409);
        }

        // Otp generation
        const otp = generateOtp();
        // Store otp in redis with expiry time of 5 mins
        await redis.setex(
            `otp:signup:${email}`,
            300,
            JSON.stringify({otp , verified : false})
        );

        // email sending

        await sendEmail({
            to:email,
            subject  : "Zuno - Signup OTP",
            html : `
              <h2>Welcome to Zuno! 🎵</h2>
              <p>Your OTP is <b>${otp}</b></p>
              <p>Valid for 5 minutes.</p>
            `,
        });

        return successResponse(res,"OTP sent successfully to email" ,{email} , 200);
    } catch(error){
        console.error("Send OTP Error :" , error.message);
        return errorResponse(res, "Internal Server error" , 500);
    }
};

// VERIFY OTP

module.exports.verifyOtp = async(req,res)=>{
    try{
        const {email , otp} = req.body;

        if(!email || !otp){
            return errorResponse(res , "Email and OTP are required" , 400);
        }

        const data = await redis.get(`otp:signup:${email}`);

        if(!data){
            return errorResponse(res,"OTP expired or invalid" , 400);
        }

        const {otp : savedOtp , verified} = JSON.parse(data);

        if(savedOtp !== otp){
            return errorResponse(res,"Invalid OTP" , 400);
        }

        // mark otp as verified in redis 
        await redix.setex(
            `otp:signup:${email}`,
            300,
            JSON.stringify({otp : savedOtp , verified : true})
        );

        return successResponse(res,"OTP verified successfully" , {email} , 200);

    } catch(error){
        console.error("Verify OTP Error :" , error.message);
        return errorResponse(res, "Internal Server error" , 500);
    }
}
 

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
module.exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, errors.array()[0].msg, 400);
    }

    const { firstname, lastname, email, password } = req.body;

    // Email already exists?
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, "User already exists", 409);
    }

    // Redis mein verified check karo
    const data = await redis.get(`otp:signup:${email}`);
    if (!data) {
      return errorResponse(res, "OTP expired. Please request again", 400);
    }

    const { verified } = JSON.parse(data);
    if (!verified) {
      return errorResponse(res, "OTP not verified", 400);
    }

    // Password hash karo
    const hashedPassword = await require("../models/user.model").hashPassword(password);

    // MongoDB mein save karo
    const user = await userService.createUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    // isVerified true karo
    await userService.verifyUser(email);

    // Redis se OTP delete karo
    await redis.del(`otp:signup:${email}`);

    // Token generate karo
    const token = user.generateAuthToken();

    return successResponse(res, "User registered successfully", {
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error("Register error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────
module.exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    // Pehle se OTP request hai?
    const exists = await redis.get(`otp:signup:${email}`);
    if (!exists) {
      return errorResponse(res, "No OTP request found. Please request OTP first", 400);
    }

    // Naya OTP banao
    const otp = generateOtp();

    // Redis update karo
    await redis.setex(
      `otp:signup:${email}`,
      300,
      JSON.stringify({ otp, verified: false })
    );

    // Email bhejo
    await sendEmail({
      to: email,
      subject: "Zuno - Resend OTP",
      html: `
        <h2>Zuno OTP 🎵</h2>
        <p>Your new OTP is <b>${otp}</b></p>
        <p>Valid for 5 minutes.</p>
      `,
    });

    return successResponse(res, "OTP resent successfully", { email });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
module.exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    // User dhundo — password bhi lo (select: false hai schema mein)
    const user = await require("../models/user.model")
      .findOne({ email })
      .select("+password");

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Verified hai?
    if (!user.isVerified) {
      return errorResponse(res, "Please verify your email first", 401);
    }

    // Password compare karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Token do
    const token = user.generateAuthToken();

    return successResponse(res, "Login successful", {
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
module.exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return errorResponse(res, "No token found", 400);
    }

    // Token Redis blacklist mein daal do (24h = JWT ki life)
    await redis.setex(`blacklist:${token}`, 86400, "true");

    return successResponse(res, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
module.exports.getProfile = async (req, res) => {
  try {
    // req.user auth middleware se aayega
    return successResponse(res, "Profile fetched successfully", {
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// SEND RESET OTP
// ─────────────────────────────────────────
module.exports.sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    // User exists?
    const user = await userService.findByEmail(email);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // OTP generate karo
    const otp = generateOtp();

    // Redis mein save karo (15 min = 900 seconds)
    await redis.setex(`otp:reset:${email}`, 900, otp);

    // Email bhejo
    await sendEmail({
      to: email,
      subject: "Zuno - Reset Password OTP",
      html: `
        <h2>Zuno Password Reset 🎵</h2>
        <p>Your OTP is <b>${otp}</b></p>
        <p>Valid for 15 minutes.</p>
      `,
    });

    return successResponse(res, "Reset OTP sent successfully", { email });
  } catch (error) {
    console.error("Send reset OTP error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};

// ─────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────
module.exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, "Email, OTP and new password are required", 400);
    }

    // Redis se OTP lo
    const savedOtp = await redis.get(`otp:reset:${email}`);
    if (!savedOtp) {
      return errorResponse(res, "OTP expired or not requested", 400);
    }

    // OTP match karo
    if (savedOtp !== otp) {
      return errorResponse(res, "Invalid OTP", 400);
    }

    // Naya password hash karo
    const hashedPassword = await require("../models/user.model").hashPassword(newPassword);

    // Password update karo
    await userService.updateProfile(
      (await userService.findByEmail(email))._id,
      { password: hashedPassword }
    );

    // Redis se OTP delete karo
    await redis.del(`otp:reset:${email}`);

    return successResponse(res, "Password reset successfully");
  } catch (error) {
    console.error("Reset password error:", error.message);
    return errorResponse(res, "Internal server error", 500);
  }
};