import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

async function runMigration() {
  console.log('====================================================');
  console.log(' 🛠️  Nexus Database Migration Runner');
  console.log('====================================================\n');

  const migrationFilePath = path.resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf-8');
  console.log(`📄 Loaded migration script: ${path.basename(migrationFilePath)} (${sqlContent.length} bytes)`);

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('\n⚠️  DATABASE_URL environment variable is not defined in server/.env.');
    console.warn('To apply this migration directly to your Supabase Cloud PostgreSQL instance:');
    console.warn('1. Go to your Supabase Project Dashboard -> Project Settings -> Database');
    console.warn('2. Copy the "Connection string" (URI mode with pooling or direct port 5432)');
    console.warn('3. Add to server/.env: DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');
    console.warn('4. Run: npm run migrate\n');
    console.log('💡 Note: The application also includes an automatic memory fallback layer with pre-seeded demo records for Dr. Elena Vance (demo@nexus.ai / Demo1234!), so you can run the client and server immediately even before connecting cloud credentials.');
    return;
  }

  console.log(`🔌 Connecting to PostgreSQL at ${connectionString.split('@')[1] || 'remote host'}...`);

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL successfully.');
    console.log('⏳ Executing migration script (tables, indexes, RLS, seed data)...');

    await client.query(sqlContent);

    console.log('\n🎉 SUCCESS! Schema migration applied successfully to Supabase PostgreSQL:');
    console.log('  ✓ Tables created: users, projects, documents, insights');
    console.log('  ✓ Row Level Security (RLS) policies established');
    console.log('  ✓ Optimized btree indexes created');
    console.log('  ✓ Benchmark research seed data inserted');

    client.release();
    await pool.end();
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.position) {
      console.error(`At SQL character position: ${err.position}`);
    }
    process.exit(1);
  }
}

runMigration();
