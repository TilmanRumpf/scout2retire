import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeOnboardingData() {
  console.log('🔍 Analyzing onboarding_responses table...\n');

  // Get all onboarding responses
  const { data: responses, error } = await supabase
    .from('onboarding_responses')
    .select('*');

  if (error) {
    console.error('Error fetching onboarding responses:', error);
    return;
  }

  console.log(`📊 Total onboarding responses: ${responses.length}\n`);

  // Analyze data structure for each user
  const uniqueUsers = new Set();
  const fieldAnalysis = {};
  
  responses.forEach(response => {
    uniqueUsers.add(response.user_id);
    
    // Track all field names and sample values
    Object.keys(response.response_data).forEach(key => {
      if (!fieldAnalysis[key]) {
        fieldAnalysis[key] = {
          count: 0,
          sampleValues: [],
          types: new Set()
        };
      }
      
      fieldAnalysis[key].count++;
      const value = response.response_data[key];
      const valueType = Array.isArray(value) ? 'array' : typeof value;
      fieldAnalysis[key].types.add(valueType);
      
      // Keep up to 3 sample values
      if (fieldAnalysis[key].sampleValues.length < 3 && value !== null && value !== undefined) {
        fieldAnalysis[key].sampleValues.push(value);
      }
    });
  });

  console.log(`👥 Unique users with onboarding data: ${uniqueUsers.size}\n`);
  
  console.log('📋 Field Analysis:\n');
  console.log('Field Name | Count | Types | Sample Values');
  console.log('-'.repeat(80));
  
  Object.entries(fieldAnalysis).forEach(([field, data]) => {
    const types = Array.from(data.types).join(', ');
    const samples = data.sampleValues.map(v => 
      typeof v === 'object' ? JSON.stringify(v) : v
    ).join(' | ');
    
    console.log(`${field.padEnd(25)} | ${data.count.toString().padEnd(5)} | ${types.padEnd(15)} | ${samples}`);
  });

  // Get user_preferences schema for comparison
  console.log('\n\n🔍 Checking user_preferences table structure...\n');
  
  const { data: prefColumns, error: prefError } = await supabase
    .rpc('get_table_columns', { table_name: 'user_preferences' });

  if (!prefError && prefColumns) {
    console.log('user_preferences columns:');
    prefColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  }

  // Sample a few complete records
  console.log('\n\n📄 Sample complete records:\n');
  responses.slice(0, 3).forEach((response, index) => {
    console.log(`\nRecord ${index + 1} (User: ${response.user_id}):`);
    console.log(JSON.stringify(response.response_data, null, 2));
  });

  // Check for partner data patterns
  console.log('\n\n👫 Partner Data Analysis:\n');
  const partnersData = responses.filter(r => 
    r.response_data.family_situation === 'couple' || 
    r.response_data.family_situation === 'family'
  );
  
  console.log(`Records with couple/family status: ${partnersData.length}`);
  
  if (partnersData.length > 0) {
    console.log('\nSample partner citizenship data:');
    partnersData.slice(0, 3).forEach(record => {
      console.log(`\nUser ${record.user_id}:`);
      console.log(`  - family_situation: ${record.response_data.family_situation}`);
      console.log(`  - partner_citizenship:`, record.response_data.partner_citizenship);
    });
  }
}

// Create RPC function to get table columns if it doesn't exist
async function createHelperFunction() {
  const sql = `
    CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
    RETURNS TABLE(column_name text, data_type text) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.column_name::text,
        c.data_type::text
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' 
      AND c.table_name = get_table_columns.table_name
      ORDER BY c.ordinal_position;
    END;
    $$ LANGUAGE plpgsql;
  `;

  console.log('Creating helper function...');
  const { error } = await supabase.rpc('query', { query_text: sql });
  
  if (!error) {
    console.log('✅ Helper function created\n');
  }
}

// Run analysis
analyzeOnboardingData().catch(console.error);