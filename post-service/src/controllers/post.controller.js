const redis = require('../database/redis');
const Post = require('../models/Post');
const logger = require('../utils/logger')


async function invalidateCache(){
    const keys = await redis.keys("posts:*")

    if(keys.length > 0){
        await redis.del(keys)
    }
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
            res.status(200).json({
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

        res.status(200).json({
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

    }catch(error){
        logger.error("Error while get each post", error)

        res.status(500).json({
            success:false,
            message:"Error while get each post"
        })
    }
}



exports.deletePost = async(req,res) => {
    try{

    }catch(error){
        logger.error("Error while deleting post", error)

        res.status(500).json({
            success:false,
            message:"Error while deleting  post"
        })
    }
}



exports.updatePost = async(req,res) => {
    try{

    }catch(error){
        logger.error("Error while updating post", error)

        res.status(500).json({
            success:false,
            message:"Error while updating  post"
        })
    }
}