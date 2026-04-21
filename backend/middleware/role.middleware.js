const {errorResponse} = require("../utils/apiResponse");

module.exports.roleMiddleware = (...roles) =>{
    return (req,res,next) =>{

        if(!req.user){
            return errorResponse(res, "Access denied. Please login first" ,401);
        }

        if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Only ${roles.join(", ")} allowed`,
        403
      );
    }   
    next();
    };
};