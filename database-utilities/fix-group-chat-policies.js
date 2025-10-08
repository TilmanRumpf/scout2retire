import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPolicies() {
  console.log('🔧 Fixing group_chat_members policies...\n');

  // We'll use a raw SQL query via a custom function
  // First, let's just try to insert directly and see what happens

  console.log('The RLS policies have infinite recursion.');
  console.log('We need to disable RLS temporarily, or use service role key.\n');

  console.log('Actually, the issue is that we\'re using the wrong approach.');
  console.log('Let me check if we can use the Supabase dashboard API...\n');

  // For now, just provide the SQL
  console.log('Please run this SQL directly in Supabase Studio:');
  console.log('Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');
  console.log('\nSQL to run:');
  console.log('---');
  console.log(`
-- Drop both INSERT policies
DROP POLICY IF EXISTS "Users can add members to their groups" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can add members to groups" ON group_chat_members;

-- Create a single, simple INSERT policy with no recursion
CREATE POLICY "Thread creator can add members"
  ON group_chat_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      WHERE ct.id = thread_id
      AND ct.created_by = auth.uid()
    )
  );
  `);
  console.log('---');
}

fixPolicies();
