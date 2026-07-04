const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const { uploadMedia,getAllMedia } = require('../controllers/media.controller');
const upload = require('../middleware/multer');

router.use(isAuthenticated)

router.post('/upload-media',upload.single('media'),uploadMedia);
router.get('/get-all-media',getAllMedia)


module.exports = router;