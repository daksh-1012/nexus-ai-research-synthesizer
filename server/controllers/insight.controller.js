import { query } from '../config/db.js';

/**
 * Fetch aggregated insights for a specific research project
 * GET /api/projects/:id/insights
 * Strict User Isolation: Enforces that project belongs to req.user.id
 */
export async function getProjectInsights(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify user owns the project
    const projectCheck = await query('SELECT id, title, description FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
    if (!projectCheck.rows || projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized access.' });
    }

    const project = projectCheck.rows[0];

    // Fetch all insights belonging to documents in this project
    const result = await query(
      `SELECT i.id, i.document_id, i.category, i.content, i.confidence_score, i.citation_snippet, i.created_at,
              d.filename, d.analysis_focus, d.raw_text
       FROM insights i
       JOIN documents d ON d.id = i.document_id
       JOIN projects p ON p.id = d.project_id
       WHERE p.id = $1 AND p.user_id = $2
       ORDER BY i.created_at DESC`,
      [projectId, userId]
    );

    const insights = result.rows || [];

    // Compute category counts & metrics
    const stats = {
      total: insights.length,
      empirical: insights.filter(i => i.category === 'Empirical').length,
      methodological: insights.filter(i => i.category === 'Methodological').length,
      strategic: insights.filter(i => i.category === 'Strategic').length,
      avgConfidence: insights.length > 0
        ? Number((insights.reduce((acc, curr) => acc + Number(curr.confidence_score || 0), 0) / insights.length).toFixed(2))
        : 0
    };

    return res.json({
      project,
      stats,
      insights
    });
  } catch (err) {
    next(err);
  }
}
