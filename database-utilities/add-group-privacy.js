import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addGroupPrivacy() {
  console.log('🔧 Adding is_public column to chat_threads...\n');

  const sql = fs.readFileSync('supabase/migrations/20251007020000_group_chat_privacy.sql', 'utf8');

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ Successfully added is_public column to chat_threads');
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

addGroupPrivacy();
