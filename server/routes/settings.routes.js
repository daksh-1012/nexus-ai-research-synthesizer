import { Router } from 'express';
import { getSettings } from '../controllers/settings.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT);
router.get('/', getSettings);

export default router;
