const express = require('express');
const { createPost, getAllPosts, getPost, updatePost, deletePost } = require('../controllers/post.controller');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.use(isAuthenticated)

router.post('/create-post', createPost);
router.get('/get-All-posts',getAllPosts);
router.get('/get-post/:id',getPost);
router.put("/update-post/:id",updatePost);
router.delete("/delete-post/:id", deletePost);

module.exports = router;