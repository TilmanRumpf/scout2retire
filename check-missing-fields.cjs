const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkMissingFields() {
  console.log('🔍 Checking for missing fields in user_preferences table...\n');

  try {
    // Get column names from user_preferences
    const { data: sample, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (sample && sample.length > 0) {
      const existingColumns = Object.keys(sample[0]);
      
      console.log('📋 MISSING FIELDS IN user_preferences:\n');
      
      // Fields that should exist based on the code
      const expectedFields = {
        'partner_primary_citizenship': 'For storing partner citizenship when family_status = "couple"',
        'partner_secondary_citizenship': 'For storing partner dual citizenship',
        'target_retirement_month': 'Missing - only has year',
        'target_retirement_day': 'Missing - only has year',
        'pet_owner': 'Array field for pet types ["cat", "dog", "other"]'
      };
      
      Object.entries(expectedFields).forEach(([field, description]) => {
        if (!existingColumns.includes(field)) {
          console.log(`❌ ${field}: ${description}`);
        } else {
          console.log(`✅ ${field}: EXISTS`);
        }
      });
      
      console.log('\n📝 SQL TO ADD MISSING COLUMNS:\n');
      console.log(`ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,
ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT,
ADD COLUMN IF NOT EXISTS target_retirement_month INTEGER,
ADD COLUMN IF NOT EXISTS target_retirement_day INTEGER,
ADD COLUMN IF NOT EXISTS pet_owner TEXT[];`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkMissingFields();