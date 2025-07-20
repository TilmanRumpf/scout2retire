import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔧 FIXING MISSING USER_PREFERENCES RECORDS\n');
console.log('=' .repeat(60));

// Get all users
const { data: allUsers } = await supabase
  .from('users')
  .select('id, email, onboarding_completed');

// Get all user_preferences
const { data: allPreferences } = await supabase
  .from('user_preferences')
  .select('user_id');

const prefUserIds = new Set(allPreferences?.map(p => p.user_id) || []);
const usersWithoutPrefs = allUsers?.filter(u => !prefUserIds.has(u.id)) || [];

console.log(`\n📊 Status:`);
console.log(`Total users: ${allUsers?.length || 0}`);
console.log(`Users with preferences: ${prefUserIds.size}`);
console.log(`Users WITHOUT preferences: ${usersWithoutPrefs.length}`);

if (usersWithoutPrefs.length === 0) {
  console.log('\n✅ All users have user_preferences records!');
  process.exit(0);
}

console.log('\n🔧 Creating missing user_preferences records...\n');

for (const user of usersWithoutPrefs) {
  console.log(`Processing: ${user.email}`);
  
  const { data, error } = await supabase
    .from('user_preferences')
    .insert({
      user_id: user.id,
      // If the user already completed onboarding in the users table, 
      // respect that status
      onboarding_completed: user.onboarding_completed || false
    })
    .select();
  
  if (error) {
    console.log(`  ❌ Failed: ${error.message}`);
  } else {
    console.log(`  ✅ Created user_preferences record`);
  }
}

// Verify the fix
console.log('\n📊 Verifying fix...');
const { data: updatedPrefs } = await supabase
  .from('user_preferences')
  .select('user_id');

const updatedPrefUserIds = new Set(updatedPrefs?.map(p => p.user_id) || []);
const stillMissing = allUsers?.filter(u => !updatedPrefUserIds.has(u.id)) || [];

console.log(`\nUsers still missing preferences: ${stillMissing.length}`);

if (stillMissing.length === 0) {
  console.log('\n✅ SUCCESS! All users now have user_preferences records.');
} else {
  console.log('\n⚠️  Some users still missing preferences:');
  stillMissing.forEach(u => console.log(`  - ${u.email}`));
}

console.log('\n' + '=' .repeat(60));
console.log('🏁 FIX COMPLETE');

process.exit(0);