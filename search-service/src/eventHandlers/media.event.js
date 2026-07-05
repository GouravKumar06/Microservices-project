const SearchPost = require("../models/SearchPost");
const logger = require("../utils/logger");


exports.handlePostCreatedEvent = async (data) => {
    try{
        console.log("Received post.deleted event:", data);

        const { postId, userId,content,createdAt } = data;

        await SearchPost.create({ 
            postId,
            userId,
            content,
            createdAt
        });

        logger.info(`Post with ID ${postId} added to search index successfully.`);
    }catch(error){
        logger.error("Error while handling post.deleted event", error);
    }
}


exports.handlePostDeletedEvent = async (data) => {
    try{
        console.log("Received post.deleted event:", data);

        const { postId } = data;

        await SearchPost.deleteOne({ postId });

        logger.info(`Post with ID ${postId} removed from search index successfully.`);

    }catch(error){
        logger.error("Error while handling post.deleted event", error);
    }

}