const Post = require('../models/Post');
const logger = require('../utils/logger')


exports.createPost = async(req,res) => {
    try{
        const { content, mediaIds} = req.body;

        const newCreatedPost = await Post.create({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || []
        })

        logger.info("POST created Successfully")

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