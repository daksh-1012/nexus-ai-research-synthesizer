-- ====================================================================
-- Nexus: AI Research Synthesizer - Database Migration 001
-- Target: Supabase Cloud PostgreSQL
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration cleanly (in reverse order)
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  raw_text TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  analysis_focus VARCHAR(50) DEFAULT 'Summary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Insights Table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Empirical', 'Methodological', 'Strategic')),
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
  citation_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_insights_document_id ON insights(document_id);
CREATE INDEX IF NOT EXISTS idx_insights_category ON insights(category);

-- 8. Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Service Role Policies (Allows full administrative access for backend node service role / server)
DROP POLICY IF EXISTS "service_role_all_users" ON users;
CREATE POLICY "service_role_all_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_projects" ON projects;
CREATE POLICY "service_role_all_projects" ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_documents" ON documents;
CREATE POLICY "service_role_all_documents" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_insights" ON insights;
CREATE POLICY "service_role_all_insights" ON insights FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated User Isolation Policies (For direct Supabase client queries via JWT claims if applicable)
DROP POLICY IF EXISTS "users_manage_own" ON users;
CREATE POLICY "users_manage_own" ON users FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "projects_owner_access" ON projects;
CREATE POLICY "projects_owner_access" ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_project_owner_access" ON documents;
CREATE POLICY "documents_project_owner_access" ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insights_project_owner_access" ON insights;
CREATE POLICY "insights_project_owner_access" ON insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN projects ON documents.project_id = projects.id
      WHERE documents.id = insights.document_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      JOIN projects ON documents.project_id = projects.id
      WHERE documents.id = insights.document_id
      AND projects.user_id = auth.uid()
    )
  );

-- 9. Seed Initial Benchmark & Demo Data
-- Default Demo User: demo@nexus.ai (password: Demo1234!)
-- Password hash generated with bcrypt (10 rounds) for 'Demo1234!'
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'demo@nexus.ai',
  '$2a$10$/d1.Hndvh.B0iHG8qEUD9OEsBLGMVMAWeAqPpGa3/tfHLUsRsF8nO',
  'Dr. Elena Vance'
) ON CONFLICT (email) DO NOTHING;

-- Seed Sample Project: Impact of Microplastics on Marine Ecosystems
INSERT INTO projects (id, user_id, title, description)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Impact of Microplastics on Marine Trophic Pyramids',
  'Longitudinal analysis synthesizing empirical bioaccumulation rates, gaps in sub-micron tracking, and regulatory strategic recommendations.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Document
INSERT INTO documents (id, project_id, filename, raw_text, file_size, mime_type, analysis_focus)
VALUES (
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  'microplastics_marine_pelagic_2025.txt',
  'Study on pelagic teleost fishes sampled across North Atlantic gyres (N=420). Microplastic particle burden averaged 14.8 +/- 3.2 items per individual, with polyethylene terephthalate (PET) representing 61.4% of synthetic polymers identified via micro-FTIR spectroscopy. Trophic transfer efficiency demonstrated a 3.4x bio-magnification factor in apex predator stomach contents compared to mesopelagic forage species. Notably, conventional sampling using 333-micron manta trawls systematically fails to detect nanoplastics below 20 microns, introducing substantial underestimation biases in published biomass ingestion rates. Current regional regulatory frameworks lack standardized metric thresholds for particulate toxicity, suggesting that international monitoring pacts must mandate Raman spectroscopy alongside mass spectrometry.',
  1420,
  'text/plain',
  'Summary'
) ON CONFLICT (id) DO NOTHING;

-- Seed Insights Across 3 Primary Dimensions
INSERT INTO insights (id, document_id, category, content, confidence_score, citation_snippet)
VALUES
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d41',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Empirical',
    'PET plastics constituted 61.4% of identified particles with an average burden of 14.8 items per individual, driving a 3.4x biomagnification factor in apex teleosts.',
    0.96,
    'averaged 14.8 +/- 3.2 items per individual, with polyethylene terephthalate (PET) representing 61.4%... Trophic transfer efficiency demonstrated a 3.4x bio-magnification factor'
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d42',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Methodological',
    'Standard 333-micron manta trawl sampling fails to quantify particles under 20 microns, leading to systematic underestimation of sub-micron particle ingestion rates.',
    0.92,
    'conventional sampling using 333-micron manta trawls systematically fails to detect nanoplastics below 20 microns, introducing substantial underestimation biases'
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d43',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Strategic',
    'International regulatory treaties should establish standardized Raman spectroscopy and mass spectrometry mandates rather than relying on legacy mesh filtration protocols.',
    0.89,
    'Current regional regulatory frameworks lack standardized metric thresholds... suggesting that international monitoring pacts must mandate Raman spectroscopy alongside mass spectrometry.'
  )
ON CONFLICT (id) DO NOTHING;
