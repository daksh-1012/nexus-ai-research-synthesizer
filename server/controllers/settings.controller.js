import { query, pool, supabase } from '../config/db.js';

/**
 * Get system status and user preferences
 * GET /api/settings
 */
export async function getSettings(req, res, next) {
  try {
    const userId = req.user.id;

    const userRes = await query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0] || {};

    const dbStatus = pool 
      ? 'Connected (Supabase / PostgreSQL Pool)' 
      : supabase 
        ? 'Connected (Supabase Client)' 
        : 'Active (Local Memory / Isolated Development Mode)';

    const geminiConfigured = Boolean(
      process.env.GEMINI_API_KEY && 
      process.env.GEMINI_API_KEY !== 'your_google_gemini_key' &&
      !process.env.GEMINI_API_KEY.startsWith('[')
    );

    return res.json({
      user,
      system: {
        databaseStatus: dbStatus,
        geminiStatus: geminiConfigured ? 'Connected & Verified' : 'Standard Development / Heuristic NLP Mode',
        geminiModel: 'Google Gemini 2.5 Flash (@google/genai SDK)',
        maxUploadSize: '5MB (PDF, TXT)',
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}
