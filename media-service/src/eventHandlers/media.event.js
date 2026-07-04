const Media = require("../models/Media");
const { deleteFromCloudinary } = require("../utils/cloudinary.utils");
const logger = require("../utils/logger");


exports.handlePostDeletedEvent = async (data) => {
    try{
        console.log("Received post.deleted event:", data);

        const { postId, mediaIds } = data;

        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

        for (const media of mediaToDelete) {
            await deleteFromCloudinary(media.publicId);
            await Media.deleteOne({ _id: media._id });
            logger.info(`Media deleted successfully: ${media._id}`);
        }

        logger.info(`All media associated with post ${postId} deleted successfully`);
    }catch(error){
        logger.error("Error while handling post.deleted event", error);
    }
}