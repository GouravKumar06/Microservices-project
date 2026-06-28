const express = require('express');
const router = express.Router();
const { register } = require('../controllers/user.controller');
const { createRateLimiter } = require('../middleware/rateLimiter');

router.use( createRateLimiter(10, 60 * 1000) ); // 10 requests per minute

router.post('/register', register);

module.exports = router;