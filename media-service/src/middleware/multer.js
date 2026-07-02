const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'], // Allowed file types
    fileFilter: (req, file, cb) => {
        if (this.allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

module.exports = upload;