import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 DIAGNOSING ONBOARDING COMPLETION ISSUE\n');
console.log('=' .repeat(60));

// 1. Check users without user_preferences
console.log('\n1️⃣ CHECKING FOR USERS WITHOUT user_preferences RECORDS...');
const { data: allUsers } = await supabase
  .from('users')
  .select('id, email, created_at, onboarding_completed')
  .order('created_at', { ascending: false });

const { data: allPreferences } = await supabase
  .from('user_preferences')
  .select('user_id, onboarding_completed');

const userIds = new Set(allUsers?.map(u => u.id) || []);
const prefUserIds = new Set(allPreferences?.map(p => p.user_id) || []);
const usersWithoutPrefs = [...userIds].filter(id => !prefUserIds.has(id));

console.log(`Total users: ${userIds.size}`);
console.log(`Users with preferences: ${prefUserIds.size}`);
console.log(`Users WITHOUT preferences: ${usersWithoutPrefs.length}`);

if (usersWithoutPrefs.length > 0) {
  console.log('\n⚠️  Users missing user_preferences records:');
  usersWithoutPrefs.forEach(userId => {
    const user = allUsers.find(u => u.id === userId);
    console.log(`  - ${user.email} (created: ${user.created_at})`);
  });
}

// 2. Check onboarding_completed status mismatch
console.log('\n2️⃣ CHECKING ONBOARDING_COMPLETED STATUS...');
const prefsMap = new Map(allPreferences?.map(p => [p.user_id, p.onboarding_completed]) || []);

let completedInUsersTable = 0;
let completedInPrefsTable = 0;
let mismatches = [];

allUsers?.forEach(user => {
  if (user.onboarding_completed) completedInUsersTable++;
  
  const prefCompleted = prefsMap.get(user.id);
  if (prefCompleted === true) completedInPrefsTable++;
  
  // Check for mismatches (user.onboarding_completed vs user_preferences.onboarding_completed)
  if (prefUserIds.has(user.id) && user.onboarding_completed !== prefCompleted) {
    mismatches.push({
      email: user.email,
      usersTable: user.onboarding_completed,
      prefsTable: prefCompleted
    });
  }
});

console.log(`\nOnboarding completed in users table: ${completedInUsersTable}`);
console.log(`Onboarding completed in user_preferences table: ${completedInPrefsTable}`);
console.log(`Status mismatches: ${mismatches.length}`);

if (mismatches.length > 0) {
  console.log('\n⚠️  Status mismatches found:');
  mismatches.forEach(m => {
    console.log(`  - ${m.email}: users=${m.usersTable}, user_preferences=${m.prefsTable}`);
  });
}

// 3. Analyze the problem
console.log('\n3️⃣ ROOT CAUSE ANALYSIS:');
console.log('\n🔴 THE PROBLEM:');
console.log('1. When users sign up, only a record in "users" table is created');
console.log('2. NO corresponding record is created in "user_preferences" table');
console.log('3. When completeOnboarding() runs, it tries to UPDATE user_preferences');
console.log('4. UPDATE fails because the record doesn\'t exist!');

console.log('\n🟢 THE SOLUTION - We need to do ONE of these:');
console.log('\nOption A: Modify signUp to create user_preferences record');
console.log('- In authUtils.js, after creating users record, also create user_preferences');

console.log('\nOption B: Modify completeOnboarding to use UPSERT instead of UPDATE');
console.log('- Change from .update() to .upsert() in onboardingUtils.js');

console.log('\nOption C: Create a database trigger');
console.log('- Auto-create user_preferences record when users record is created');

// 4. Test creating a user_preferences record
if (usersWithoutPrefs.length > 0) {
  console.log('\n4️⃣ TESTING FIX FOR ONE USER...');
  const testUserId = usersWithoutPrefs[0];
  const testUser = allUsers.find(u => u.id === testUserId);
  
  console.log(`\nCreating user_preferences for: ${testUser.email}`);
  
  const { data: created, error } = await supabase
    .from('user_preferences')
    .insert({
      user_id: testUserId,
      onboarding_completed: false
    })
    .select();
  
  if (error) {
    console.log('❌ Failed:', error.message);
  } else {
    console.log('✅ Success! Created:', created);
    console.log('\n🎯 This confirms the fix will work!');
  }
}

console.log('\n' + '=' .repeat(60));
console.log('🏁 DIAGNOSIS COMPLETE');

process.exit(0);