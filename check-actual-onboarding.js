import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

async function checkOnboarding() {
  console.log('🔍 CHECKING YOUR ACTUAL ONBOARDING DATA\n');
  
  const { data: onboarding } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52')
    .single();
    
  console.log('FULL ONBOARDING STRUCTURE:');
  Object.keys(onboarding || {}).forEach(key => {
    if (key !== 'user_id' && key !== 'id') {
      console.log(`\n${key}:`);
      console.log(JSON.stringify(onboarding[key], null, 2));
    }
  });
  
  // Focus on climate
  console.log('\n\n🌡️ CLIMATE SECTION SPECIFICALLY:');
  console.log('climate_preferences:', JSON.stringify(onboarding?.climate_preferences, null, 2));
  console.log('climate:', JSON.stringify(onboarding?.climate, null, 2));
  
  // Check all climate-related keys
  console.log('\n🔍 ALL KEYS WITH "climate" in name:');
  Object.keys(onboarding || {}).forEach(key => {
    if (key.toLowerCase().includes('climate')) {
      console.log(`${key}:`, JSON.stringify(onboarding[key], null, 2));
    }
  });
}

checkOnboarding();