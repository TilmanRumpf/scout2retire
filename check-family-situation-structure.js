import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('🔍 CHECKING FAMILY_SITUATION DATA STRUCTURE FOR RENDER BUG');
console.log('========================================================\n');

async function checkFamilySituationData() {
  try {
    const { data: onboardingData, error } = await supabase
      .from('onboarding_responses')
      .select('current_status')
      .not('current_status', 'is', null);
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 Found ${onboardingData?.length || 0} users with current_status data\n`);
    
    onboardingData?.forEach((record, index) => {
      const familySituation = record.current_status?.family_situation;
      
      console.log(`👤 User ${index + 1}:`);
      console.log('  family_situation type:', typeof familySituation);
      console.log('  family_situation value:', familySituation);
      
      if (typeof familySituation === 'object' && familySituation !== null) {
        console.log('  family_situation.status:', familySituation.status);
        console.log('  Has status property:', 'status' in familySituation);
        
        // Simulate the render logic from OnboardingReview.jsx
        const renderValue = familySituation?.status || familySituation || 'Not specified';
        console.log('  Would render as:', renderValue);
        console.log('  Render type:', typeof renderValue);
        
        if (typeof renderValue === 'object') {
          console.log('  🚨 FOUND THE BUG! This would cause React render error');
          console.log('  Object contents:', JSON.stringify(renderValue, null, 4));
        }
      }
      console.log('');
    });
    
    console.log('🎯 DIAGNOSIS:');
    console.log('The bug is likely in OnboardingReview.jsx line 107:');
    console.log('{data.family_situation?.status || data.family_situation || "Not specified"}');
    console.log('');
    console.log('If family_situation is an object without a status property,');
    console.log('React will try to render the entire object, causing the error.');
    
  } catch (e) {
    console.log('❌ Error in check:', e.message);
  }
}

checkFamilySituationData();