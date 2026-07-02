const Media = require("../models/Media");
const { uploadToCloudinary } = require("../utils/cloudinary.utils");
const logger = require("../utils/logger");


exports.uploadMedia = async(req,res) => {
    try{
        if(!req.file){
            logger.warn("No file uploaded");
            return res.status(400).json({error:"No file uploaded"});
        }

        const userId = req.user.userId;

        if(!userId){
            logger.warn("User ID not found in request");
            return res.status(400).json({error:"User ID not found in request"});
        }

        const {imageUrl, publicId, originalName, mimeType} = await uploadToCloudinary(req.file);

        //save media details to database
        const newMedia = await Media.create({
            userId,
            publicId,
            originalName,
            mimeType,
            url:imageUrl
        })

        res.status(201).json({
            succcess:true,
            message:"Media uploaded successfully",
            mediaId:newMedia._id,
            url : newMedia.url,
        });
    }catch(err){
        logger.error("Error uploading media:", err);
        res.status(500).json({error:"Internal Server Error"});
    }
}