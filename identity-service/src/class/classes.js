

class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;
    }
}

class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
    }

}


module.exports = {ApiResponse,ApiError};