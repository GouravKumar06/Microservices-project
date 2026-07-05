const logger = require("../utils/logger");
const SearchPost = require("../models/SearchPost");


exports.searchPostController = async (req, res) => {
    try{
        const { query } = req.query;
        if(!query){
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const posts = await SearchPost.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(10);
        res.status(200).json(posts);

    }catch(error){
        logger.error("Error searching posts", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}