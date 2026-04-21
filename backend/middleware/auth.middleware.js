const jwt = require("jsonwebtoken");
const redis = require("../config/redis");
const userService = require("../services/user.service");
const {errorResponse} = require("../utils/apiResponse");

module.exports.authMiddleware = async (req,res,next) =>{
    try{
        // 1. Get token from header
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return errorResponse(res, "Access denied.No token provided" , 401);
        }

        // token is blacklisted(user logout or password changed)
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if(isBlacklisted){
            return errorResponse(res, "Token expired. Please login again" , 401);
        }

        // Token validation
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return errorResponse(res, "Invalid token" , 401);
        }

        // User existence check
        const user = await userService.findUserById(decoded._id);
        if(!user){
            return errorResponse(res, "User not found" , 404);
        }

        req.user = user;
        next();

    } catch(error){
        if(error.name === "JsonWebTokenError"){
            return errorResponse(res, "Invalid token" , 401);
        }
        // token expired
        if(error.name === "TokenEexpiredError"){
            return errorResponse(res, "Token expired.Please login again" , 401);
        }

        console.error("Auth middleware error:", error.message);
    return errorResponse(res, "Internal server error", 500);
    }
}