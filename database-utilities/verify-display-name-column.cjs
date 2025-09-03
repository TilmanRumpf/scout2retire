const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function verifyDisplayNameColumn() {
  console.log('🔍 Verifying display_name column in hobbies table...\n');
  
  try {
    // Method 1: Try to select the column directly
    console.log('📋 Method 1: Attempting to select display_name column...');
    const { data: testData, error: testError } = await supabase
      .from('hobbies')
      .select('id, name, display_name')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column "display_name" does not exist')) {
        console.log('❌ display_name column does NOT exist');
        console.log('');
        console.log('🔧 TO ADD THE COLUMN:');
        console.log('1. Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql');
        console.log('2. Execute this SQL:');
        console.log('   ALTER TABLE hobbies ADD COLUMN display_name TEXT;');
        console.log('3. Run this script again to verify');
        return false;
      } else {
        console.log('❌ Unexpected error:', testError.message);
        return false;
      }
    }
    
    console.log('✅ display_name column exists and is accessible');
    
    // Method 2: Get full table structure
    console.log('\n📊 Method 2: Getting full table structure...');
    const { data: fullData, error: fullError } = await supabase
      .from('hobbies')
      .select('*')
      .limit(1);
    
    if (fullError) {
      console.log('❌ Error getting table structure:', fullError.message);
      return false;
    }
    
    if (fullData && fullData.length > 0) {
      const columns = Object.keys(fullData[0]);
      console.log('Current hobbies table columns:');
      columns.forEach((col, index) => {
        const marker = col === 'display_name' ? '← NEW!' : '';
        console.log(`  ${index + 1}. ${col} ${marker}`);
      });
      
      const hasDisplayName = columns.includes('display_name');
      console.log(`\n📈 Total columns: ${columns.length}`);
      console.log(`🎯 display_name present: ${hasDisplayName ? '✅ YES' : '❌ NO'}`);
      
      if (hasDisplayName) {
        console.log('\n🎉 SUCCESS: display_name column has been successfully added!');
        console.log('\n💡 Next steps:');
        console.log('   - You can now populate display_name values for hobbies');
        console.log('   - Consider updating the frontend to use display_name when available');
        console.log('   - display_name can be different from the internal "name" field');
        return true;
      } else {
        console.log('\n❌ Column verification failed');
        return false;
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Run the verification
verifyDisplayNameColumn()
  .then(success => {
    if (success) {
      console.log('\n✅ Verification completed successfully');
      process.exit(0);
    } else {
      console.log('\n❌ Verification failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('❌ Script error:', error.message);
    process.exit(1);
  });