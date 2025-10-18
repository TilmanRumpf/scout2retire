import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findFieldNameValues() {
  // Get all columns
  const { data: sample } = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  const columns = Object.keys(sample[0]);
  
  // Check text/varchar columns that might have field name as value
  const textColumns = columns.filter(c => 
    typeof sample[0][c] === 'string' &&
    !c.includes('description') &&
    !c.includes('name') &&
    !c.includes('country') &&
    !c.includes('state') &&
    !c.includes('city') &&
    !c.includes('region') &&
    !c.includes('timezone') &&
    !c.includes('language') &&
    !c.includes('currency')
  );
  
  console.log(`Checking ${textColumns.length} text columns for field-name-as-value issues...\n`);
  
  // Get all towns
  const { data: towns } = await supabase
    .from('towns')
    .select(textColumns.join(','));
  
  const issues = {};
  
  textColumns.forEach(col => {
    const values = towns.map(t => t[col]).filter(v => v);
    const hasFieldName = values.some(v => {
      const normalized = v.toLowerCase().replace(/_/g, ' ').replace(/ /g, '_');
      const colNormalized = col.toLowerCase();
      return normalized === colNormalized || v === col;
    });
    
    if (hasFieldName) {
      const fieldNameValues = values.filter(v => {
        const normalized = v.toLowerCase().replace(/_/g, ' ').replace(/ /g, '_');
        const colNormalized = col.toLowerCase();
        return normalized === colNormalized || v === col;
      });
      
      issues[col] = {
        count: fieldNameValues.length,
        example: fieldNameValues[0],
        allValues: [...new Set(values)].sort()
      };
    }
  });
  
  if (Object.keys(issues).length === 0) {
    console.log('✅ No field-name-as-value issues found!');
  } else {
    console.log('❌ Found fields with field name as value:\n');
    Object.entries(issues).forEach(([col, data]) => {
      console.log(`${col}:`);
      console.log(`  ${data.count} towns have field name as value`);
      console.log(`  Example: "${data.example}"`);
      console.log(`  All unique values in this field:`);
      data.allValues.forEach(v => console.log(`    - "${v}"`));
      console.log('');
    });
  }
}

findFieldNameValues();
