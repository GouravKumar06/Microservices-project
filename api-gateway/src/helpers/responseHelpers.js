const { ApiResponse, ApiError } = require("../class/classes");

exports.sendSuccess = (res, statusCode, message, data = null) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, message, data));
};

exports.sendError = (res, statusCode, message, errors = []) => {
    return res
        .status(statusCode)
        .json(new ApiError(statusCode, message, errors));
};