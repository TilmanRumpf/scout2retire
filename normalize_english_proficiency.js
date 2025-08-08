import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function normalizeEnglishProficiency() {
  console.log('Normalizing English Proficiency Levels\n');
  console.log('=' .repeat(50));
  
  // Define normalization mappings
  const updates = [
    { from: 'universal', to: 'native', expectedCount: 1 },
    { from: 'very_high', to: 'high', expectedCount: 17 },
    { from: 'very high', to: 'high', expectedCount: 1 },
    { from: 'excellent', to: 'high', expectedCount: 7 },
    { from: 'good', to: 'high', expectedCount: 15 },
    { from: 'widespread', to: 'high', expectedCount: 4 },
    { from: 'medium', to: 'moderate', expectedCount: 43 },
    { from: 'basic', to: 'low', expectedCount: 24 },
    { from: 'limited', to: 'low', expectedCount: 5 }
  ];
  
  let totalUpdated = 0;
  
  for (const update of updates) {
    console.log(`\nUpdating "${update.from}" → "${update.to}"...`);
    
    const { data, error } = await supabase
      .from('towns')
      .update({ english_proficiency_level: update.to })
      .eq('english_proficiency_level', update.from)
      .select();
    
    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      const count = data?.length || 0;
      totalUpdated += count;
      
      if (count === update.expectedCount) {
        console.log(`  ✅ Updated ${count} towns (as expected)`);
      } else {
        console.log(`  ⚠️  Updated ${count} towns (expected ${update.expectedCount})`);
      }
      
      // Show specific towns for smaller updates
      if (count <= 5 && count > 0) {
        data.forEach(town => {
          console.log(`     - ${town.name}, ${town.country}`);
        });
      }
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`Total towns updated: ${totalUpdated}`);
  
  // Verify final distribution
  console.log('\nVerifying final distribution...\n');
  
  const { data: finalData } = await supabase
    .from('towns')
    .select('english_proficiency_level');
  
  const distribution = {};
  finalData.forEach(town => {
    const level = town.english_proficiency_level || 'null';
    distribution[level] = (distribution[level] || 0) + 1;
  });
  
  console.log('Final Distribution:');
  console.log('-'.repeat(30));
  const order = ['native', 'high', 'moderate', 'low'];
  order.forEach(level => {
    if (distribution[level]) {
      const percentage = ((distribution[level] / finalData.length) * 100).toFixed(1);
      console.log(`${level.padEnd(10)}: ${String(distribution[level]).padStart(3)} towns (${percentage}%)`);
    }
  });
  
  // Check for any unexpected values
  const unexpected = Object.keys(distribution).filter(k => !order.includes(k));
  if (unexpected.length > 0) {
    console.log('\n⚠️  Unexpected values found:');
    unexpected.forEach(val => {
      console.log(`  ${val}: ${distribution[val]} towns`);
    });
  } else {
    console.log('\n✅ All values successfully normalized to 4 standard levels!');
  }
}

normalizeEnglishProficiency();