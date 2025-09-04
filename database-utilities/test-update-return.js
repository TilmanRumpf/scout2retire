#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Test with service role key first to see expected behavior
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function testUpdateReturn() {
  console.log('🔍 TESTING UPDATE RETURN BEHAVIOR');
  console.log('=' .repeat(60));
  
  try {
    // 1. Read current data
    console.log('\n1. CURRENT DATA:');
    const { data: currentData, error: readError } = await supabase
      .from('user_preferences')
      .select('activities, interests, updated_at')
      .eq('user_id', USER_ID)
      .single();
    
    console.log('Current activities:', currentData?.activities);
    
    // 2. Update WITHOUT select() to see what happens
    console.log('\n2. UPDATE WITHOUT SELECT:');
    const testData1 = {
      activities: ['test1', 'test2'],
      updated_at: new Date().toISOString()
    };
    
    const { data: noSelectResult, error: noSelectError } = await supabase
      .from('user_preferences')
      .update(testData1)
      .eq('user_id', USER_ID);
    
    console.log('Update without select - error:', noSelectError);
    console.log('Update without select - data:', noSelectResult);
    console.log('Update without select - data is null?', noSelectResult === null);
    console.log('Update without select - data is empty array?', Array.isArray(noSelectResult) && noSelectResult.length === 0);
    
    // 3. Update WITH select() to see what happens
    console.log('\n3. UPDATE WITH SELECT:');
    const testData2 = {
      activities: ['test3', 'test4'],
      updated_at: new Date().toISOString()
    };
    
    const { data: withSelectResult, error: withSelectError } = await supabase
      .from('user_preferences')
      .update(testData2)
      .eq('user_id', USER_ID)
      .select();
    
    console.log('Update with select - error:', withSelectError);
    console.log('Update with select - data:', withSelectResult);
    console.log('Update with select - data is array?', Array.isArray(withSelectResult));
    console.log('Update with select - data length:', withSelectResult?.length);
    
    // 4. Update with select('*') explicitly
    console.log('\n4. UPDATE WITH SELECT(*)');
    const testData3 = {
      activities: ['test5', 'test6'],
      updated_at: new Date().toISOString()
    };
    
    const { data: selectStarResult, error: selectStarError } = await supabase
      .from('user_preferences')
      .update(testData3)
      .eq('user_id', USER_ID)
      .select('*');
    
    console.log('Update with select(*) - error:', selectStarError);
    console.log('Update with select(*) - data:', selectStarResult);
    console.log('Update with select(*) - data is array?', Array.isArray(selectStarResult));
    console.log('Update with select(*) - data length:', selectStarResult?.length);
    
    // 5. Restore original data
    console.log('\n5. RESTORING ORIGINAL DATA:');
    await supabase
      .from('user_preferences')
      .update(currentData)
      .eq('user_id', USER_ID);
    
    console.log('✅ Original data restored');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUpdateReturn().catch(console.error);
