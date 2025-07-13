import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function applyZeroMemoryDeletion() {
  console.log('🔥 APPLYING ZERO MEMORY USER DELETION DIRECTLY\n');
  
  // Read the migration file content
  const migrationSQL = readFileSync('./supabase/migrations/20250713070809_zero_memory_user_deletion.sql', 'utf8');
  
  // Split into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`${i + 1}/${statements.length} Executing: ${stmt.substring(0, 50)}...`);
    
    try {
      // Use the raw query approach
      const { error } = await supabase
        .from('schema_migrations') // This will fail but we'll catch it
        .select('*');
        
      // Since we can't execute raw SQL, let's do it manually:
      console.log('Statement:', stmt);
      
    } catch (err) {
      console.log('Cannot execute raw SQL via client');
    }
  }
  
  console.log('\n🎯 MANUAL APPLICATION NEEDED');
  console.log('Copy this SQL to Supabase Dashboard → SQL Editor:');
  console.log('\n' + '='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  
  console.log('\nThis will set up:');
  console.log('✅ CASCADE DELETE on all user foreign keys');
  console.log('✅ complete_user_deletion() function');
  console.log('✅ ZERO MEMORY when user is deleted');
  console.log('✅ Email becomes available immediately');
}

applyZeroMemoryDeletion();