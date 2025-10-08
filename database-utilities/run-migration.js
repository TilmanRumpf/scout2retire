import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(filePath) {
  console.log(`\n🚀 Running migration: ${filePath}\n`);

  try {
    // Read SQL file
    const sql = readFileSync(filePath, 'utf8');

    // Execute SQL via RPC (using service role key for DDL)
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('Result:', data);

  } catch (err) {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node run-migration.js <path-to-migration.sql>');
  process.exit(1);
}

runMigration(filePath);
