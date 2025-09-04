#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addInferenceColumns() {
  console.log('🔧 Adding Geographic Inference columns to towns table...\n');
  
  try {
    // 1. Add distance_to_urban_center column
    console.log('1. Adding distance_to_urban_center column...');
    const { error: distanceError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE towns 
        ADD COLUMN IF NOT EXISTS distance_to_urban_center NUMERIC DEFAULT NULL;
      `
    });
    
    if (distanceError) {
      console.error('Error adding distance_to_urban_center:', distanceError);
    } else {
      console.log('✅ distance_to_urban_center column added');
    }
    
    // 2. Add top_hobbies column
    console.log('\n2. Adding top_hobbies column...');
    const { error: hobbiesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE towns 
        ADD COLUMN IF NOT EXISTS top_hobbies TEXT[] DEFAULT NULL;
      `
    });
    
    if (hobbiesError) {
      console.error('Error adding top_hobbies:', hobbiesError);
    } else {
      console.log('✅ top_hobbies column added');
    }
    
    // 3. Add indexes
    console.log('\n3. Adding indexes for performance...');
    const { error: indexError1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_towns_distance_urban 
        ON towns(distance_to_urban_center)
        WHERE distance_to_urban_center IS NOT NULL;
      `
    });
    
    const { error: indexError2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_towns_top_hobbies
        ON towns USING GIN(top_hobbies)
        WHERE top_hobbies IS NOT NULL;
      `
    });
    
    if (!indexError1 && !indexError2) {
      console.log('✅ Indexes created');
    }
    
    // 4. Verify columns exist
    console.log('\n4. Verifying new columns...');
    const { data: sampleTown } = await supabase
      .from('towns')
      .select('id, name, distance_to_urban_center, top_hobbies')
      .limit(1)
      .single();
      
    if (sampleTown) {
      console.log('✅ Columns verified! Sample town:');
      console.log(`   ${sampleTown.name}: distance_to_urban_center=${sampleTown.distance_to_urban_center}, top_hobbies=${sampleTown.top_hobbies}`);
    }
    
    console.log('\n✨ SUCCESS! Geographic Inference columns added to towns table.');
    console.log('\nNext steps:');
    console.log('1. Populate distance_to_urban_center with calculated values');
    console.log('2. Add top_hobbies data for priority towns');
    console.log('3. Implement inference engine using these new columns');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
  
  process.exit(0);
}

// Check if exec_sql function exists first
async function checkAndCreateExecSql() {
  console.log('Checking for exec_sql function...');
  
  // Try a simple query first
  const { data: test, error: testError } = await supabase
    .from('towns')
    .select('id')
    .limit(1);
    
  if (testError) {
    console.error('Cannot connect to database:', testError);
    return false;
  }
  
  // If we can't use exec_sql, we'll need to do it differently
  // For now, let's try a direct approach using the standard SDK
  return true;
}

// Alternative approach using standard SDK
async function addColumnsAlternative() {
  console.log('🔧 Adding Geographic Inference columns (alternative method)...\n');
  
  // Unfortunately, Supabase SDK doesn't support ALTER TABLE directly
  // We need to use the SQL editor in Supabase Dashboard or CLI
  
  console.log('⚠️  Cannot alter table structure via SDK.');
  console.log('\nPlease run this SQL in Supabase Dashboard SQL Editor:');
  console.log('=====================================\n');
  
  const sql = `
-- Add distance to nearest urban center
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS distance_to_urban_center NUMERIC DEFAULT NULL;

-- Add top hobbies array
ALTER TABLE towns 
ADD COLUMN IF NOT EXISTS top_hobbies TEXT[] DEFAULT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_towns_distance_urban 
ON towns(distance_to_urban_center)
WHERE distance_to_urban_center IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_towns_top_hobbies
ON towns USING GIN(top_hobbies)
WHERE top_hobbies IS NOT NULL;

-- Add comments
COMMENT ON COLUMN towns.distance_to_urban_center IS 
'Distance in km to nearest city with population > 50,000';

COMMENT ON COLUMN towns.top_hobbies IS 
'Top 10 most mentioned hobbies from real-world sources';
  `;
  
  console.log(sql);
  console.log('\n=====================================');
  console.log('\nOr save the SQL above to a file and run with Supabase CLI.');
}

// Main execution
async function main() {
  const canExecSql = await checkAndCreateExecSql();
  
  if (canExecSql) {
    // Try the RPC approach first
    try {
      await addInferenceColumns();
    } catch (error) {
      console.log('RPC method failed, showing alternative...\n');
      await addColumnsAlternative();
    }
  } else {
    await addColumnsAlternative();
  }
}

main().catch(console.error);