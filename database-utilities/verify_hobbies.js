import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function verifyHobbies() {
  console.log('🔍 Verifying hobbies table setup...\n');
  
  // Count hobbies by category
  const { data: counts, error: countError } = await supabase
    .from('hobbies')
    .select('category')
    .order('category');
  
  if (countError) {
    console.error('❌ Error counting hobbies:', countError);
    return;
  }
  
  const categoryCounts = counts.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  console.log('📊 Hobby counts by category:');
  console.log(`   Activities: ${categoryCounts.activity || 0}`);
  console.log(`   Interests: ${categoryCounts.interest || 0}`);
  console.log(`   Custom: ${categoryCounts.custom || 0}`);
  console.log(`   TOTAL: ${counts.length}\n`);
  
  // Show sample hobbies
  const { data: samples, error: sampleError } = await supabase
    .from('hobbies')
    .select('name, category, description')
    .limit(10);
  
  if (!sampleError && samples) {
    console.log('📝 Sample hobbies:');
    samples.forEach(h => {
      console.log(`   - ${h.name} (${h.category})${h.description ? ': ' + h.description : ''}`);
    });
  }
  
  // Check if tables are accessible
  const { error: userHobbiesError } = await supabase
    .from('user_hobbies')
    .select('id')
    .limit(1);
  
  const { error: townHobbiesError } = await supabase
    .from('towns_hobbies')
    .select('id')
    .limit(1);
  
  console.log('\n✅ Table access check:');
  console.log(`   hobbies table: ${!countError ? '✓' : '✗'}`);
  console.log(`   user_hobbies table: ${!userHobbiesError ? '✓' : '✗'}`);
  console.log(`   town_hobbies table: ${!townHobbiesError ? '✓' : '✗'}`);
  
  if (counts.length === 131) {
    console.log('\n🎉 SUCCESS! All 131 hobbies are in the database!');
  } else {
    console.log(`\n⚠️  Warning: Expected 131 hobbies, found ${counts.length}`);
  }
}

verifyHobbies().catch(console.error);