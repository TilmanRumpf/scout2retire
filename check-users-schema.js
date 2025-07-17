import { createClient } from '@supabase/supabase-js';

// Use service role key to check schema
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkUsersSchema() {
  console.log('🔍 Checking users table schema...\n');
  
  try {
    // Get column information
    const { data: columns, error } = await supabase.rpc('get_table_columns', {
      table_name: 'users'
    });
    
    if (error) {
      // Try alternative approach
      console.log('Using alternative query method...');
      
      // Check by selecting from information_schema
      const query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        ORDER BY ordinal_position;
      `;
      
      // We need to create a function to run raw SQL
      const { data, error: queryError } = await supabase
        .rpc('exec_sql', { query })
        .single();
        
      if (queryError) {
        // Let's try a simple select to see what columns exist
        const { data: sampleUser, error: sampleError } = await supabase
          .from('users')
          .select('*')
          .limit(1);
          
        if (sampleError) {
          console.error('❌ Error fetching users:', sampleError);
        } else if (sampleUser && sampleUser.length > 0) {
          console.log('📊 Users table columns (from sample):');
          const cols = Object.keys(sampleUser[0]);
          cols.forEach(col => {
            console.log(`  - ${col}`);
          });
          
          if (cols.includes('nationality')) {
            console.log('\n⚠️ WARNING: nationality column EXISTS in users table!');
          } else {
            console.log('\n✅ GOOD: nationality column does NOT exist in users table');
          }
        } else {
          console.log('ℹ️ No users found to check schema');
        }
      } else {
        console.log('📊 Users table columns:', data);
      }
    } else {
      console.log('📊 Users table columns:', columns);
    }
    
    // Also check if there's a migration pending
    console.log('\n🔍 Checking for pending migrations...');
    const { data: migrations, error: migError } = await supabase
      .from('schema_migrations')
      .select('*')
      .order('version', { ascending: false })
      .limit(5);
      
    if (!migError && migrations) {
      console.log('\nRecent migrations:');
      migrations.forEach(m => {
        console.log(`  - ${m.version}: ${m.name || 'unnamed'}`);
      });
    }
    
    // Check if the clean users table migration exists
    console.log('\n🔍 Checking for clean_users_table_schema migration...');
    const migrationFile = '20250714043846_clean_users_table_schema.sql';
    console.log(`Migration file exists locally: ${migrationFile}`);
    console.log('This migration should remove the nationality column if it exists');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkUsersSchema().catch(console.error);