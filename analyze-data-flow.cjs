const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeDataFlow() {
  console.log('🔍 COMPLETE DATA FLOW ANALYSIS\n');
  console.log('=' .repeat(80));

  try {
    // 1. Check user_preferences table columns
    const { data: userPrefs, error: userPrefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (userPrefs && userPrefs.length > 0) {
      console.log('\n📊 USER_PREFERENCES TABLE COLUMNS:');
      const sample = userPrefs[0];
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
        console.log(`  - ${key}: ${type}`);
        if (key.includes('citizenship') || key.includes('family') || key.includes('retirement')) {
          console.log(`    Value: ${JSON.stringify(value)}`);
        }
      });
    }

    // 2. Show actual onboarding_responses data
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('current_status')
      .limit(1);

    if (onboardingData && onboardingData.length > 0) {
      console.log('\n📦 ONBOARDING_RESPONSES current_status DATA:');
      const status = onboardingData[0].current_status;
      console.log(JSON.stringify(status, null, 2));
    }

    console.log('\n' + '=' .repeat(80));
    console.log('\n🔴 KEY FINDINGS:\n');

    console.log('1. DATA STORAGE MISMATCH:');
    console.log('   - onboarding_responses stores: current_status.family_situation = {status: "solo"}');
    console.log('   - user_preferences expects: family_status = "solo" (flat string)');
    console.log('   - Code saves to BOTH tables with DIFFERENT structures!');

    console.log('\n2. CITIZENSHIP MISMATCH:');
    console.log('   - onboarding_responses stores: current_status.citizenship = {primary_citizenship, dual_citizenship, secondary_citizenship}');
    console.log('   - user_preferences expects: primary_citizenship, secondary_citizenship (flat fields)');
    console.log('   - No dual_citizenship field in user_preferences!');

    console.log('\n3. PARTNER CITIZENSHIP:');
    console.log('   - onboarding_responses stores: current_status.partner_citizenship (when couple)');
    console.log('   - user_preferences has: partner_primary_citizenship, partner_secondary_citizenship');
    console.log('   - Field names don\'t match!');

    console.log('\n4. LOADING ISSUE (getOnboardingProgress):');
    console.log('   - Loads from user_preferences (line 171-175)');
    console.log('   - Transforms data expecting: data.family_status (line 240-243)');
    console.log('   - But OnboardingCurrentStatus saves: family_situation = {status: "solo"}');
    console.log('   - This creates: family_situation: {status: {status: "solo"}} 🔴');

    console.log('\n' + '=' .repeat(80));
    console.log('\n✅ SOLUTION:\n');

    console.log('1. FIX OnboardingCurrentStatus.jsx (line 252):');
    console.log('   Change from:');
    console.log('     family_situation: {');
    console.log('       status: formData.family_situation');
    console.log('     }');
    console.log('   To:');
    console.log('     family_situation: formData.family_situation  // Keep as string');

    console.log('\n2. FIX saveUserPreferences call (line 285-301):');
    console.log('   Change field names to match user_preferences table:');
    console.log('     family_status: formData.family_situation  // not family_situation.status');
    console.log('     partner_primary_citizenship: formData.partner_citizenship?.primary_citizenship');
    console.log('     partner_secondary_citizenship: formData.partner_citizenship?.secondary_citizenship');

    console.log('\n3. FIX getOnboardingProgress (line 239-243):');
    console.log('   It\'s already expecting the right structure!');
    console.log('   Just need to fix how data is saved.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeDataFlow();