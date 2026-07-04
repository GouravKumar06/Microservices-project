const redis = require('../database/redis');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const { publishEvent } = require('../utils/rabbitmq');


async function invalidateCache(){
    const keys = await redis.keys("posts:*")

    if(keys.length > 0){
        await redis.del(keys)
    }
}

async function invalidatePostCache(postId) {
    await redis.del(`post:${postId}`);
}


exports.createPost = async(req,res) => {
    try{
        const { content, mediaIds} = req.body;

        const newCreatedPost = await Post.create({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || []
        })

        logger.info("POST created Successfully")

        await invalidateCache()

        return res.status(201).json({
            success:true,
            message:"POST created Successfully"
        })


    }catch(error){
        logger.error("Error creating post", error)

        res.status(500).json({
            success:false,
            message:"Error creating post"
        })
    }
}


exports.getAllPosts = async(req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const startIndex = (page - 1) * limit;

        const cachedKey = `posts:${page}:${limit}`;

        const cachedPosts = await redis.get(cachedKey);

        if(cachedPosts){
            return res.status(200).json({
                success:true,
                message:"Geting All post From REDIS ",
                data : JSON.parse(cachedPosts)
            })
        }

        const posts = await Post.find({}).sort({ createdAt : -1 }).skip(startIndex).limit(limit)

        const totalPosts = await Post.countDocuments();


        const result = {
            posts,
            currentPage:page,
            totalPages:Math.ceil(totalPosts/limit),
            totalPosts:totalPosts
        }

        // save your posts in redis 
        await redis.setex(cachedKey,300,JSON.stringify(result))

        return res.status(200).json({
            success:true,
            message:"Geting All post From MongoDB Database ",
            result
        })

    }catch(error){
        logger.error("Error while geting All post", error)

        res.status(500).json({
            success:false,
            message:"Error while geting All post"
        })
    }
}


exports.getPost = async(req,res) => {
    try{

        const postId = req.params.id;

        const cachedKey = `post:${postId}`;

        const cachedPost = await redis.get(cachedKey);

        if(cachedPost){
            return res.status(200).json({
                success:true,
                message:"Geting post From REDIS ",
                data : JSON.parse(cachedPost)
            })
        }

        //data fetchong from the mongodb database
        const post = await Post.findById(postId)

        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }

        //save the Post in the redis database
        await redis.setex(cachedKey,3600,JSON.stringify(post))

        return res.status(200).json({
            success:true,
            message:"Geting post From MongoDB Database ",
            post
        })

    }catch(error){
        logger.error("Error while get each post", error)

        res.status(500).json({
            success:false,
            message:"Error while get each post"
        })
    }
}


exports.updatePost = async (req, res) => {
    try {

        const { id } = req.params;
        const { content, mediaIds } = req.body;

        const post = await Post.findOne({
            _id: id,
            user: req.user.userId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you are not authorized to update this post"
            });
        }

        if (content !== undefined) {
            post.content = content;
        }

        if (mediaIds !== undefined) {
            post.mediaIds = mediaIds;
        }

        await post.save();

        // Invalidate Cache
        await invalidatePostCache(id);
        await invalidateCache();

        logger.info("Post updated successfully");

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post
        });

    } catch (error) {

        logger.error("Error while updating post", error);

        return res.status(500).json({
            success: false,
            message: "Error while updating post"
        });

    }
};



exports.deletePost = async (req, res) => {
    try {

        const { id } = req.params;

        const post = await Post.findOneAndDelete({
            _id: id,
            user: req.user.userId
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found or you are not authorized to delete this post"
            });
        }

        //publish the post deleted event to RabbitMQ
        await publishEvent("deleted", { 
            postId: id, 
            userId: req.user.userId,
            mediaIds: post.mediaIds 
        });

        // Invalidate Cache
        await invalidatePostCache(id);
        await invalidateCache();

        logger.info("Post deleted successfully");

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {

        logger.error("Error while deleting post", error);

        return res.status(500).json({
            success: false,
            message: "Error while deleting post"
        });

    }
};
