// Backend/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
// ensure uploads folder exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const upload = multer({ storage });

// helpers to use in routes
function uploadFields(fields) {
  return upload.fields(fields);
}
function uploadSingle(fieldName) {
  return upload.single(fieldName);
}

module.exports = { upload, uploadFields, uploadSingle };
