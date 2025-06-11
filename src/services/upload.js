const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path'); // Importing path module

// Load environment variables
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "jasznco_uploads",
        format: async () => "png", 
        public_id: (req, file) => {
            const fileBaseName = path.basename(file.originalname, path.extname(file.originalname));
            return Date.now() + "-" + fileBaseName; // Append timestamp and base name without extension
        },
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
