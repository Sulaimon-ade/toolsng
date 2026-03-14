import multer from 'multer';
import path from 'path';

// Configure multer to store files in memory for processing
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'text/csv';

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images, PDFs, and CSVs are allowed'));
  },
});
