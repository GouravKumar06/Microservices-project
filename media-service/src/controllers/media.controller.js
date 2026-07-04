const Media = require("../models/Media");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary.utils");
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


exports.getAllMedia = async(req,res) => {
    try{
        const userId = req.user.userId;

        //apply pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if(!userId){
            logger.warn("User ID not found in request");
            return res.status(400).json({error:"User ID not found in request"});
        }

        const mediaList = await Media.find({userId}).sort({createdAt:-1}).skip(skip).limit(limit);

        const totalMediaCount = await Media.countDocuments({userId});

        const totalPages = Math.ceil(totalMediaCount / limit);

        res.status(200).json({
            success:true,
            message:"Media fetched successfully",
            pagination:{
                currentPage:page,
                totalPages:totalPages,
                totalMediaCount:totalMediaCount,
                media:mediaList
            }
        });
    }catch(err){
        logger.error("Error fetching media:", err);
        res.status(500).json({error:"Internal Server Error"});
    }
}



exports.deleteMedia = async(req,res) => {
    try{
        const {mediaId} = req.params;

        if(!mediaId){
            logger.warn("Media ID not provided");
            return res.status(400).json({error:"Media ID not provided"});
        }

        const media = await Media.findById(mediaId);

        if(!media){
            logger.warn("Media not found");
            return res.status(404).json({error:"Media not found"});
        }

        // Check if the user is the owner of the media
        if(media.userId.toString() !== req.user.userId){
            logger.warn("Unauthorized attempt to delete media");
            return res.status(403).json({error:"You are not authorized to delete this media"});
        }

        // Delete media from Cloudinary
        await deleteFromCloudinary(media.publicId);

    }catch(err){
        logger.error("Error deleting media:", err);
        res.status(500).json({error:"Internal Server Error"});
    }
}