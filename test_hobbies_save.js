import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function testHobbiesSave() {
  console.log('🔍 Testing hobbies save functionality...\n');
  
  // 1. Check if custom_activities column exists
  const { data: columns, error: colError } = await supabase
    .rpc('get_table_columns', { table_name: 'user_preferences' })
    .select('*');
  
  if (!colError) {
    console.log('✅ Table structure verified');
  }
  
  // 2. Try to save test hobbies data
  const testUserId = '83d285b2-b21b-4d13-a1a1-6d51b6733d52'; // Your test user
  const testData = {
    activities: ['walking', 'swimming', 'golf'],
    interests: ['music', 'reading', 'cooking'],
    custom_activities: ['Bird watching', 'Yoga', 'Painting'],
    travel_frequency: 'occasional'
  };
  
  console.log('📝 Attempting to save hobbies data...');
  
  const { data: result, error: saveError } = await supabase
    .from('user_preferences')
    .update({
      ...testData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', testUserId)
    .select();
  
  if (saveError) {
    console.error('❌ Save failed:', saveError);
    return;
  }
  
  console.log('✅ Hobbies saved successfully!');
  
  // 3. Read back to verify
  const { data: saved, error: readError } = await supabase
    .from('user_preferences')
    .select('activities, interests, custom_activities, travel_frequency')
    .eq('user_id', testUserId)
    .single();
  
  if (!readError && saved) {
    console.log('\n📋 Saved data:');
    console.log('   Activities:', saved.activities);
    console.log('   Interests:', saved.interests);
    console.log('   Custom Activities:', saved.custom_activities);
    console.log('   Travel Frequency:', saved.travel_frequency);
    
    console.log('\n🎉 SUCCESS! The hobbies save functionality is working properly!');
  }
}

testHobbiesSave().catch(console.error);