import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function checkRemaining() {
  const { data: remaining, error } = await supabase
    .from('towns')
    .select('id, name, country, population')
    .is('english_speaking_doctors', null);
    
  console.log('Remaining towns without english_speaking_doctors data:');
  remaining?.forEach(t => {
    console.log(`- ${t.name}, ${t.country} (pop: ${t.population})`);
  });
  
  // Quick fix for these
  if (remaining && remaining.length > 0) {
    console.log('\nFixing remaining towns...');
    
    for (const town of remaining) {
      // Default logic: major cities YES, small towns NO
      const hasEnglishDocs = town.population > 100000;
      
      const { error } = await supabase
        .from('towns')
        .update({ english_speaking_doctors: hasEnglishDocs })
        .eq('id', town.id);
        
      if (!error) {
        console.log(`✅ ${town.name}: ${hasEnglishDocs ? 'YES' : 'NO'}`);
      }
    }
  }
}

checkRemaining();