import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addIsPublicColumn() {
  console.log('🔧 Adding is_public column to chat_threads...\n');

  try {
    // Direct SQL using the client
    const { error } = await supabase
      .from('chat_threads')
      .select('is_public')
      .limit(1);

    if (error && error.message.includes('column "is_public" does not exist')) {
      console.log('Column does not exist, need to add it manually via Supabase dashboard.');
      console.log('\nRun this SQL in Supabase SQL Editor:');
      console.log('---');
      console.log('ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;');
      console.log('CREATE INDEX IF NOT EXISTS idx_chat_threads_is_public ON chat_threads(is_public);');
      console.log('---');
    } else if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ is_public column already exists!');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

addIsPublicColumn();
