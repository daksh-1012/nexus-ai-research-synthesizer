import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  deleteProject
} from '../controllers/project.controller.js';
import { getProjectInsights } from '../controllers/insight.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validateBody, projectSchema } from '../middlewares/validation.middleware.js';

const router = Router();

// All project routes require valid JWT authentication
router.use(authenticateJWT);

// GET /api/projects (List user projects - isolated by user_id)
router.get('/', getProjects);

// POST /api/projects (Create project - validated with Zod)
router.post('/', validateBody(projectSchema), createProject);

// GET /api/projects/:id (Get project details and documents)
router.get('/:id', getProjectById);

// DELETE /api/projects/:id (Delete project)
router.delete('/:id', deleteProject);

// GET /api/projects/:id/insights (Fetch aggregated insights)
router.get('/:id/insights', getProjectInsights);

export default router;
