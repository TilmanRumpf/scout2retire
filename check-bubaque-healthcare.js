import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBubaque() {
  console.log('🔍 Searching for Bubaque...\n');

  // First, just get basic info to confirm it exists
  const { data: basicData, error: basicError } = await supabase
    .from('towns')
    .select('*')
    .ilike('name', 'Bubaque')
    .single();

  if (basicError) {
    console.log('❌ Error finding Bubaque:', basicError.message);
    return;
  }

  console.log('✅ Found Bubaque!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Basic Info:');
  console.log('  ID:', basicData.id);
  console.log('  Name:', basicData.name);
  console.log('  Country:', basicData.country);
  console.log('  Region:', basicData.region);
  console.log('\n🏥 Looking for healthcare-related columns...\n');

  // Find all columns with 'health', 'hospital', 'medical', 'clinic' in the name
  const healthcareColumns = Object.keys(basicData).filter(key =>
    key.toLowerCase().includes('health') ||
    key.toLowerCase().includes('hospital') ||
    key.toLowerCase().includes('medical') ||
    key.toLowerCase().includes('clinic') ||
    key.toLowerCase().includes('doctor')
  );

  console.log('Healthcare-related columns found:', healthcareColumns.length);
  healthcareColumns.forEach(col => {
    const value = basicData[col];
    const displayValue = value === null ? 'NULL' : (typeof value === 'object' ? JSON.stringify(value) : value);
    console.log('  - ' + col + ': ' + displayValue);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

checkBubaque().catch(console.error);
