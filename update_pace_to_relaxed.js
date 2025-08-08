import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function updatePaceToRelaxed() {
  console.log('🔄 Updating pace_of_life values from "slow" to "relaxed"...\n');
  
  try {
    // Note: We need to run the SQL through Supabase SQL Editor
    // to drop and recreate constraints. For now, let's check current values
    
    // Check current pace_of_life values
    const { data: checkData1 } = await supabase
      .from('towns')
      .select('pace_of_life')
      .eq('pace_of_life', 'slow');
    
    const { data: checkData2 } = await supabase
      .from('towns')
      .select('pace_of_life_actual')
      .eq('pace_of_life_actual', 'slow');
    
    console.log(`Found ${checkData1?.length || 0} towns with pace_of_life = "slow"`);
    console.log(`Found ${checkData2?.length || 0} towns with pace_of_life_actual = "slow"`);
    
    if ((checkData1?.length || 0) > 0 || (checkData2?.length || 0) > 0) {
      console.log('\n⚠️  Cannot update directly due to database constraints.');
      console.log('Please run the following SQL in Supabase SQL Editor:\n');
      console.log(`-- Drop constraints
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_check;
ALTER TABLE towns DROP CONSTRAINT IF EXISTS towns_pace_of_life_actual_check;

-- Update values
UPDATE towns SET pace_of_life = 'relaxed' WHERE pace_of_life = 'slow';
UPDATE towns SET pace_of_life_actual = 'relaxed' WHERE pace_of_life_actual = 'slow';

-- Add updated constraints
ALTER TABLE towns 
ADD CONSTRAINT towns_pace_of_life_check 
CHECK (pace_of_life IN ('fast', 'moderate', 'relaxed'));

ALTER TABLE towns 
ADD CONSTRAINT towns_pace_of_life_actual_check 
CHECK (pace_of_life_actual IN ('fast', 'moderate', 'relaxed'));`);
    } else {
      console.log('✅ No "slow" values found - database already updated!');
      
      // Verify current distribution
      const { data: verifyData } = await supabase
        .from('towns')
        .select('pace_of_life, pace_of_life_actual')
        .or('pace_of_life.not.is.null,pace_of_life_actual.not.is.null');
      
      const pace1Values = {};
      const pace2Values = {};
      
      verifyData?.forEach(row => {
        if (row.pace_of_life) {
          pace1Values[row.pace_of_life] = (pace1Values[row.pace_of_life] || 0) + 1;
        }
        if (row.pace_of_life_actual) {
          pace2Values[row.pace_of_life_actual] = (pace2Values[row.pace_of_life_actual] || 0) + 1;
        }
      });
      
      console.log('\nCurrent pace_of_life distribution:');
      Object.entries(pace1Values).forEach(([value, count]) => {
        console.log(`  ${value}: ${count} towns`);
      });
      
      console.log('\nCurrent pace_of_life_actual distribution:');
      Object.entries(pace2Values).forEach(([value, count]) => {
        console.log(`  ${value}: ${count} towns`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePaceToRelaxed();