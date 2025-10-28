import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking town_name format for USA towns...\n');

const { data: towns, error } = await supabase
  .from('towns')
  .select('id, town_name, country, region')
  .eq('country', 'United States')
  .order('town_name');

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log(`Total USA towns: ${towns.length}\n`);

// Check for towns with parentheses in town_name
const withParens = towns.filter(t => t.town_name?.includes('(') && t.town_name?.includes(')'));

if (withParens.length > 0) {
  console.log(`⚠️  Found ${withParens.length} towns with parentheses in town_name:\n`);
  withParens.forEach(t => {
    console.log(`  "${t.town_name}" | Region: ${t.region || 'N/A'}`);
  });
} else {
  console.log('✅ No towns have parentheses in town_name field');
}

// Also check a few specific examples
console.log('\n📋 Sample town names:');
const samples = towns.slice(0, 10);
samples.forEach(t => {
  console.log(`  "${t.town_name}" | Region: ${t.region || 'N/A'}`);
});

process.exit(0);
