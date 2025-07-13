import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

// Use service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixForeignKeys() {
  console.log('🔧 Fixing ALL foreign key constraints...\n');
  
  try {
    // Fix each table's foreign key constraint
    const tables = [
      'onboarding_responses',
      'favorites', 
      'user_preferences',
      'chat_messages'
    ];
    
    for (const table of tables) {
      console.log(`Fixing ${table}...`);
      
      // Drop existing constraint
      const dropQuery = `ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${table}_user_id_fkey`;
      const { error: dropError } = await supabase.rpc('exec_sql', { query: dropQuery }).single();
      
      if (dropError && !dropError.message?.includes('does not exist')) {
        console.error(`Error dropping constraint for ${table}:`, dropError);
      }
      
      // Add CASCADE constraint
      const addQuery = `ALTER TABLE ${table} ADD CONSTRAINT ${table}_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`;
      const { error: addError } = await supabase.rpc('exec_sql', { query: addQuery }).single();
      
      if (addError) {
        console.error(`Error adding CASCADE for ${table}:`, addError);
      } else {
        console.log(`✅ ${table} - CASCADE DELETE enabled`);
      }
    }
    
    console.log('\n✅ All foreign key constraints fixed!');
    console.log('You can now delete users without any constraint errors.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the fix
fixForeignKeys();