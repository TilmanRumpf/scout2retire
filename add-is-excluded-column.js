import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
  console.log('🚀 Adding is_excluded column to towns_hobbies...\n');

  try {
    // Try to add column using raw SQL
    const { data, error } = await supabase
      .from('towns_hobbies')
      .select('id, town_id, hobby_id')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return;
    }

    console.log('✅ Database connected');
    console.log('\n📋 PLEASE RUN THIS SQL IN SUPABASE SQL EDITOR:\n');
    console.log('---------------------------------------------------');
    console.log('ALTER TABLE towns_hobbies');
    console.log('ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT FALSE;');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_towns_hobbies_excluded');
    console.log('ON towns_hobbies(town_id, is_excluded)');
    console.log('WHERE is_excluded = true;');
    console.log('---------------------------------------------------\n');
    console.log('Then refresh your browser!');

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addColumn().catch(console.error);
