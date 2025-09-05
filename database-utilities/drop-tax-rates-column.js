import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'process.env.SUPABASE_SERVICE_ROLE_KEY'
);

async function dropTaxRatesColumn() {
  console.log('🔍 Checking for tax_rates column in towns table...');
  
  try {
    // First, check if the column exists by trying to select it
    const { data: testData, error: columnError } = await supabase
      .from('towns')
      .select('tax_rates')
      .limit(1);

    if (columnError) {
      if (columnError.code === '42703') {
        console.log('✅ tax_rates column does not exist - nothing to drop');
        return;
      } else {
        console.error('❌ Error checking for column:', columnError);
        return;
      }
    }

    console.log('📋 Found tax_rates column, proceeding with drop...');

    // Drop the column using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE towns DROP COLUMN tax_rates;'
    });

    if (error) {
      console.error('❌ RPC method failed:', error);
      console.log('Trying alternative REST API approach...');
      
      // Alternative: Use the REST API directly for DDL
      const response = await fetch('https://axlruvvsjepsulcbqlho.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'process.env.SUPABASE_SERVICE_ROLE_KEY',
          'Authorization': 'Bearer process.env.SUPABASE_SERVICE_ROLE_KEY'
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE towns DROP COLUMN tax_rates;'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ Column dropped successfully via REST API');
    } else {
      console.log('✅ Column dropped successfully via RPC');
    }

    // Verify the column is gone by trying to select it again
    const { data: verifyData, error: verifyError } = await supabase
      .from('towns')
      .select('tax_rates')
      .limit(1);

    if (verifyError) {
      if (verifyError.code === '42703') {
        console.log('✅ Verified: tax_rates column has been successfully removed');
      } else {
        console.error('❌ Error verifying column drop:', verifyError);
      }
    } else {
      console.log('⚠️ Warning: Column may still exist - selection succeeded');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    // Provide manual SQL as fallback
    console.log('\n📋 Manual SQL to execute if needed:');
    console.log('ALTER TABLE towns DROP COLUMN tax_rates;');
    console.log('\n📋 Verification SQL:');
    console.log(`SELECT column_name FROM information_schema.columns 
WHERE table_name = 'towns' AND column_name = 'tax_rates';`);
  }
}

// Run the function
dropTaxRatesColumn()
  .then(() => {
    console.log('🏁 Operation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });