const AppError = require("./AppError");

const roleMiddleware = (allowedRoles) => {
    if(!Array.isArray(allowedRoles)){
        throw new Error("allowedRoles must be an array");
    }
    
    return(req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){
            return next(new AppError("Access Denied! - You are not authorized to view this page", 403));
        }
        next();
    };
};

module.exports = roleMiddleware;