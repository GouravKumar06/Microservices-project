const express = require('express');
const { createPost } = require('../controllers/post.controller');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();

router.use(isAuthenticated)

router.post('/create-post', createPost);
// router.post('/login',login);
// router.post('/refreshToken',refreshTokenController);
// router.post('/logout',logout)

module.exports = router;