import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Let's analyze which countries we need data for
async function analyzeCountriesForCrimeData() {
  console.log('🌍 Analyzing countries in our database...\n');
  
  const { data: countries, error } = await supabase
    .from('towns')
    .select('country')
    .order('country');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Count towns per country
  const countryCount = {};
  countries.forEach(t => {
    countryCount[t.country] = (countryCount[t.country] || 0) + 1;
  });
  
  const sorted = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);
  
  console.log('Countries by number of towns:\n');
  sorted.forEach(([country, count]) => {
    console.log(`${country.padEnd(25)} ${count} towns`);
  });
  
  console.log('\n📊 FREE CRIME DATA SOURCES BY REGION:\n');
  
  console.log('🇺🇸 USA (FBI Crime Data Explorer - API Available):');
  console.log('   - API: https://api.usa.gov/crime/fbi/cde/');
  console.log('   - Docs: https://crime-data-explorer.app.cloud.gov/pages/docApi');
  console.log('   - Coverage: City-level crime statistics\n');
  
  console.log('🇪🇺 Europe (Eurostat - Free Data):');
  console.log('   - URL: https://ec.europa.eu/eurostat/web/crime/data/database');
  console.log('   - Format: CSV/TSV downloads by country');
  console.log('   - Coverage: National and regional level\n');
  
  console.log('🇬🇧 UK (Police.uk - Open API):');
  console.log('   - API: https://data.police.uk/docs/');
  console.log('   - Coverage: Street-level crime data');
  console.log('   - Format: REST API with lat/lng queries\n');
  
  console.log('🇨🇦 Canada (Statistics Canada):');
  console.log('   - URL: https://www150.statcan.gc.ca/n1/pub/85-002-x/85-002-x2023001-eng.htm');
  console.log('   - Format: CSV downloads by city\n');
  
  console.log('🇦🇺 Australia (ABS Crime Statistics):');
  console.log('   - URL: https://www.abs.gov.au/statistics/people/crime-and-justice');
  console.log('   - Format: Excel/CSV by state\n');
  
  console.log('🌍 Global Alternative - OpenStreetMap Crime Tags:');
  console.log('   - Some cities tag high-crime areas');
  console.log('   - Limited coverage but free\n');
  
  console.log('🌐 UNODC (UN Office on Drugs and Crime):');
  console.log('   - URL: https://dataunodc.un.org/crime');
  console.log('   - Coverage: Country-level statistics');
  console.log('   - Format: CSV downloads\n');
  
  console.log('📱 Alternative Approach - Safety Scores from:');
  console.log('   - WikiVoyage safety sections (scraping)');
  console.log('   - State Department travel advisories');
  console.log('   - Open review aggregation\n');
}

analyzeCountriesForCrimeData();