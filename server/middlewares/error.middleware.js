import multer from 'multer';

export function errorHandler(err, req, res, next) {
  console.error('[Unhandled Error]', err);

  // Multer File Size Limit Error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large: Maximum allowed file size is 5MB.'
      });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  // Custom File Type Filter Error
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  // Database unique key error (PostgreSQL 23505)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A duplicate record already exists in the database.' });
  }

  // General server error
  const status = err.status || 500;
  return res.status(status).json({
    error: err.message || 'An unexpected internal server error occurred.'
  });
}
