import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 Investigating onboarding_completed issue...\n');

// Check table structures
console.log('📊 Checking table structures...');
const { data: userPrefsColumns } = await supabase
  .rpc('get_table_columns', { table_name: 'user_preferences' });

console.log('\nuser_preferences columns:');
userPrefsColumns?.forEach(col => {
  if (col.column_name === 'onboarding_completed') {
    console.log(`✅ ${col.column_name} (${col.data_type}) - Found!`);
  }
});

// Check users with completed onboarding
const { data: completedUsers, error: completedError } = await supabase
  .from('user_preferences')
  .select('user_id, onboarding_completed, created_at, updated_at')
  .eq('onboarding_completed', true);

console.log(`\n✅ Users with onboarding_completed = true: ${completedUsers?.length || 0}`);

// Check users with incomplete onboarding
const { data: incompleteUsers, error: incompleteError } = await supabase
  .from('user_preferences')
  .select('user_id, onboarding_completed, created_at, updated_at')
  .eq('onboarding_completed', false);

console.log(`❌ Users with onboarding_completed = false: ${incompleteUsers?.length || 0}`);

// Check if there are users missing from user_preferences entirely
const { data: allUsers } = await supabase
  .from('users')
  .select('id');

const { data: allPrefs } = await supabase
  .from('user_preferences')
  .select('user_id');

const userIds = new Set(allUsers?.map(u => u.id) || []);
const prefUserIds = new Set(allPrefs?.map(p => p.user_id) || []);
const missingPrefs = [...userIds].filter(id => !prefUserIds.has(id));

console.log(`\n⚠️  Users missing from user_preferences table: ${missingPrefs.length}`);
if (missingPrefs.length > 0) {
  console.log('Missing user IDs:', missingPrefs.slice(0, 5), '...');
}

// Check a sample user who might have completed onboarding but still has false flag
console.log('\n🔍 Checking for users with complete data but onboarding_completed = false...');
const { data: suspectUsers } = await supabase
  .from('user_preferences')
  .select('user_id, onboarding_completed, total_monthly_budget, retirement_status, regions')
  .eq('onboarding_completed', false)
  .not('total_monthly_budget', 'is', null)
  .not('retirement_status', 'is', null)
  .not('regions', 'is', null)
  .limit(5);

if (suspectUsers && suspectUsers.length > 0) {
  console.log('\n⚠️  Found users with data but onboarding_completed = false:');
  suspectUsers.forEach(user => {
    console.log(`- User ${user.user_id}: has budget, status, and regions but flag is false`);
  });
}

// Check if completeOnboarding function is being called
console.log('\n📝 Potential issues identified:');
console.log('1. The completeOnboarding function updates user_preferences table');
console.log('2. Some users may have completed all steps but the final update failed');
console.log('3. Users missing from user_preferences table entirely');

process.exit(0);