import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
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