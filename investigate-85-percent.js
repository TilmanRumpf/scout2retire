import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc3JvbGUiLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

console.log('INVESTIGATING WHY LEMMER SHOWS 85% CLIMATE MATCH\n');

// Get Lemmer's climate data
const { data: lemmer } = await supabase
  .from('towns')
  .select('*')
  .eq('name', 'Lemmer')
  .single();

console.log('LEMMER CLIMATE DATA:');
console.log('- Summer climate:', lemmer.summer_climate_actual);
console.log('- Winter climate:', lemmer.winter_climate_actual);
console.log('- Humidity:', lemmer.humidity_level_actual);
console.log('- Sunshine:', lemmer.sunshine_level_actual);
console.log('- Precipitation:', lemmer.precipitation_level_actual);
console.log('- Summer temp:', lemmer.avg_temp_summer, '°C');
console.log('- Winter temp:', lemmer.avg_temp_winter, '°C');

// Check if we're using the old algorithm or if changes haven't been deployed
console.log('\n\nPOSSIBLE REASONS FOR 85% INSTEAD OF 100%:');
console.log('\n1. DEPLOYMENT STATUS:');
console.log('   - The standardization fix was just committed');
console.log('   - Changes may not be deployed to production yet');
console.log('   - Frontend might still be using the old algorithm');

console.log('\n2. ALGORITHM CALCULATION:');
console.log('   Climate scoring total: 100 points');
console.log('   - Summer: 21 points');
console.log('   - Winter: 21 points');
console.log('   - Humidity: 17 points');
console.log('   - Sunshine: 17 points');
console.log('   - Precipitation: 9 points');
console.log('   - Seasonal: 15 points');
console.log('   Total without seasonal: 85 points');

console.log('\n3. PERCENTAGE CALCULATION:');
console.log('   Option A: 85/100 = 85% (includes seasonal in denominator)');
console.log('   Option B: 85/85 = 100% (excludes seasonal from denominator)');
console.log('\n   The UI might be showing 85/100 = 85%');

console.log('\n4. PARTIAL SCORING:');
console.log('   If sunshine is still scoring as adjacent (70%):');
console.log('   - Sunshine: 17 × 0.7 = 12 points (rounded)');
console.log('   - Total: 21 + 21 + 17 + 12 + 9 = 80 points');
console.log('   - With seasonal placeholder: 80 + 5 = 85 points');

console.log('\nCONCLUSION:');
console.log('The 85% likely means the production environment is still using');
console.log('the old algorithm where "often_cloudy" is adjacent to "less_sunny"');
console.log('OR the percentage calculation includes the unused seasonal preference');
console.log('in the denominator (85/100 instead of 85/85).');

process.exit(0);