require('dotenv').config();
const User = require('../models/User');
const RefreshToken = require('../models/refreshToken')
const { sendSuccess,sendError } = require('../helpers/responseHelpers');
const logger = require('../utils/logger');
const { validateRegistration, validateLogin } = require('../utils/validation');
const { generateTokens } = require('../utils/generateToken');

exports.register = async(req,res) => {
    logger.info("Registration End Point Start...")
    
    try{
        const { error } = validateRegistration(req.body);

        if(error){
            logger.warn({
                message: "Validation Error",
                error: error.details[0].message
            });

            console.log(error.details[0].message, "validation error")

            return sendError(
                res,
                400,
                "Validation Error",
                error
            );
        }


        const { username,email,password} = req.body

        let user = await User.findOne({
            $or:[
                {email : email},
                {username:username}
            ]
        })

        if(user){
            logger.warn({
                message: "User Already Exists",
                email,
                username
            });

            return sendError(res,400,'User Already exists',[
                {
                    field: "email/username",
                    message: "Email or Username already exists"
                }
            ])
        }

        const newUser = await User.create({
            username,
            email,
            password        
        })

        logger.info({
            message: "User Registered Successfully",
            userId: newUser._id.toString(),
            username: newUser.username,
            email: newUser.email
        });

        // const { accessToken, refreshToken } = generateTokens(newUser);


        // await RefreshToken.create({
        //     token: refreshToken,
        //     user: newUser._id,
        //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        // });

        return sendSuccess(
            res,
            201,
            "User Registered Successfully",
            // {
            //     accessToken,
            //     refreshToken
            // }
        );

    }catch(error){
        console.log("error occurred",error)

        logger.error({
            message: "Registration Failed",
            error: error.message,
            stack: error.stack
        });

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; 
            const value = Object.values(error.keyValue)[0];

            logger.error({
                message: "Duplicate Key Error",
                field: field,
                value: value
            });

            return sendError(
                res,
                409,
                "Duplicate Error",
                [
                    {
                        field,
                        message: `${value} is already registered`
                    }
                ]
            );
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            logger.warn({
                message: "Mongoose Validation Error",
                errors: messages
            });

            return sendError(
                res,
                400,
                "Validation Error",
                messages
            );
        }

        return sendError(
            res,
            500,
            "Internal Server Error"
        );
    }
}


exports.login = async(req,res) => {
    try{
        
        console.log("login hit", req.body)

        const { error } = validateLogin(req.body);

        if(error){
            logger.warn({
                message: "Validation Error",
                error: error.details[0].message
            });

            console.log(error.details[0].message, "validation error")

            return sendError(
                res,
                400,
                "Validation Error",
                error
            );
        }


        const { email, password } = req.body

        if(!email || !password ){
            
            logger.warn("All Fields are required");

            return sendError(
                res,
                400,
                "All Fields Are Required"
            );
        }

        const user = await User.findOne({ email })

        if(!user){
            
            logger.warn("Invalid Credentials");

            return sendError(
                res,
                401,
                "Invalid Credentials"
            );
        }

        const isValidPassword = await user.comparePassword(password)

        if(!isValidPassword){
            
            logger.warn("Invalid Credentials");

            return sendError(
                res,
                401,
                "Invalid Credentials"
            );
        }

        const {accessToken,refreshToken} = await generateTokens(user)



        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return sendSuccess(
            res,
            201,
            "User Login Successfully",
            {
                accessToken,
                refreshToken
            }
        );
    }catch(error){
        console.log(error)

        logger.error("Login Error Occured",error)

        return sendError(
            res,
            500,
            "Internal Server Error"
        );
    }
}


exports.refreshTokenController = async(req,res) => {
    try{
        const {refreshToken} = req.body

        if(!refreshToken){
            logger.warn("Refresh token  Missing");

            return sendError(
                res,
                401,
                "Refresh token  Missing"
            );
        }

        const token = await RefreshToken.findOne({token:refreshToken})

        if(!token || new Date() > token.expiresAt){
            logger.warn("InValid Token");

            return sendError(
                res,
                401,
                "InValid Refresh token"
            );
        }

        const user = await User.findById(token.user)

        if(!user){
            logger.warn("User not found");

            return sendError(
                res,
                401,
                "User not found"
            );
        }


        const {accessToken: newAccessToken,refreshToken : newRefreshToken} = await generateTokens(user)

        //delete the old token 
        await RefreshToken.deleteOne({_id: token._id})

        return sendSuccess(
            res,
            201,
            "new Tokens Available",
            {
                accessToken : newAccessToken,
                refreshToken : newRefreshToken
            }
        );
         

    }catch(error){
        console.log(error)

        logger.error("Refresh Token Error Occured",error)

        return sendError(
            res,
            500,
            "Internal Server Error"
        );
    }
}


exports.logout = async(req,res) => {
    try{
        const {refreshToken} = req.body

        if(!refreshToken){
            logger.warn("Refresh token  Missing");

            return sendError(
                res,
                401,
                "Refresh token  Missing"
            );
        }

        const token = await RefreshToken.findOne({token:refreshToken})

        if(!token || new Date() > token.expiresAt){
            logger.warn("InValid Token");

            return sendError(
                res,
                401,
                "InValid Refresh token"
            );
        }

        await RefreshToken.deleteOne({token})

        logger.info("refresh token deleted successfully")

        return sendSuccess(
            res,
            200,
            "Logout Successfully",
        );
    }catch(error){
        console.log(error)

        logger.error("Logout Error Occured",error)

        return sendError(
            res,
            500,
            "Internal Server Error"
        );
    }
}


exports.changePassowrd = async(req,res) => {
    try{
        const userId = req.userInfo.userId
        const user = await User.findById(userId)

        if (!user) {
            return sendError(
                res,
                404,
                "User not found or account has been deleted."
            );
        }

        const { oldPassword,newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both old password and new password are required."
            });
        }

        if (oldPassword === newPassword) {
            return sendError(
                res,
                400,
                "Both old password and new password are required."
            );
        }

        const isMatch = await bcrypt.compare(oldPassword,user.password)

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message : "The old password you entered is incorrect."
            })
        }

        user.password = newPassword;

        const ValidationError = user.validateSync();

        if(ValidationError && validationError.errors.password){
            return sendError(
                res,
                400,
                "Validation Error",
                [validationError.errors.password.message]
            );
        }

        await user.save();

        return sendSuccess(
            res,
            200,
            "password changed Successfully",
        );
    }catch(error){
        console.log(error.message)

        return sendError(
            res,
            500,
            "Internal Server Error"
        );
    }
}