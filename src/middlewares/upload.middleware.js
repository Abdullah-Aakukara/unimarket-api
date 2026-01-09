const multer = require('multer');
const path = require('path');
const fs = require('fs');

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Adjust path to go up to root/public/uploads
        const uploadPath = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: diskStorage });

module.exports = upload;