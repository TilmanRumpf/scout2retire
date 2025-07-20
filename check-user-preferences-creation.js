import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 Checking user_preferences creation mechanism...\n');

// Skip trigger check - RPC functions might not exist

// Let's check the actual problem with a specific example
console.log('\n🔍 Checking a specific case...');

// Find a user who exists in users but not in user_preferences
const { data: usersWithoutPrefs } = await supabase
  .from('users')
  .select('id, email, created_at')
  .filter('id', 'not.in', '(SELECT user_id FROM user_preferences)')
  .limit(1);

if (usersWithoutPrefs && usersWithoutPrefs.length > 0) {
  const user = usersWithoutPrefs[0];
  console.log(`\n⚠️  Found user without preferences:`);
  console.log(`- ID: ${user.id}`);
  console.log(`- Email: ${user.email}`);
  console.log(`- Created: ${user.created_at}`);
  
  console.log('\n💡 ROOT CAUSE IDENTIFIED:');
  console.log('The signUp function in authUtils.js creates a record in the users table,');
  console.log('but does NOT create a corresponding record in user_preferences table.');
  console.log('When completeOnboarding tries to UPDATE user_preferences, it fails because the record doesn\'t exist.');
  
  console.log('\n🔧 SOLUTION:');
  console.log('1. Modify signUp to also create a user_preferences record');
  console.log('2. OR modify completeOnboarding to INSERT if not exists');
  console.log('3. OR create a database trigger to auto-create user_preferences when user is created');
}

// Check if we can manually create a user_preferences record
console.log('\n🧪 Testing manual user_preferences creation...');
if (usersWithoutPrefs && usersWithoutPrefs.length > 0) {
  const testUserId = usersWithoutPrefs[0].id;
  
  const { data: insertResult, error: insertError } = await supabase
    .from('user_preferences')
    .insert({
      user_id: testUserId,
      onboarding_completed: false
    })
    .select();
  
  if (insertError) {
    console.log('❌ Failed to create user_preferences:', insertError.message);
  } else {
    console.log('✅ Successfully created user_preferences record:', insertResult);
    
    // Clean up test
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', testUserId);
    console.log('🧹 Cleaned up test record');
  }
}

process.exit(0);