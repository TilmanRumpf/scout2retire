const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function updateCoffeeAndGetNext() {
  console.log('🔄 Updating Coffee Culture...');
  
  // Update Coffee Culture
  const { error: updateError } = await supabase
    .from('hobbies')
    .update({
      category: 'interest',
      verification_method: 'universal',
      verification_query: null,
      verification_notes: 'Coffee available globally. Quality cafes enhance experience but not required.'
    })
    .eq('name', 'Coffee Culture');

  if (updateError) {
    console.error('❌ Error updating Coffee Culture:', updateError);
    return;
  }

  console.log('✅ Coffee Culture updated successfully');

  // Get next unprocessed hobby
  console.log('\n🔍 Getting next unprocessed hobby...');
  
  const { data: nextHobby, error: selectError } = await supabase
    .from('hobbies')
    .select('id, name, category, group_name, is_universal, description')
    .is('verification_method', null)
    .order('name')
    .limit(1);

  if (selectError) {
    console.error('❌ Error getting next hobby:', selectError);
    return;
  }

  if (nextHobby && nextHobby.length > 0) {
    console.log('\n📋 Next unprocessed hobby:');
    console.log('=====================================');
    const hobby = nextHobby[0];
    console.log(`ID: ${hobby.id}`);
    console.log(`Name: ${hobby.name}`);
    console.log(`Category: ${hobby.category}`);
    console.log(`Group: ${hobby.group_name}`);
    console.log(`Universal: ${hobby.is_universal}`);
    console.log(`Description: ${hobby.description || 'None'}`);
  } else {
    console.log('🎉 No more unprocessed hobbies found!');
  }
}

updateCoffeeAndGetNext().then(() => {
  process.exit(0);
}).catch(console.error);