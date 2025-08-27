import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
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