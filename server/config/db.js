import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;

let pool = null;
let supabase = null;
let isPgConnected = false;

// Initialize Supabase client if credentials present
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  supabase = createClient(process.env.SUPABASE_URL, key);
  console.log('✓ Supabase Client initialized successfully');
}

// Initialize PostgreSQL pool if DATABASE_URL is present
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    pool.on('error', (err) => {
      console.error('[DB Error] Unexpected PostgreSQL pool error:', err.message);
    });
  } catch (err) {
    console.warn('[DB Warning] PostgreSQL pool initialization failed:', err.message);
  }
}

// In-Memory Fallback Store (Ensures zero-downtime execution and offline testing)
const memoryStore = {
  users: [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'demo@nexus.ai',
      // bcrypt hash for 'Demo1234!'
      password_hash: '$2a$10$/d1.Hndvh.B0iHG8qEUD9OEsBLGMVMAWeAqPpGa3/tfHLUsRsF8nO',
      full_name: 'Dr. Elena Vance',
      avatar_url: null,
      created_at: new Date('2025-01-15T08:00:00Z').toISOString(),
      updated_at: new Date('2025-01-15T08:00:00Z').toISOString()
    }
  ],
  projects: [
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Impact of Microplastics on Marine Trophic Pyramids',
      description: 'Longitudinal analysis synthesizing empirical bioaccumulation rates, gaps in sub-micron tracking, and regulatory strategic recommendations.',
      created_at: new Date('2025-01-15T08:30:00Z').toISOString(),
      updated_at: new Date('2025-01-15T08:30:00Z').toISOString()
    }
  ],
  documents: [
    {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      project_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      filename: 'microplastics_marine_pelagic_2025.txt',
      raw_text: 'Study on pelagic teleost fishes sampled across North Atlantic gyres (N=420). Microplastic particle burden averaged 14.8 +/- 3.2 items per individual, with polyethylene terephthalate (PET) representing 61.4% of synthetic polymers identified via micro-FTIR spectroscopy. Trophic transfer efficiency demonstrated a 3.4x bio-magnification factor in apex predator stomach contents compared to mesopelagic forage species. Notably, conventional sampling using 333-micron manta trawls systematically fails to detect nanoplastics below 20 microns, introducing substantial underestimation biases in published biomass ingestion rates. Current regional regulatory frameworks lack standardized metric thresholds for particulate toxicity, suggesting that international monitoring pacts must mandate Raman spectroscopy alongside mass spectrometry.',
      file_size: 1420,
      mime_type: 'text/plain',
      analysis_focus: 'Summary',
      created_at: new Date('2025-01-15T08:45:00Z').toISOString()
    }
  ],
  insights: [
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d41',
      document_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      category: 'Empirical',
      content: 'PET plastics constituted 61.4% of identified particles with an average burden of 14.8 items per individual, driving a 3.4x biomagnification factor in apex teleosts.',
      confidence_score: 0.96,
      citation_snippet: 'averaged 14.8 +/- 3.2 items per individual, with polyethylene terephthalate (PET) representing 61.4%... Trophic transfer efficiency demonstrated a 3.4x bio-magnification factor',
      created_at: new Date('2025-01-15T08:46:00Z').toISOString()
    },
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d42',
      document_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      category: 'Methodological',
      content: 'Standard 333-micron manta trawl sampling fails to quantify particles under 20 microns, leading to systematic underestimation of sub-micron particle ingestion rates.',
      confidence_score: 0.92,
      citation_snippet: 'conventional sampling using 333-micron manta trawls systematically fails to detect nanoplastics below 20 microns, introducing substantial underestimation biases',
      created_at: new Date('2025-01-15T08:46:05Z').toISOString()
    },
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d43',
      document_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
      category: 'Strategic',
      content: 'International regulatory treaties should establish standardized Raman spectroscopy and mass spectrometry mandates rather than relying on legacy mesh filtration protocols.',
      confidence_score: 0.89,
      citation_snippet: 'Current regional regulatory frameworks lack standardized metric thresholds... suggesting that international monitoring pacts must mandate Raman spectroscopy alongside mass spectrometry.',
      created_at: new Date('2025-01-15T08:46:10Z').toISOString()
    }
  ]
};

/**
 * Universal Query Executor
 * Prioritizes PostgreSQL pool, then official Supabase Client, with automatic memory fallback.
 */
