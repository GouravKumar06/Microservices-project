require('dotenv').config();
const User = require('../models/User');
const RefreshToken = require('../models/refreshToken')
const { sendSuccess,sendError } = require('../helpers/responseHelpers');
const logger = require('../utils/logger');
const { validateRegistration } = require('../utils/validation');
const { generateTokens } = require('../utils/generateToken');

exports.register = async(req,res) => {
    logger.info("Registration End Point Start...")
    
    try{
        const { error } = validateRegistration(req.body);

        if(error){
            logger.warn('validation error',error.details[0].message)

            return sendError(res,400,error.details[0].message)
        }


        const { username,email,password} = req.body

        let user = await User.findOne({
            $or:[
                {email : email},
                {username:username}
            ]
        })

        if(user){
            logger.warn('User Already exists')

            return sendError(res,400,'User Already exists')
        }

        const newUser = await User.create({
            username,
            email,
            password        
        })

        logger.warn('User Saved Successfull',newUser._id)

        const { accessToken, refreshToken } = generateTokens(user);


        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return sendSuccess(
            res,
            201,
            "User Registered Successfully",
            {
                accessToken,
                refreshToken
            }
        );

    }catch(error){
        logger.error('Registration error occured')

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; 
            const value = Object.values(error.keyValue)[0];

            logger.error("Duplicate key error")

            return sendError(
                res,
                400,
                "Duplicate Error",
                [`${field} '${value}' is already registered.`]
            );
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);

            logger.error('Validation Error')
            
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
        const { input, password } = req.body

        if(!input || !password ){
            return sendError(
                res,
                400,
                "All Fields Are Required"
            );
        }

        const findData = await User.findOne({
            $or:[
                { email : input},
                { username : input}
            ]
        })

        if(!findData){
            return sendError(
                res,
                401,
                "Invalid Credentials"
            );
        }

        const matchPassword = await bcrypt.compare(password,findData.password)

        if(!matchPassword){
            return sendError(
                res,
                401,
                "Invalid Credentials"
            );
        }

        const payload = {
            userId : findData._id,
            username : findData.username,
            role : findData.role
        }

        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn : '1d'
        })

        return sendSuccess(
            res,
            200,
            "User Login Successfully",
            { token }
        );
    }catch(error){
        console.log(error)

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