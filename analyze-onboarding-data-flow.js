import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeOnboardingDataFlow() {
  console.log('=== Analyzing Onboarding Data Flow ===\n');

  // Get a user with incomplete onboarding
  const { data: users } = await supabase
    .from('user_preferences')
    .select('user_id, onboarding_completed')
    .eq('onboarding_completed', false)
    .limit(5);

  for (const user of users || []) {
    console.log(`\nUser: ${user.user_id}`);
    console.log(`onboarding_completed: ${user.onboarding_completed}`);
    
    // Check what data exists in user_preferences (the new location)
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.user_id)
      .single();
    
    // Count how many onboarding fields have data
    const steps = {
      'current_status': !!(prefs.retirement_status || prefs.family_status || prefs.primary_citizenship),
      'region_preferences': !!(prefs.regions?.length || prefs.countries?.length),
      'climate_preferences': !!(prefs.summer_climate_preference?.length || prefs.winter_climate_preference?.length),
      'culture_preferences': !!(prefs.expat_community_preference?.length || prefs.lifestyle_preferences),
      'hobbies': !!(prefs.activities?.length || prefs.interests?.length),
      'administration': !!(prefs.healthcare_quality?.length || prefs.visa_preference?.length),
      'costs': !!(prefs.total_monthly_budget || prefs.max_monthly_rent)
    };
    
    const completedSteps = Object.values(steps).filter(v => v).length;
    console.log(`  Completed steps: ${completedSteps}/7`);
    
    // Show which steps are complete
    Object.entries(steps).forEach(([step, completed]) => {
      console.log(`  - ${step}: ${completed ? '✅' : '❌'}`);
    });
    
    // Check if data exists in old onboarding_responses table
    const { data: oldData } = await supabase
      .from('onboarding_responses')
      .select('current_status, region_preferences, climate_preferences, culture_preferences, hobbies, administration, costs')
      .eq('user_id', user.user_id)
      .single();
    
    if (oldData) {
      console.log('  Old onboarding_responses data exists:');
      const oldSteps = {
        'current_status': !!oldData.current_status,
        'region_preferences': !!oldData.region_preferences,
        'climate_preferences': !!oldData.climate_preferences,
        'culture_preferences': !!oldData.culture_preferences,
        'hobbies': !!oldData.hobbies,
        'administration': !!oldData.administration,
        'costs': !!oldData.costs
      };
      
      Object.entries(oldSteps).forEach(([step, hasData]) => {
        console.log(`    - ${step}: ${hasData ? '✅' : '❌'}`);
      });
    }
  }
  
  console.log('\n=== Summary ===');
  console.log('The issue is that:');
  console.log('1. saveOnboardingStep saves to onboarding_responses table');
  console.log('2. getOnboardingProgress reads from user_preferences table');
  console.log('3. Data exists in different locations causing confusion');
  console.log('4. completeOnboarding was failing due to incorrect upsert syntax');
}

analyzeOnboardingDataFlow().catch(console.error);