const AppError = require("../middleware/AppError");

class NotFoundError extends AppError{    
    constructor(message = "Resource Not Found"){
        super(message, 404);
        this.name = "NotFoundError";
    }
}

module.exports = NotFoundError;