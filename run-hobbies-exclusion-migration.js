import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function runMigration() {
  console.log('🚀 Running hobbies exclusion migration...\n');

  const sql = fs.readFileSync('supabase/migrations/20251018_add_is_excluded_to_towns_hobbies.sql', 'utf8');

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 You need to run this SQL manually in Supabase SQL Editor:');
    console.log(sql);
    return;
  }

  console.log('✅ Migration completed successfully!');
  console.log('✅ Added is_excluded column to towns_hobbies table');
}

runMigration().catch(console.error);
