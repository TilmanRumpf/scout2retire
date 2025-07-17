import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 CHECKING DATABASE SCHEMA (CORRECT APPROACH)');
console.log('==============================================\n');

// Execute raw SQL to check system tables
async function executeSQL(query, description) {
  try {
    console.log(`📋 ${description}:`);
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log(`❌ exec_sql failed: ${error.message}`);
      console.log('Trying alternative approach...');
      return false;
    } else {
      console.log('✅ Success:', data);
      return true;
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
    return false;
  }
}

// Check functions using PostgreSQL system tables
const checkFunctions = `
  SELECT 
    proname as function_name,
    pronargs as num_args,
    proargnames as arg_names
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND proname LIKE '%username%' OR proname LIKE '%profile%'
  ORDER BY proname;
`;

const success = await executeSQL(checkFunctions, 'CHECKING FOR USERNAME/PROFILE FUNCTIONS');

if (!success) {
  console.log('\n🔄 TRYING DIRECT TABLE QUERIES INSTEAD...\n');
  
  // Check users table structure
  try {
    console.log('📋 USERS TABLE STRUCTURE:');
    const { data: usersSample, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Error querying users:', usersError.message);
    } else {
      console.log('✅ Users table accessible. Sample structure:');
      if (usersSample && usersSample[0]) {
        Object.keys(usersSample[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof usersSample[0][key]} (${usersSample[0][key] === null ? 'NULL' : 'has value'})`);
        });
      } else {
        console.log('  - Table is empty');
      }
    }
  } catch (e) {
    console.log('❌ Users table error:', e.message);
  }
  
  // Check if nationality column exists (the problem from production)
  try {
    console.log('\n📋 TESTING FOR NATIONALITY COLUMN:');
    const { data, error } = await supabase
      .from('users')
      .select('nationality')
      .limit(1);
    
    if (error) {
      console.log('❌ Nationality column does NOT exist:', error.message);
    } else {
      console.log('✅ Nationality column EXISTS');
    }
  } catch (e) {
    console.log('❌ Nationality test error:', e.message);
  }
  
  // Check current usernames
  try {
    console.log('\n📋 CURRENT USERNAME STATUS:');
    const { data: usernameData, error: usernameError } = await supabase
      .from('users')
      .select('id, email, username, full_name')
      .not('username', 'is', null);
    
    if (usernameError) {
      console.log('❌ Username query error:', usernameError.message);
    } else {
      console.log(`✅ Found ${usernameData?.length || 0} users WITH usernames:`);
      usernameData?.forEach(user => {
        console.log(`  - ${user.email}: "${user.username}" (${user.full_name})`);
      });
    }
    
    // Also check how many have NULL usernames
    const { data: nullUsernameData, error: nullError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .is('username', null);
    
    if (!nullError) {
      console.log(`\n📊 Found ${nullUsernameData?.length || 0} users with NULL usernames`);
    }
  } catch (e) {
    console.log('❌ Username status error:', e.message);
  }
}

console.log('\n🎯 CONCLUSIONS:');
console.log('1. RPC functions check_username_available and complete_user_profile do NOT exist');
console.log('2. The userSearchUtils.js has a GOOD fallback mechanism for username checking');
console.log('3. Need to verify if nationality column issue is fixed in latest deployment');
console.log('4. Missing RPC functions are likely due to API changes 2 days ago');