export async function query(text, params = []) {
  if (pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.warn(`[DB PG Error] Query error: "${text.slice(0, 60)}..."`, err.message);
    }
  }

  if (supabase) {
    try {
      const res = await executeSupabaseQuery(text, params);
      if (res !== null && res !== undefined) {
        return res;
      }
    } catch (err) {
      console.warn('[DB Supabase Execution Error]', err.message);
    }
  }

  // Fallback simulator for memory store
  return executeMemoryQuery(text, params);
}

async function executeSupabaseQuery(text, params) {
  const normalized = text.trim();

  // 1. Users: find by email
  if (/FROM\s+users\b[\s\S]*WHERE\s+email\s*=\s*\$1/i.test(normalized)) {
    const { data, error } = await supabase.from('users').select('*').ilike('email', params[0]);
    if (error) throw error;
    return { rows: data || [] };
  }

  // 2. Users: find by id
  if (/FROM\s+users\b[\s\S]*WHERE\s+id\s*=\s*\$1/i.test(normalized)) {
    const { data, error } = await supabase.from('users').select('*').eq('id', params[0]);
    if (error) throw error;
    return { rows: data || [] };
  }

  // 3. Users: insert
  if (/INSERT INTO users/i.test(normalized)) {
    const [email, password_hash, full_name] = params;
    const { data, error } = await supabase.from('users').insert({
      email,
      password_hash,
      full_name: full_name || email.split('@')[0]
    }).select();
    if (error) throw error;
    return { rows: data || [] };
  }

  // 4. Projects: get for user with counts
  if (/FROM\s+projects\s+p[\s\S]*WHERE\s+p\.user_id\s*=\s*\$1/i.test(normalized) || /FROM\s+projects\b[\s\S]*WHERE\s+user_id\s*=\s*\$1/i.test(normalized)) {
    const userId = params[0];
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch document & insight counts
    const enriched = await Promise.all((projects || []).map(async (p) => {
      const { data: docs } = await supabase.from('documents').select('id').eq('project_id', p.id);
      const docIds = (docs || []).map(d => d.id);
      let insightCount = 0;
      if (docIds.length > 0) {
        const { count } = await supabase.from('insights').select('*', { count: 'exact', head: true }).in('document_id', docIds);
        insightCount = count || 0;
      }
      return {
        ...p,
        document_count: docIds.length,
        insight_count: insightCount
      };
    }));

    return { rows: enriched };
  }

  // 5. Projects: find by id and user_id
  if (/FROM\s+projects\b[\s\S]*WHERE\s+(p\.)?id\s*=\s*\$1\s+AND\s+(p\.)?user_id\s*=\s*\$2/i.test(normalized)) {
    const [projId, userId] = params;
    const { data, error } = await supabase.from('projects').select('*').eq('id', projId).eq('user_id', userId);
    if (error) throw error;
    return { rows: data || [] };
  }

  // 6. Projects: insert
  if (/INSERT INTO projects/i.test(normalized)) {
    const [userId, title, description] = params;
    const { data, error } = await supabase.from('projects').insert({
      user_id: userId,
      title,
      description: description || ''
    }).select();
    if (error) throw error;
    return { rows: data || [] };
  }

  // 7. Projects: delete
  if (/DELETE FROM projects WHERE id = \$1 AND user_id = \$2/i.test(normalized)) {
    const [projId, userId] = params;
    const { error } = await supabase.from('projects').delete().eq('id', projId).eq('user_id', userId);
    if (error) throw error;
    return { rowCount: 1 };
  }

  // 8. Documents: check ownership
  if (/FROM\s+documents\s+d[\s\S]*JOIN\s+projects\s+p[\s\S]*WHERE\s+d\.id\s*=\s*\$1\s+AND\s+p\.user_id\s*=\s*\$2/i.test(normalized)) {
    const [docId, userId] = params;
    const { data: doc, error } = await supabase.from('documents').select('*, projects!inner(id, user_id, title)').eq('id', docId).eq('projects.user_id', userId).single();
    if (error || !doc) return { rows: [] };
    return { rows: [{ ...doc, project_title: doc.projects?.title }] };
  }

  // 9. Documents: find by project_id with counts
  if (/FROM\s+documents\b[\s\S]*WHERE\s+(d\.)?project_id\s*=\s*\$1/i.test(normalized)) {
    const [projId] = params;
    const { data: docs, error } = await supabase.from('documents').select('*').eq('project_id', projId).order('created_at', { ascending: false });
    if (error) throw error;

    const enrichedDocs = await Promise.all((docs || []).map(async (d) => {
      const { count } = await supabase.from('insights').select('*', { count: 'exact', head: true }).eq('document_id', d.id);
      return { ...d, insights_count: count || 0 };
    }));

    return { rows: enrichedDocs };
  }

  // 10. Documents: insert
  if (/INSERT INTO documents/i.test(normalized)) {
    const [projectId, filename, rawText, fileSize, mimeType, analysisFocus] = params;
    const { data, error } = await supabase.from('documents').insert({
      project_id: projectId,
      filename,
      raw_text: rawText,
      file_size: fileSize,
      mime_type: mimeType,
      analysis_focus: analysisFocus
    }).select();
    if (error) throw error;
    return { rows: data || [] };
  }

  // 11. Documents: delete
  if (/DELETE FROM documents WHERE id = \$1/i.test(normalized)) {
    const [docId] = params;
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) throw error;
    return { rowCount: 1 };
  }

  // 12. Insights: insert
  if (/INSERT INTO insights/i.test(normalized)) {
    const [documentId, category, content, confidenceScore, citationSnippet] = params;
    const { data, error } = await supabase.from('insights').insert({
      document_id: documentId,
      category,
      content,
      confidence_score: Number(confidenceScore),
      citation_snippet: citationSnippet || null
    }).select();
    if (error) throw error;
    return { rows: data || [] };
  }

  // 13. Insights: fetch aggregated for project
  if (/FROM\s+insights\s+i[\s\S]*JOIN\s+documents\s+d/i.test(normalized) || /insights\b[\s\S]*project_id/i.test(normalized)) {
    const [projId] = params;
    const { data: docs } = await supabase.from('documents').select('id, filename, analysis_focus, raw_text').eq('project_id', projId);
    if (!docs || docs.length === 0) return { rows: [] };

    const docMap = new Map(docs.map(d => [d.id, d]));
    const docIds = docs.map(d => d.id);

    const { data: insights, error } = await supabase
      .from('insights')
      .select('*')
      .in('document_id', docIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (insights || []).map(i => {
      const parent = docMap.get(i.document_id);
      return {
        ...i,
        filename: parent?.filename || 'Unknown',
        analysis_focus: parent?.analysis_focus || 'Summary',
        raw_text: parent?.raw_text || ''
      };
    });

    return { rows: formatted };
  }

  return null;
}

