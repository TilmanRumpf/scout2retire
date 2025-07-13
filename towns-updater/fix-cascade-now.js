import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '../.env') });

// Create admin client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSql(sql) {
  // Split SQL into individual statements
  const statements = sql.split(';').filter(s => s.trim());
  
  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed) continue;
    
    console.log(`Executing: ${trimmed.substring(0, 50)}...`);
    
    // For ALTER TABLE statements, we need to use raw SQL through a function
    // First, let's try to create a simple function to execute SQL
    try {
      // Try to create the function first
      const createFunction = `
        CREATE OR REPLACE FUNCTION exec_sql(query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE query;
        END;
        $$;
      `;
      
      await supabase.rpc('query', { query: createFunction });
    } catch (e) {
      // Function might already exist
    }
    
    // Now execute our statement
    const { error } = await supabase.rpc('exec_sql', { query: trimmed });
    
    if (error) {
      console.error(`Error: ${error.message}`);
      // Try alternative approach - direct query
      const { error: altError } = await supabase.from('users').select('id').limit(0);
      if (!altError) {
        console.log('Connected to database successfully');
      }
    } else {
      console.log('✅ Success');
    }
  }
}

async function fixCascadeDeletes() {
  console.log('🔧 Fixing foreign key constraints to enable CASCADE DELETE...\n');
  
  const sql = `
    -- Fix onboarding_responses
    ALTER TABLE onboarding_responses DROP CONSTRAINT IF EXISTS onboarding_responses_user_id_fkey;
    ALTER TABLE onboarding_responses ADD CONSTRAINT onboarding_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Fix favorites  
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
    ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Fix user_preferences
    ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;
    ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Fix chat_messages
    ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;
    ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  `;
  
  // Unfortunately, Supabase JS client doesn't support DDL statements directly
  console.log('❌ Cannot execute DDL statements through Supabase JS client.');
  console.log('\n📋 Here\'s what needs to be done:\n');
  console.log(sql);
  console.log('\n⚡ Quick solution:');
  console.log('1. I\'ll create a migration file that Supabase can run');
  console.log('2. Or you need to run this in the SQL Editor\n');
  
  // Create a migration file instead
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
  const migrationPath = path.join(process.cwd(), '..', 'supabase', 'migrations', `${timestamp}_fix_cascade_deletes.sql`);
  
  const fs = await import('fs');
  await fs.promises.writeFile(migrationPath, sql);
  
  console.log(`✅ Migration file created: ${migrationPath}`);
  console.log('\nRun: npx supabase db push');
  
  process.exit(0);
}

fixCascadeDeletes();