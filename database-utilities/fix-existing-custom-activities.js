#!/usr/bin/env node

/**
 * One-time migration to fix existing users who have compound buttons in 'activities'
 * but missing 'custom_activities' field (due to old save logic)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function fixExistingCustomActivities() {
  console.log('🔧 FIXING EXISTING USERS WITH MISSING custom_activities');
  console.log('=' .repeat(60));
  
  // Find all users with null custom_activities but have activities/interests
  const { data: usersToFix, error } = await supabase
    .from('user_preferences')
    .select('user_id, activities, interests, custom_activities')
    .or('custom_activities.is.null,custom_activities.eq.[]');
  
  if (error) {
    console.error('Error finding users to fix:', error);
    return;
  }
  
  console.log(`Found ${usersToFix.length} users to check`);
  
  const compoundButtonIds = [
    'walking_cycling', 'golf_tennis', 'water_sports', 'water_crafts', 'winter_sports',
    'gardening', 'arts', 'music_theater', 'cooking_wine', 'history'
  ];
  
  let fixedCount = 0;
  
  for (const user of usersToFix) {
    // Check if activities/interests contain compound button IDs
    const hasCompoundButtons = user.activities?.some(a => compoundButtonIds.includes(a)) ||
                               user.interests?.some(i => compoundButtonIds.includes(i));
    
    if (hasCompoundButtons) {
      // Extract compound button IDs from activities
      const activityButtons = user.activities?.filter(a => compoundButtonIds.includes(a)) || [];
      const interestButtons = user.interests?.filter(i => compoundButtonIds.includes(i)) || [];
      
      // Build custom_activities array
      const customActivities = [
        ...activityButtons,
        ...interestButtons.map(i => `interest_${i}`)
      ];
      
      console.log(`\nFixing user ${user.user_id.substring(0, 8)}...`);
      console.log('  Current activities:', user.activities);
      console.log('  Current interests:', user.interests);
      console.log('  Setting custom_activities to:', customActivities);
      
      // Update the user's custom_activities
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ custom_activities: customActivities })
        .eq('user_id', user.user_id);
      
      if (updateError) {
        console.error(`  ❌ Failed to update user ${user.user_id}:`, updateError);
      } else {
        console.log(`  ✅ Fixed user ${user.user_id.substring(0, 8)}`);
        fixedCount++;
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 MIGRATION COMPLETE`);
  console.log(`Fixed ${fixedCount} users`);
  
  if (fixedCount > 0) {
    console.log('\n✅ Users now have proper custom_activities field for UI reconstruction');
  }
}

// Run the migration
fixExistingCustomActivities().catch(console.error);