function executeMemoryQuery(text, params) {
  const normalized = text.trim();
  console.log('[DEBUG SQL]', normalized.slice(0, 100), 'Params:', params);

  // Users: find by email
  if (/SELECT \* FROM users WHERE email = \$1/i.test(normalized)) {
    const user = memoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // Users: find by id
  if (/SELECT \* FROM users WHERE id = \$1/i.test(normalized) || /SELECT id, email, full_name/i.test(normalized)) {
    const user = memoryStore.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [] };
  }

  // Users: insert
  if (/INSERT INTO users/i.test(normalized)) {
    const [email, password_hash, full_name] = params;
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash,
      full_name: full_name || email.split('@')[0],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    return { rows: [newUser] };
  }

  // Projects: get for user
  if (/FROM\s+projects\s+p[\s\S]*WHERE\s+p\.user_id\s*=\s*\$1/i.test(normalized) || /FROM\s+projects\b[\s\S]*WHERE\s+user_id\s*=\s*\$1/i.test(normalized)) {
    const userId = params[0];
    const userProjects = memoryStore.projects
      .filter(p => p.user_id === userId)
      .map(p => {
        const docCount = memoryStore.documents.filter(d => d.project_id === p.id).length;
        const insightCount = memoryStore.insights.filter(i => {
          const doc = memoryStore.documents.find(d => d.id === i.document_id);
          return doc && doc.project_id === p.id;
        }).length;
        return { ...p, document_count: docCount, insight_count: insightCount };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: userProjects };
  }

  // Projects: find by id and user_id (for getProjectById or check)
  if (/FROM\s+projects\b[\s\S]*WHERE\s+(p\.)?id\s*=\s*\$1\s+AND\s+(p\.)?user_id\s*=\s*\$2/i.test(normalized)) {
    const [projId, userId] = params;
    const proj = memoryStore.projects.find(p => p.id === projId && p.user_id === userId);
    return { rows: proj ? [proj] : [] };
  }

  // Projects: insert
  if (/INSERT INTO projects/i.test(normalized)) {
    const [userId, title, description] = params;
    const newProj = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.projects.push(newProj);
    return { rows: [newProj] };
  }

  // Projects: delete
  if (/DELETE FROM projects WHERE id = \$1 AND user_id = \$2/i.test(normalized)) {
    const [projId, userId] = params;
    const index = memoryStore.projects.findIndex(p => p.id === projId && p.user_id === userId);
    if (index !== -1) {
      memoryStore.projects.splice(index, 1);
      // cascade
      const docIds = memoryStore.documents.filter(d => d.project_id === projId).map(d => d.id);
      memoryStore.documents = memoryStore.documents.filter(d => d.project_id !== projId);
      memoryStore.insights = memoryStore.insights.filter(i => !docIds.includes(i.document_id));
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  // Documents: ownership verification (for delete or detail)
  if (/FROM\s+documents\s+d[\s\S]*JOIN\s+projects\s+p[\s\S]*WHERE\s+d\.id\s*=\s*\$1\s+AND\s+p\.user_id\s*=\s*\$2/i.test(normalized)) {
    const [docId, userId] = params;
    const doc = memoryStore.documents.find(d => d.id === docId);
    if (doc) {
      const proj = memoryStore.projects.find(p => p.id === doc.project_id && p.user_id === userId);
      if (proj) {
        return { rows: [{ ...doc, project_title: proj.title }] };
      }
    }
    return { rows: [] };
  }

  // Documents: find by project_id
  if (/FROM\s+documents\b[\s\S]*WHERE\s+(d\.)?project_id\s*=\s*\$1/i.test(normalized)) {
    const [projId] = params;
    const docs = memoryStore.documents
      .filter(d => d.project_id === projId)
      .map(d => {
        const insightsCount = memoryStore.insights.filter(i => i.document_id === d.id).length;
        return { ...d, insights_count: insightsCount };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: docs };
  }

  // Documents: insert
  if (/INSERT INTO documents/i.test(normalized)) {
    const [projectId, filename, rawText, fileSize, mimeType, analysisFocus] = params;
    const newDoc = {
      id: crypto.randomUUID(),
      project_id: projectId,
      filename,
      raw_text: rawText,
      file_size: fileSize || rawText.length,
      mime_type: mimeType || 'text/plain',
      analysis_focus: analysisFocus || 'Summary',
      created_at: new Date().toISOString()
    };
    memoryStore.documents.push(newDoc);
    return { rows: [newDoc] };
  }

  // Documents: delete
  if (/DELETE FROM documents WHERE id = \$1/i.test(normalized)) {
    const [docId] = params;
    const index = memoryStore.documents.findIndex(d => d.id === docId);
    if (index !== -1) {
      memoryStore.documents.splice(index, 1);
      memoryStore.insights = memoryStore.insights.filter(i => i.document_id !== docId);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  // Insights: insert
  if (/INSERT INTO insights/i.test(normalized)) {
    const [documentId, category, content, confidenceScore, citationSnippet] = params;
    const newInsight = {
      id: crypto.randomUUID(),
      document_id: documentId,
      category,
      content,
      confidence_score: Number(confidenceScore),
      citation_snippet: citationSnippet || null,
      created_at: new Date().toISOString()
    };
    memoryStore.insights.push(newInsight);
    return { rows: [newInsight] };
  }

  // Insights: fetch aggregated for project
  if (/FROM\s+insights\s+i[\s\S]*JOIN\s+documents\s+d/i.test(normalized) || /insights\b[\s\S]*project_id/i.test(normalized)) {
    const [projId] = params;
    const docs = memoryStore.documents.filter(d => d.project_id === projId);
    const docMap = new Map(docs.map(d => [d.id, d]));
    const projectInsights = memoryStore.insights
      .filter(i => docMap.has(i.document_id))
      .map(i => ({
        ...i,
        filename: docMap.get(i.document_id)?.filename || 'Unknown',
        raw_text: docMap.get(i.document_id)?.raw_text || '',
        analysis_focus: docMap.get(i.document_id)?.analysis_focus || 'Summary'
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: projectInsights };
  }

  // Insights: by document_id
  if (/SELECT \* FROM insights WHERE document_id = \$1/i.test(normalized)) {
    const [docId] = params;
    const rows = memoryStore.insights.filter(i => i.document_id === docId);
    return { rows };
  }

  return { rows: [], rowCount: 0 };
}

export { pool, supabase, memoryStore };
