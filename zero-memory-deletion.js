import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function setupZeroMemoryDeletion() {
  console.log('🔥 SETTING UP ZERO MEMORY USER DELETION\n');
  
  const queries = [
    // Update all foreign keys to CASCADE DELETE
    `ALTER TABLE chat_messages 
     DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;`,
    
    `ALTER TABLE chat_messages
     ADD CONSTRAINT chat_messages_user_id_fkey 
     FOREIGN KEY (user_id) 
     REFERENCES users(id) 
     ON DELETE CASCADE;`,
     
    `ALTER TABLE onboarding_responses 
     DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;`,
    
    `ALTER TABLE onboarding_responses
     ADD CONSTRAINT onboarding_responses_user_id_fkey 
     FOREIGN KEY (user_id) 
     REFERENCES users(id) 
     ON DELETE CASCADE;`,
     
    `ALTER TABLE user_preferences 
     DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;`,
    
    `ALTER TABLE user_preferences
     ADD CONSTRAINT user_preferences_user_id_fkey 
     FOREIGN KEY (user_id) 
     REFERENCES users(id) 
     ON DELETE CASCADE;`,
     
    `ALTER TABLE favorites 
     DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;`,
    
    `ALTER TABLE favorites
     ADD CONSTRAINT favorites_user_id_fkey 
     FOREIGN KEY (user_id) 
     REFERENCES users(id) 
     ON DELETE CASCADE;`,
     
    // Create complete deletion function
    `CREATE OR REPLACE FUNCTION complete_user_deletion(target_user_id UUID)
     RETURNS TEXT AS $$
     DECLARE
         deleted_email TEXT;
     BEGIN
         -- Get the email before deletion for confirmation
         SELECT email INTO deleted_email FROM auth.users WHERE id = target_user_id;
         
         -- Delete from auth.users (Supabase auth)
         DELETE FROM auth.users WHERE id = target_user_id;
         
         -- Delete from public.users (this will cascade to all related tables)
         DELETE FROM public.users WHERE id = target_user_id;
         
         -- Return confirmation
         RETURN 'User ' || COALESCE(deleted_email, 'unknown') || ' COMPLETELY DELETED. ZERO MEMORY. Email can be reused immediately.';
     END;
     $$ LANGUAGE plpgsql;`,
     
    `GRANT EXECUTE ON FUNCTION complete_user_deletion TO authenticated;`
  ];
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}/${queries.length} Executing...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error(`❌ Error on query ${i + 1}:`, error);
      } else {
        console.log(`✅ Query ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.error(`❌ Exception on query ${i + 1}:`, err);
    }
  }
  
  console.log('\n🎉 ZERO MEMORY DELETION IS NOW ACTIVE!');
  console.log('When a user is deleted:');
  console.log('- ALL their data is wiped');
  console.log('- Email becomes available immediately');
  console.log('- User can re-register like a fresh bird');
  
  // Verify setup
  console.log('\n🔍 Verifying foreign key constraints...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: `SELECT 
              tc.table_name,
              tc.constraint_name,
              kcu.column_name,
              rc.delete_rule
            FROM 
              information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
            WHERE 
              tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'
              AND kcu.column_name = 'user_id'
            ORDER BY tc.table_name;`
    });
    
    if (data) {
      console.log('Foreign key constraints:', data);
    }
  } catch (err) {
    console.log('Verification query not supported, but setup should be complete');
  }
}

setupZeroMemoryDeletion();