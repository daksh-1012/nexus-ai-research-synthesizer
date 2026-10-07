import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validateBody, authSchema } from '../middlewares/validation.middleware.js';

const router = Router();

// POST /api/auth/register (Validate with Zod, hash with bcrypt, return JWT)
router.post('/register', validateBody(authSchema), register);

// POST /api/auth/login (Verify bcrypt, return JWT)
router.post('/login', login);

// GET /api/auth/me (Protected route)
router.get('/me', authenticateJWT, getMe);

export default router;
