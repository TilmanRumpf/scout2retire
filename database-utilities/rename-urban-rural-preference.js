#!/usr/bin/env node

/**
 * RENAME urban_rural to urban_rural_preference in user preferences
 * For consistency with other preference fields
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔄 RENAMING urban_rural to urban_rural_preference');
console.log('=' .repeat(50));

// Get all user preferences
const { data: users, error: fetchError } = await supabase
  .from('onboarding_responses')
  .select('id, culture_preferences')
  .not('culture_preferences', 'is', null);

if (fetchError) {
  console.error('❌ Error fetching users:', fetchError);
  process.exit(1);
}

console.log(`\n📊 Processing ${users.length} user preferences`);

let updated = 0;
let skipped = 0;

for (const user of users) {
  if (user.culture_preferences?.lifestyle_preferences?.urban_rural) {
    // Create updated preferences
    const updatedPrefs = {
      ...user.culture_preferences,
      lifestyle_preferences: {
        ...user.culture_preferences.lifestyle_preferences,
        urban_rural_preference: user.culture_preferences.lifestyle_preferences.urban_rural,
        // Remove old field
        urban_rural: undefined
      }
    };
    
    // Remove undefined
    delete updatedPrefs.lifestyle_preferences.urban_rural;
    
    // Update database
    const { error } = await supabase
      .from('onboarding_responses')
      .update({ culture_preferences: updatedPrefs })
      .eq('id', user.id);
    
    if (error) {
      console.error(`❌ Error updating user ${user.id}:`, error);
    } else {
      updated++;
      if (updated <= 3) {
        console.log(`  ✅ Updated user ${user.id}: urban_rural → urban_rural_preference`);
      }
    }
  } else {
    skipped++;
  }
}

console.log(`\n📊 RESULTS:`);
console.log(`  ✅ Updated: ${updated} users`);
console.log(`  ⭕ Skipped: ${skipped} users (no urban_rural field)`);

// Verify the change
const { data: verify } = await supabase
  .from('onboarding_responses')
  .select('culture_preferences')
  .limit(1);

if (verify && verify[0]?.culture_preferences?.lifestyle_preferences) {
  const prefs = verify[0].culture_preferences.lifestyle_preferences;
  console.log('\n✅ VERIFICATION:');
  console.log('  New field exists:', 'urban_rural_preference' in prefs);
  console.log('  Old field gone:', !('urban_rural' in prefs));
}