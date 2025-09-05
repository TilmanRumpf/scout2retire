import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function verifyColumnDropped() {
  console.log('🔍 Verifying tax_rates column has been dropped...\n');
  
  try {
    const { data, error } = await supabase
      .from('towns')
      .select('id, tax_rates')
      .limit(1);
      
    if (error) {
      if (error.code === '42703') {
        console.log('✅ SUCCESS: tax_rates column has been successfully dropped');
        console.log('   Error code 42703 = "column does not exist"');
      } else {
        console.log('❌ Unexpected error:', error);
      }
    } else {
      console.log('⚠️ WARNING: tax_rates column still exists');
      console.log('   Sample data:', data);
      console.log('\n📋 To drop the column manually:');
      console.log('   1. Go to: https://app.supabase.com/project/axlruvvsjepsulcbqlho/sql');
      console.log('   2. Execute: ALTER TABLE towns DROP COLUMN tax_rates;');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyColumnDropped();