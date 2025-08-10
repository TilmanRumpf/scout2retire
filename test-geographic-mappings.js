// Test script for geographic mappings
import { getSortedRegions, getSortedGeoRegions } from './src/utils/geographicMappings.js';
import { TOWN_DATA_OPTIONS } from './src/utils/townDataOptions.js';

console.log('Testing Geographic Mappings\n');
console.log('='*50);

// Test cases
const testCountries = ['Greece', 'Spain', 'United States', 'Japan', 'Brazil'];

testCountries.forEach(country => {
  console.log(`\n${country}:`);
  console.log('-'.repeat(country.length + 1));
  
  // Test regions
  const regionsResult = getSortedRegions(country, TOWN_DATA_OPTIONS.regions);
  console.log(`Relevant regions: ${regionsResult.relevant.join(', ')}`);
  console.log(`Other regions: ${regionsResult.other.slice(0, 5).join(', ')}...`);
  
  // Test geo_regions
  const geoRegionsResult = getSortedGeoRegions(country, TOWN_DATA_OPTIONS.geo_regions);
  console.log(`Relevant geo_regions: ${geoRegionsResult.relevant.join(', ')}`);
  console.log(`Other geo_regions: ${geoRegionsResult.other.slice(0, 5).join(', ')}...`);
});

console.log('\n' + '='*50);
console.log('Test completed successfully!');