const AppError = require("./AppError");

class UnauthorizedError extends AppError{
    constructor(message = "Unauthorized Access"){
        super(message, 401);
        this.name = "UnauthorizedError";
    }
}

module.exports = UnauthorizedError;