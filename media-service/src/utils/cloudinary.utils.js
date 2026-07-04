const cloudinary = require("../config/cloudinary");
const streamifier = require('streamifier');
const logger = require("./logger");

exports.uploadToCloudinary = (file) => {
    return new Promise((resolve,reject)=>{

        const stream = cloudinary.uploader.upload_stream(
            {
                folder:"MediaService",
                timeout: 60000
            },
            (error,result)=>{
                if(error) {
                    logger.error("Error uploading to Cloudinary:", error);
                    return reject(error);
                }
                resolve({
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                    originalName: file.originalname,
                    mimeType: file.mimetype
                });
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
}


exports.deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        logger.info(`Media deleted from Cloudinary: ${publicId}`, result);

        return result;
    }catch(err){
        logger.error("Error deleting from Cloudinary:", err);
        throw err;
    }
}