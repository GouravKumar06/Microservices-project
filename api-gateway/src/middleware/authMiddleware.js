const { sendError } = require("../helpers/responseHelpers");
const logger = require("../utils/logger");
const jwt = require('jsonwebtoken')

const isAuthenticated = async(req,res,next) => {
    try{
        const authHeader = req.headers['authorization'];

        const token = authHeader?.split(" ")[1];

        logger.warn("Unauthorized access from API gateway")

        if(!token){
            return res.status(400).json({
                success:false,
                messsage: "unauthorized access"
            })
        }

        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        req.user = decoded

        next()
    }catch(error){
        logger.error("Unauthorized access from API gateway",error)

        return sendError(
            res,
            500,
            "Authentication Failed"
        );
    };

    
}

module.exports = isAuthenticated;