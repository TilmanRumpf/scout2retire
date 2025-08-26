import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running migration to add onboarding fields to users table...\n');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250111_complete_onboarding_fields_migration.sql', 'utf8');
    
    // Split into individual statements (basic split, might need refinement)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // For now, let's just check if we can query the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, primary_citizenship')
      .limit(5);
      
    if (usersError) {
      console.error('Error querying users:', usersError);
      return;
    }
    
    console.log('Current users table sample:');
    users.forEach(user => {
      console.log(`- ${user.email}: citizenship = ${user.primary_citizenship || 'not set'}`);
    });
    
    console.log('\n⚠️  Migration SQL has been prepared but not executed.');
    console.log('To run the migration, execute the SQL in your Supabase SQL editor.');
    console.log('File: supabase/migrations/20250111_complete_onboarding_fields_migration.sql');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();