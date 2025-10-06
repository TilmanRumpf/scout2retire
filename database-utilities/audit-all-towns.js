import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: towns, error } = await supabase
  .from('towns')
  .select('*');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`📊 Total towns in database: ${towns.length}`);

// Count by country
const byCountry = {};
towns.forEach(t => {
  byCountry[t.country] = (byCountry[t.country] || 0) + 1;
});

console.log('\n📍 Towns by country:');
Object.entries(byCountry).sort((a,b) => b[1] - a[1]).forEach(([country, count]) => {
  console.log(`  ${country}: ${count} towns`);
});

// Count NULLs in critical fields
const criticalFields = [
  'local_mobility_options',
  'regional_connectivity', 
  'international_access',
  'geographic_features_actual'
];

console.log('\n❌ NULL counts in critical fields:');
criticalFields.forEach(field => {
  const nullCount = towns.filter(t => !t[field] || (Array.isArray(t[field]) && t[field].length === 0)).length;
  console.log(`  ${field}: ${nullCount}/${towns.length} towns`);
});
