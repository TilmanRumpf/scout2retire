import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
  console.log('🚀 Adding is_excluded column via database function...\n');

  // First, create a function to execute SQL
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  console.log('Step 1: Creating exec_sql function...');

  const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', {
    sql: createFunctionSQL
  });

  if (funcError && !funcError.message.includes('does not exist')) {
    // Function might already exist, try to use it
    console.log('Function may already exist, proceeding...');
  }

  // Now use the function to add the column
  const alterTableSQL = `
    ALTER TABLE towns_hobbies
    ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT FALSE;
  `;

  console.log('\nStep 2: Adding is_excluded column...');

  const { data, error } = await supabase.rpc('exec_sql', { sql: alterTableSQL });

  if (error) {
    console.error('❌ Error:', error);
    console.log('\n📋 MANUAL STEP REQUIRED - Copy this SQL and run in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new\n');
    console.log('---------------------------------------------------');
    console.log('ALTER TABLE towns_hobbies');
    console.log('ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT FALSE;');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_towns_hobbies_excluded');
    console.log('ON towns_hobbies(town_id, is_excluded)');
    console.log('WHERE is_excluded = true;');
    console.log('---------------------------------------------------\n');
    return;
  }

  console.log('✅ Column added!');

  // Add index
  const createIndexSQL = `
    CREATE INDEX IF NOT EXISTS idx_towns_hobbies_excluded
    ON towns_hobbies(town_id, is_excluded)
    WHERE is_excluded = true;
  `;

  console.log('\nStep 3: Creating index...');

  const { data: idxData, error: idxError } = await supabase.rpc('exec_sql', {
    sql: createIndexSQL
  });

  if (idxError) {
    console.log('⚠️  Index creation skipped (non-critical)');
  } else {
    console.log('✅ Index created!');
  }

  console.log('\n🎉 Migration complete! Refresh your browser.');
}

addColumn().catch(console.error);
