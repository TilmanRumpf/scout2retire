/**
 * Verify that hobbies/activities expansion is working correctly
 * Checking if compound values are properly expanded when saved
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function verifyHobbiesExpansion() {
  console.log('🔍 Verifying hobbies/activities expansion in database...\n');
  
  // Check user_preferences for compound values in activities
  const { data: users, error } = await supabase
    .from('user_preferences')
    .select('user_id, activities, interests, custom_physical, custom_hobbies');
  
  if (error) {
    console.error('❌ Error fetching data:', error);
    return;
  }
  
  console.log(`Found ${users.length} users with preferences\n`);
  
  // Track compound values found
  let issues = [];
  let clean = 0;
  
  // Compound values that should be expanded
  const compoundActivities = ['walking_cycling', 'golf_tennis', 'water_sports', 'water_crafts', 'winter_sports'];
  const compoundInterests = ['cooking_wine', 'music_theater'];
  
  users.forEach(user => {
    let userHasIssue = false;
    
    // Check activities
    if (user.activities && Array.isArray(user.activities)) {
      const foundCompounds = user.activities.filter(a => compoundActivities.includes(a));
      if (foundCompounds.length > 0) {
        issues.push({
          user_id: user.user_id,
          field: 'activities',
          compounds: foundCompounds,
          current: user.activities
        });
        userHasIssue = true;
      }
    }
    
    // Check interests
    if (user.interests && Array.isArray(user.interests)) {
      const foundCompounds = user.interests.filter(i => compoundInterests.includes(i));
      if (foundCompounds.length > 0) {
        issues.push({
          user_id: user.user_id,
          field: 'interests',
          compounds: foundCompounds,
          current: user.interests
        });
        userHasIssue = true;
      }
    }
    
    if (!userHasIssue) {
      clean++;
    }
  });
  
  console.log('📊 Results:');
  console.log(`✅ Clean users (no compound values): ${clean}`);
  console.log(`⚠️  Users with compound values: ${issues.length}\n`);
  
  if (issues.length > 0) {
    console.log('Issues found:');
    issues.forEach(issue => {
      console.log(`\nUser ${issue.user_id}:`);
      console.log(`  Field: ${issue.field}`);
      console.log(`  Compound values: ${issue.compounds.join(', ')}`);
      console.log(`  Current values: ${issue.current.join(', ')}`);
    });
    
    console.log('\n🔧 These compound values should be expanded:');
    console.log('  walking_cycling → walking, cycling');
    console.log('  golf_tennis → golf, tennis, pickleball, badminton');
    console.log('  water_sports → swimming, snorkeling');
    console.log('  water_crafts → kayaking, sailing, boating, etc.');
    console.log('  winter_sports → skiing, cross_country_skiing, snowboarding, etc.');
    console.log('  cooking_wine → cooking, wine');
    console.log('  music_theater → music, theater');
  } else {
    console.log('✅ All users have properly expanded values!');
  }
  
  // Also check if expanded values exist
  console.log('\n📈 Checking for properly expanded values:');
  let expandedStats = {
    walking: 0,
    cycling: 0,
    golf: 0,
    tennis: 0,
    pickleball: 0,
    badminton: 0,
    swimming: 0,
    snorkeling: 0,
    cooking: 0,
    wine: 0,
    music: 0,
    theater: 0
  };
  
  users.forEach(user => {
    if (user.activities) {
      Object.keys(expandedStats).forEach(key => {
        if (user.activities.includes(key)) {
          expandedStats[key]++;
        }
      });
    }
    if (user.interests) {
      Object.keys(expandedStats).forEach(key => {
        if (user.interests.includes(key)) {
          expandedStats[key]++;
        }
      });
    }
  });
  
  console.log('Users with expanded values:');
  Object.entries(expandedStats).forEach(([key, count]) => {
    if (count > 0) {
      console.log(`  ${key}: ${count} users`);
    }
  });
}

verifyHobbiesExpansion();