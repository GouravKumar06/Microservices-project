const express = require('express');
const router = express.Router();
const { register, login, refreshTokenController, logout } = require('../controllers/user.controller');
const { createRateLimiter } = require('../middleware/rateLimiter');

router.use( createRateLimiter(10, 60 * 1000) ); // 10 requests per minute

router.post('/register', register);
router.post('/login',login);
router.post('/refreshToken',refreshTokenController);
router.post('/logout',logout)

module.exports = router;