import { query } from '../config/db.js';

/**
 * List all projects belonging to the authenticated user
 * GET /api/projects
 * Strict User Isolation Enforced: Only returns projects where user_id = req.user.id
 */
export async function getProjects(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT p.id, p.user_id, p.title, p.description, p.created_at, p.updated_at,
              COALESCE(COUNT(DISTINCT d.id), 0)::INT AS document_count,
              COALESCE(COUNT(DISTINCT i.id), 0)::INT AS insight_count
       FROM projects p
       LEFT JOIN documents d ON d.project_id = p.id
       LEFT JOIN insights i ON i.document_id = d.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.json({ projects: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new research project
 * POST /api/projects
 */
export async function createProject(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    const result = await query(
      `INSERT INTO projects (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, title, description, created_at, updated_at`,
      [userId, title, description || '']
    );

    const project = result.rows[0];
    return res.status(201).json({
      message: 'Project created successfully',
      project: {
        ...project,
        document_count: 0,
        insight_count: 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get project by ID with its documents and insight counts
 * GET /api/projects/:id
 * Strict User Isolation: Verifies project belongs to req.user.id
 */
export async function getProjectById(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const projectResult = await query(
      `SELECT p.*,
              COALESCE(COUNT(DISTINCT d.id), 0)::INT AS document_count,
              COALESCE(COUNT(DISTINCT i.id), 0)::INT AS insight_count
       FROM projects p
       LEFT JOIN documents d ON d.project_id = p.id
       LEFT JOIN insights i ON i.document_id = d.id
       WHERE p.id = $1 AND p.user_id = $2
       GROUP BY p.id`,
      [projectId, userId]
    );

    if (!projectResult.rows || projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    const project = projectResult.rows[0];

    // Get documents for this project
    const docResult = await query(
      `SELECT d.id, d.project_id, d.filename, d.file_size, d.mime_type, d.analysis_focus, d.created_at,
              COALESCE(COUNT(i.id), 0)::INT AS insights_count
       FROM documents d
       LEFT JOIN insights i ON i.document_id = d.id
       WHERE d.project_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [projectId]
    );

    return res.json({
      project,
      documents: docResult.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a project and all associated documents & insights
 * DELETE /api/projects/:id
 */
export async function deleteProject(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify ownership first
    const check = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
    if (!check.rows || check.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied.' });
    }

    await query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);

    return res.json({ message: 'Project and all related data deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
