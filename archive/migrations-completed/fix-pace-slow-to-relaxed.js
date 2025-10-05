#!/usr/bin/env node

/**
 * FIX pace_of_life values: "slow" → "relaxed"
 * To match the allowed values: relaxed, moderate, fast
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

console.log('🔄 FIXING pace_of_life: "slow" → "relaxed"');
console.log('=' .repeat(50));

// Get all user preferences
const { data: users } = await supabase
  .from('onboarding_responses')
  .select('id, culture_preferences');

let fixedCount = 0;
let skippedCount = 0;

for (const user of users) {
  const pace = user.culture_preferences?.lifestyle_preferences?.pace_of_life;
  
  if (pace) {
    let needsUpdate = false;
    let newPace = pace;
    
    if (Array.isArray(pace)) {
      if (pace.includes('slow')) {
        newPace = pace.map(p => p === 'slow' ? 'relaxed' : p);
        needsUpdate = true;
      }
    } else if (pace === 'slow') {
      newPace = 'relaxed';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      const updatedPrefs = {
        ...user.culture_preferences,
        lifestyle_preferences: {
          ...user.culture_preferences.lifestyle_preferences,
          pace_of_life: newPace
        }
      };
      
      const { error } = await supabase
        .from('onboarding_responses')
        .update({ culture_preferences: updatedPrefs })
        .eq('id', user.id);
      
      if (error) {
        console.error(`❌ Error updating user ${user.id}:`, error);
      } else {
        fixedCount++;
        console.log(`  ✅ Fixed user ${user.id}: "slow" → "relaxed"`);
      }
    } else {
      skippedCount++;
    }
  }
}

console.log(`\n📊 RESULTS:`);
console.log(`  ✅ Fixed: ${fixedCount} users`);
console.log(`  ⭕ Skipped: ${skippedCount} users (already correct)`);

// Verify no more "slow" values
const { data: verify } = await supabase
  .from('onboarding_responses')
  .select('culture_preferences');

let hasSlowValues = false;
verify.forEach(u => {
  const pace = u.culture_preferences?.lifestyle_preferences?.pace_of_life;
  if (pace) {
    if (Array.isArray(pace) && pace.includes('slow')) hasSlowValues = true;
    else if (pace === 'slow') hasSlowValues = true;
  }
});

if (hasSlowValues) {
  console.log('\n❌ WARNING: Still found "slow" values!');
} else {
  console.log('\n✅ SUCCESS: No more "slow" values. Only: relaxed, moderate, fast');
}