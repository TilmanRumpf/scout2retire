/**
 * Rename expat_community_preference to expat_community_size_preference
 * For consistency with towns table which uses expat_community_size
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function renameExpatField() {
  console.log('🔄 Renaming expat_community_preference to expat_community_size_preference...\n');
  
  // First, check current data
  const { data: currentData, error: fetchError } = await supabase
    .from('user_preferences')
    .select('id, expat_community_preference')
    .not('expat_community_preference', 'is', null);
  
  if (fetchError) {
    console.error('❌ Error fetching data:', fetchError);
    return;
  }
  
  console.log(`Found ${currentData.length} users with expat_community_preference data`);
  
  // Show sample data
  if (currentData.length > 0) {
    console.log('\nSample data:');
    currentData.slice(0, 3).forEach(user => {
      console.log(`  User ${user.id.substring(0, 8)}: ${JSON.stringify(user.expat_community_preference)}`);
    });
  }
  
  console.log('\n⚠️  IMPORTANT: Column renaming cannot be done via Supabase API');
  console.log('Please follow these steps to complete the rename:\n');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run this SQL command:');
  console.log('\n--- COPY THIS SQL ---');
  console.log('ALTER TABLE user_preferences');
  console.log('RENAME COLUMN expat_community_preference TO expat_community_size_preference;');
  console.log('--- END SQL ---\n');
  console.log('4. After renaming, update the code references (run the next script)');
  
  // Check code references
  console.log('\n📝 Code files that will need updating:');
  console.log('  - src/pages/onboarding/OnboardingCulture.jsx');
  console.log('  - src/pages/onboarding/OnboardingReview.jsx');
  console.log('  - src/pages/onboarding/OnboardingComplete.jsx');
  console.log('  - src/utils/scoring algorithms (if any reference this field)');
}

renameExpatField();