import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FIELDS_TO_CHECK = [
  'internet_reliability',
  'mobile_coverage',
  'public_transport_quality',
  'bike_infrastructure',
  'road_quality',
  'traffic_congestion',
  'parking_availability',
  'government_efficiency_rating',
  'banking_infrastructure',
  'digital_services_availability'
];

async function checkColumns() {
  const response = await supabase
    .from('towns')
    .select('*')
    .limit(1);
  
  const allColumns = Object.keys(response.data[0]);
  
  console.log('=== CHECKING WHICH COLUMNS EXIST ===\n');
  FIELDS_TO_CHECK.forEach(field => {
    const exists = allColumns.includes(field);
    console.log(field + ': ' + (exists ? 'YES' : 'NO'));
  });
  
  const existingFields = FIELDS_TO_CHECK.filter(f => allColumns.includes(f));
  
  if (existingFields.length > 0) {
    const result = await supabase
      .from('towns')
      .select(existingFields.join(','))
      .limit(10);
    
    console.log('\n\n=== SAMPLE DATA ===\n');
    result.data.forEach((town, i) => {
      console.log('Town ' + (i + 1) + ':');
      existingFields.forEach(field => {
        console.log('  ' + field + ': ' + JSON.stringify(town[field]));
      });
      console.log('');
    });
  } else {
    console.log('\nNone of the specified fields exist in the database!');
  }
}

checkColumns();
