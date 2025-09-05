import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function renamePaceOfLife() {
  console.log('🔄 Renaming "slow" to "relaxed" in pace_of_life columns...\n');
  
  // Update pace_of_life column
  const { data: data1, error: error1 } = await supabase
    .from('towns')
    .update({ pace_of_life: 'relaxed' })
    .eq('pace_of_life', 'slow');
  
  if (error1) {
    console.error('❌ Error updating pace_of_life:', error1);
  } else {
    console.log('✅ Updated pace_of_life column');
  }
  
  // Update pace_of_life_actual column
  const { data: data2, error: error2 } = await supabase
    .from('towns')
    .update({ pace_of_life_actual: 'relaxed' })
    .eq('pace_of_life_actual', 'slow');
  
  if (error2) {
    console.error('❌ Error updating pace_of_life_actual:', error2);
  } else {
    console.log('✅ Updated pace_of_life_actual column');
  }
  
  // Verify the changes
  const { data: verifyData, error: verifyError } = await supabase
    .from('towns')
    .select('pace_of_life, pace_of_life_actual')
    .or('pace_of_life.eq.relaxed,pace_of_life_actual.eq.relaxed');
  
  if (!verifyError) {
    console.log(`\n✅ Successfully renamed values in ${verifyData.length} towns`);
  }
}

renamePaceOfLife();