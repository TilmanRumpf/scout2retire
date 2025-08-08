import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeNormalization() {
  const { data: towns } = await supabase
    .from('towns')
    .select('id, name, country, english_proficiency_level')
    .order('english_proficiency_level');

  // Group by proficiency level
  const byLevel = {};
  towns.forEach(t => {
    const level = t.english_proficiency_level || 'null';
    if (!byLevel[level]) byLevel[level] = [];
    byLevel[level].push(t);
  });

  console.log('Current English Proficiency Values:');
  console.log('===================================');
  Object.entries(byLevel).forEach(([level, townList]) => {
    console.log(`\n${level}: ${townList.length} towns`);
    if (townList.length <= 5) {
      townList.forEach(t => console.log(`  - ${t.name}, ${t.country}`));
    }
  });

  console.log('\n\nProposed Normalization:');
  console.log('=======================');
  
  const normalizationMap = {
    'universal': 'native',      // 1 town
    'very high': 'very_high',   // 1 town  
    'widespread': 'high',        // 4 towns
    'limited': 'low',            // 5 towns
    'basic': 'low',              // 24 towns
    'medium': 'moderate',        // 43 towns
    'good': 'high',              // 15 towns
    'excellent': 'very_high'     // 7 towns
  };
  
  Object.entries(normalizationMap).forEach(([old, newVal]) => {
    const count = byLevel[old]?.length || 0;
    console.log(`${old} (${count}) → ${newVal}`);
  });

  console.log('\n\nFinal Standardized Values:');
  console.log('==========================');
  
  // Calculate final counts
  const finalCounts = {
    'native': (byLevel['native']?.length || 0) + (byLevel['universal']?.length || 0),
    'very_high': (byLevel['very_high']?.length || 0) + (byLevel['very high']?.length || 0) + (byLevel['excellent']?.length || 0),
    'high': (byLevel['high']?.length || 0) + (byLevel['widespread']?.length || 0) + (byLevel['good']?.length || 0),
    'moderate': (byLevel['moderate']?.length || 0) + (byLevel['medium']?.length || 0),
    'low': (byLevel['low']?.length || 0) + (byLevel['limited']?.length || 0) + (byLevel['basic']?.length || 0)
  };
  
  let total = 0;
  Object.entries(finalCounts).forEach(([level, count]) => {
    console.log(`${level}: ${count} towns`);
    total += count;
  });
  console.log(`\nTotal: ${total} towns`);
  
  // Show specific towns that need updating
  console.log('\n\nSpecific Towns to Update:');
  console.log('========================');
  
  if (byLevel['universal']) {
    console.log('\nuniversal → native:');
    byLevel['universal'].forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  }
  
  if (byLevel['very high']) {
    console.log('\nvery high → very_high:');
    byLevel['very high'].forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  }
  
  if (byLevel['widespread']) {
    console.log('\nwidespread → high:');
    byLevel['widespread'].forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  }
  
  if (byLevel['limited']) {
    console.log('\nlimited → low:');
    byLevel['limited'].forEach(t => console.log(`  - ${t.name}, ${t.country}`));
  }
}

analyzeNormalization();