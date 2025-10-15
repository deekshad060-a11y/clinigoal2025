const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.mp4', '.mov', '.pdf', '.pptx', '.ppt', '.docx', '.jpg', '.png', '.jpeg', '.webm'];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

module.exports = multer({ storage, fileFilter });
