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