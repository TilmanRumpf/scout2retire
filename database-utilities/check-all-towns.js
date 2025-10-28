import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking all towns...\n');

const { data: towns, error } = await supabase
  .from('towns')
  .select('id, town_name, country, region')
  .order('town_name')
  .limit(30);

if (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

console.log(`Sample of ${towns.length} towns:\n`);

towns.forEach(t => {
  const hasParens = t.town_name?.includes('(') && t.town_name?.includes(')');
  const marker = hasParens ? '⚠️ ' : '   ';
  console.log(`${marker}"${t.town_name}" | ${t.country} | Region: ${t.region || 'N/A'}`);
});

// Check for parentheses
const withParens = towns.filter(t => t.town_name?.includes('(') && t.town_name?.includes(')'));
console.log(`\n${withParens.length} towns have parentheses in name`);

process.exit(0);
