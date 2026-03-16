const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage — we upload the buffer directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'), false);
  }
});

// Helper: upload a buffer to Cloudinary and return the result
function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:          'apes/profile-photos',
        public_id:       publicId,
        overwrite:       true,
        transformation:  [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    const streamifier = require('streamifier');
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { cloudinary, upload, uploadBuffer };
