import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc3JvbGUiLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// First, let's see what countries we have
const { data: countries } = await supabase
  .from('towns')
  .select('country')
  .order('country');

const uniqueCountries = [...new Set(countries?.map(t => t.country))];
console.log('All countries in database:', uniqueCountries);

// Now get all towns with temperature and climate data
const { data: towns } = await supabase
  .from('towns')
  .select(`
    name,
    country,
    summer_climate_actual,
    winter_climate_actual,
    avg_temp_summer,
    avg_temp_winter
  `)
  .not('avg_temp_summer', 'is', null)
  .not('avg_temp_winter', 'is', null);

// Filter European countries
const europeanCountries = [
  'Portugal', 'Spain', 'France', 'Italy', 'Greece', 
  'Netherlands', 'Germany', 'Switzerland', 'Austria',
  'Belgium', 'United Kingdom', 'Ireland', 'Malta',
  'Croatia', 'Czech Republic', 'Poland', 'Hungary',
  'Denmark', 'Sweden', 'Norway', 'Finland'
];

const europeanTowns = towns?.filter(t => 
  europeanCountries.some(ec => t.country?.toLowerCase().includes(ec.toLowerCase()))
);

console.log(`\nTotal towns with temperature data: ${towns?.length}`);
console.log(`European towns with temperature data: ${europeanTowns?.length}`);

// Show some European towns
console.log('\nSample European towns with temperature data:');
europeanTowns?.slice(0, 10).forEach(t => {
  console.log(`- ${t.name}, ${t.country}: Summer ${t.avg_temp_summer}°C (${t.summer_climate_actual}), Winter ${t.avg_temp_winter}°C (${t.winter_climate_actual})`);
});

process.exit(0);