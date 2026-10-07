import multer from 'multer';
import path from 'path';

// Use memory storage to process files directly in memory
const storage = multer.memoryStorage();

// Sanitize filename helper: removes illegal chars, path traversal, preserves base name
export function sanitizeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 100);
  return `${base || 'document'}_${Date.now()}${ext}`;
}

// File filter: accept only PDF and text/plain
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'text/plain'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.txt'];

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF (.pdf) and plain text (.txt) files are permitted.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Megabytes maximum
  },
  fileFilter
});
