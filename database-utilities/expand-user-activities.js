/**
 * Expand compound activity values in user_preferences
 * e.g., golf_tennis → [golf, tennis, pickleball, badminton]
 */

import { createClient } from '@supabase/supabase-js';
import { expandCompoundValues } from '../src/utils/dataTransformations.js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function expandUserActivities() {
  console.log('🎯 Expanding compound activity values in user preferences...\n');
  
  // Get all users with activities
  const { data: users, error } = await supabase
    .from('user_preferences')
    .select('id, user_id, activities, interests, custom_hobbies');
  
  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }
  
  console.log(`Found ${users.length} users to process\n`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    let needsUpdate = false;
    const updates = {};
    
    // Check and expand activities
    if (user.activities && Array.isArray(user.activities)) {
      const hasCompounds = user.activities.some(a => 
        ['golf_tennis', 'water_sports', 'water_crafts', 'winter_sports', 'walking_cycling'].includes(a)
      );
      
      if (hasCompounds) {
        const expanded = expandCompoundValues('activities', user.activities);
        updates.activities = expanded;
        needsUpdate = true;
        
        console.log(`User ${user.user_id}:`);
        console.log(`  Before: ${user.activities.join(', ')}`);
        console.log(`  After:  ${expanded.join(', ')}`);
      }
    }
    
    // Check and expand interests
    if (user.interests && Array.isArray(user.interests)) {
      const hasCompounds = user.interests.some(i => 
        ['cooking_wine', 'music_theater'].includes(i)
      );
      
      if (hasCompounds) {
        const expanded = expandCompoundValues('interests', user.interests);
        updates.interests = expanded;
        needsUpdate = true;
        
        console.log(`User ${user.user_id} interests:`);
        console.log(`  Before: ${user.interests.join(', ')}`);
        console.log(`  After:  ${expanded.join(', ')}`);
      }
    }
    
    // Update if needed
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', user.id);
      
      if (updateError) {
        console.error(`❌ Error updating user ${user.user_id}:`, updateError);
        errorCount++;
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ Successfully updated: ${updatedCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} users`);
  }
  
  // Verify the results
  const { data: verification } = await supabase
    .from('user_preferences')
    .select('activities')
    .not('activities', 'is', null);
  
  const allActivities = new Set();
  verification.forEach(u => {
    if (Array.isArray(u.activities)) {
      u.activities.forEach(a => allActivities.add(a));
    }
  });
  
  const remaining = Array.from(allActivities).filter(a => 
    ['golf_tennis', 'water_sports', 'water_crafts', 'winter_sports', 'walking_cycling', 'music_theater', 'cooking_wine'].includes(a)
  );
  
  if (remaining.length > 0) {
    console.log('\n⚠️  Compound values still remaining:', remaining.join(', '));
  } else {
    console.log('\n✅ All compound values successfully expanded!');
  }
}

expandUserActivities();