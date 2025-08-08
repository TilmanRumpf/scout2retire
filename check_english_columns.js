import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkEnglishColumns() {
  const { data: towns } = await supabase
    .from('towns')
    .select('english_proficiency, english_proficiency_level');

  const total = towns.length;

  // Count populated fields
  const proficiency_populated = towns.filter(t => t.english_proficiency !== null && t.english_proficiency !== '').length;
  const proficiency_level_populated = towns.filter(t => t.english_proficiency_level !== null && t.english_proficiency_level !== '').length;

  console.log('English Proficiency Column Analysis:');
  console.log('=====================================');
  console.log(`Total towns: ${total}`);
  console.log(`\nenglish_proficiency: ${proficiency_populated}/${total} (${((proficiency_populated/total)*100).toFixed(1)}%)`);
  console.log(`english_proficiency_level: ${proficiency_level_populated}/${total} (${((proficiency_level_populated/total)*100).toFixed(1)}%)`);

  // Get unique values from english_proficiency_level
  const uniqueValues = new Set();
  towns.forEach(t => {
    if (t.english_proficiency_level) uniqueValues.add(t.english_proficiency_level);
  });

  console.log('\nUnique values in english_proficiency_level:');
  Array.from(uniqueValues).sort().forEach(v => {
    const count = towns.filter(t => t.english_proficiency_level === v).length;
    console.log(`  ${v}: ${count} towns`);
  });
}

checkEnglishColumns();