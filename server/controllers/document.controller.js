import { query } from '../config/db.js';
import { sanitizeFilename } from '../middlewares/upload.middleware.js';
import { parseDocumentText } from '../services/parser.service.js';
import { synthesizeDocumentInsights } from '../services/gemini.service.js';

/**
 * Upload document, extract raw text, synthesize AI insights, and save to Supabase
 * POST /api/documents/upload
 */
export async function uploadDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const { projectId, analysisFocus = 'Summary' } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No document file provided. Please attach a PDF or TXT file.' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Missing target Project ID.' });
    }

    // 1. Verify that the target project belongs to the authenticated user
    const projectCheck = await query('SELECT id, title FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
    if (!projectCheck.rows || projectCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: Target project does not exist or belongs to another user.' });
    }

    // 2. Sanitize filename
    const safeFilename = sanitizeFilename(file.originalname);

    // 3. Parse raw text from file buffer (PDF or TXT)
    console.log(`[Upload] Processing "${file.originalname}" (${file.size} bytes) for project ${projectId}...`);
    const rawText = await parseDocumentText(file.buffer, file.mimetype, file.originalname);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'The uploaded document contains no readable text.' });
    }

    // 4. Save document record to Database
    const docResult = await query(
      `INSERT INTO documents (project_id, filename, raw_text, file_size, mime_type, analysis_focus)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, project_id, filename, file_size, mime_type, analysis_focus, created_at`,
      [projectId, safeFilename, rawText, file.size, file.mimetype, analysisFocus]
    );

    const savedDoc = docResult.rows[0];

    // 5. Trigger AI Synthesis Pipeline with Google Gemini
    console.log(`[Upload] Sending parsed text (${rawText.length} chars) to Gemini AI pipeline...`);
    const insights = await synthesizeDocumentInsights(rawText, analysisFocus);

    // 6. Save each extracted insight to Database
    const savedInsights = [];
    for (const insight of insights) {
      const insResult = await query(
        `INSERT INTO insights (document_id, category, content, confidence_score, citation_snippet)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, document_id, category, content, confidence_score, citation_snippet, created_at`,
        [
          savedDoc.id,
          insight.category,
          insight.content,
          insight.confidence_score,
          insight.citation_snippet || null
        ]
      );
      if (insResult.rows && insResult.rows[0]) {
        savedInsights.push(insResult.rows[0]);
      }
    }

    return res.status(201).json({
      message: 'Document uploaded and synthesized successfully',
      document: {
        ...savedDoc,
        insights_count: savedInsights.length
      },
      insights: savedInsights
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    next(err);
  }
}

/**
 * Get single document details with its raw text and citations
 * GET /api/documents/:id
 * Strict User Isolation: Checks ownership through the project's user_id
 */
export async function getDocumentById(req, res, next) {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const result = await query(
      `SELECT d.*, p.title AS project_title
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       WHERE d.id = $1 AND p.user_id = $2`,
      [documentId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or access denied.' });
    }

    const document = result.rows[0];

    // Fetch insights for this document
    const insightsResult = await query(
      'SELECT * FROM insights WHERE document_id = $1 ORDER BY created_at ASC',
      [documentId]
    );

    return res.json({
      document,
      insights: insightsResult.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete document
 * DELETE /api/documents/:id
 * Mandatory Security Requirement: MUST verify the document belongs to a project owned by the JWT's user_id.
 */
export async function deleteDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    // Strict ownership verification:
    // Verify document belongs to a project owned by req.user.id
    const verifyOwnership = await query(
      `SELECT d.id
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       WHERE d.id = $1 AND p.user_id = $2`,
      [documentId, userId]
    );

    if (!verifyOwnership.rows || verifyOwnership.rows.length === 0) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to delete this document or it does not exist.'
      });
    }

    // Cascade delete insights and document
    await query('DELETE FROM documents WHERE id = $1', [documentId]);

    return res.json({ message: 'Document and associated insights removed successfully.' });
  } catch (err) {
    next(err);
  }
}
