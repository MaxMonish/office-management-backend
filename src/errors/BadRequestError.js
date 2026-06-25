const AppError = require("../middleware/AppError");

class BadRequestError extends AppError{
    constructor(message = "Bad Request"){
        super(message, 400);
        this.name = "BadRequestError";
    }
}

module.exports = BadRequestError;