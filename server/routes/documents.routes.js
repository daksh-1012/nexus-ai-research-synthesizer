import { Router } from 'express';
import {
  uploadDocument,
  getDocumentById,
  deleteDocument
} from '../controllers/document.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

// All document operations require JWT authentication
router.use(authenticateJWT);

// POST /api/documents/upload (Multer middleware: single file field 'file', max 5MB, PDF/TXT)
router.post('/upload', uploadMiddleware.single('file'), uploadDocument);

// GET /api/documents/:id (Fetch document details and raw text)
router.get('/:id', getDocumentById);

// DELETE /api/documents/:id (Verify project belongs to JWT user_id and delete)
router.delete('/:id', deleteDocument);

export default router;
