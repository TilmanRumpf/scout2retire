const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkData() {
  console.log('🔍 Checking onboarding data structure...\n');

  try {
    // Check if tables exist and have data
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .limit(5);

    if (onboardingError) {
      console.log('❌ Error accessing onboarding_responses:', onboardingError.message);
      console.log('   This suggests the table might not exist or has different structure.\n');
    } else {
      console.log(`✅ onboarding_responses table exists with ${onboardingData?.length || 0} records`);
      if (onboardingData?.length > 0) {
        console.log('\n📊 Sample onboarding_responses structure:');
        const sample = onboardingData[0];
        Object.keys(sample).forEach(key => {
          console.log(`  - ${key}: ${typeof sample[key]}`);
          if (key === 'current_status' && sample[key]) {
            console.log(`    - Contents: ${JSON.stringify(sample[key], null, 2).substring(0, 200)}...`);
          }
        });
      }
    }

    console.log('\n---\n');

    // Check user_preferences table
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(5);

    if (prefsError) {
      console.log('❌ Error accessing user_preferences:', prefsError.message);
    } else {
      console.log(`✅ user_preferences table exists with ${prefsData?.length || 0} records`);
      if (prefsData?.length > 0) {
        console.log('\n📊 Sample user_preferences structure:');
        const sample = prefsData[0];
        
        // Check relevant fields
        const relevantFields = [
          'user_id',
          'family_status',
          'primary_citizenship', 
          'secondary_citizenship',
          'partner_primary_citizenship',
          'partner_secondary_citizenship',
          'retirement_status',
          'target_retirement_year',
          'onboarding_completed'
        ];
        
        relevantFields.forEach(field => {
          if (field in sample) {
            console.log(`  - ${field}: ${typeof sample[field]} = ${JSON.stringify(sample[field])}`);
          }
        });
      }
    }

    console.log('\n---\n');

    // Show how data should be structured based on the code
    console.log('📝 Expected data structure from OnboardingCurrentStatus.jsx:\n');
    console.log('formData = {');
    console.log('  retirement_timeline: {');
    console.log('    status: "planning" | "retiring_soon" | "already_retired",');
    console.log('    target_year: number,');
    console.log('    target_month: number,');
    console.log('    target_day: number,');
    console.log('    flexibility: string');
    console.log('  },');
    console.log('  family_situation: "solo" | "couple" | "family",');
    console.log('  pet_owner: ["cat", "dog", "other"],');
    console.log('  citizenship: {');
    console.log('    primary_citizenship: "us" | "uk" | etc,');
    console.log('    dual_citizenship: boolean,');
    console.log('    secondary_citizenship: "us" | "uk" | etc');
    console.log('  },');
    console.log('  partner_citizenship: {  // Only if family_situation === "couple"');
    console.log('    primary_citizenship: "us" | "uk" | etc,');
    console.log('    dual_citizenship: boolean,');
    console.log('    secondary_citizenship: "us" | "uk" | etc');
    console.log('  }');
    console.log('}');

    console.log('\n📝 What gets saved (line 252):\n');
    console.log('cleanedFormData = {');
    console.log('  ...formData,');
    console.log('  family_situation: {');
    console.log('    status: formData.family_situation  // ⚠️ Wrapped in object!');
    console.log('  },');
    console.log('  partner_citizenship: formData.family_situation === "couple" ? {...} : undefined');
    console.log('}');

    console.log('\n⚠️ POTENTIAL MISMATCHES:');
    console.log('1. family_situation is saved as object {status: "solo"} not string "solo"');
    console.log('2. citizenship fields might not align between tables');
    console.log('3. partner_citizenship is conditional but might be expected always');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkData();