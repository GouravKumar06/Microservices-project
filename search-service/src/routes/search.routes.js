const express = require('express');
const isAuthenticated = require('../middleware/isAuthenticated');
const { searchPostController } = require('../controllers/search.controller');
const router = express.Router();

router.use(isAuthenticated)

router.post('/search-post', searchPostController);

module.exports = router;