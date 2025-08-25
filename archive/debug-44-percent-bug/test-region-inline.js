#!/usr/bin/env node

/**
 * Inline test of region matching logic with case sensitivity
 */

// Simplified region matching logic from enhancedMatchingAlgorithm.js
function testRegionMatching() {
  // User preferences (from Tilman)
  const preferences = {
    countries: ['Spain'],
    regions: ['Mediterranean', 'Southern Europe']
  };
  
  // Test case 1: Valencia with new geo_region format
  const valencia = {
    name: 'Valencia',
    country: 'Spain',
    geo_region: 'Southern Europe,Western Europe,Mediterranean',
    regions: ['Mediterranean', 'Coastal']
  };
  
  // Test case 2: Baiona (Atlantic coast)
  const baiona = {
    name: 'Baiona',
    country: 'Spain',
    geo_region: 'Southern Europe,Western Europe',
    regions: ['Atlantic', 'Coastal']
  };
  
  // Test case 3: Old format that was failing
  const oldFormat = {
    name: 'Old Barcelona',
    country: 'Spain',
    geo_region: 'Mediterranean',  // Single value, not comma-separated
    regions: ['mediterranean']  // lowercase
  };
  
  console.log('Testing Region Matching Logic\n');
  console.log('=' .repeat(60));
  console.log('User wants: Countries =', preferences.countries);
  console.log('User wants: Regions =', preferences.regions);
  console.log('=' .repeat(60));
  
  // Test each town
  [valencia, baiona, oldFormat].forEach(town => {
    console.log(`\n${town.name}:`);
    console.log(`  geo_region: "${town.geo_region}"`);
    console.log(`  regions: [${town.regions.join(', ')}]`);
    
    // Country match
    const countryMatch = preferences.countries.includes(town.country);
    console.log(`  ✓ Country matches: ${countryMatch}`);
    
    // Region match with case-insensitive logic
    const userRegionsLower = preferences.regions.map(r => r.toLowerCase());
    
    // Check regions array
    const regionsArrayMatch = town.regions?.some(region => 
      userRegionsLower.includes(region.toLowerCase())
    );
    console.log(`  ✓ Regions array match: ${regionsArrayMatch}`);
    
    // Check geo_region (now comma-separated)
    let geoRegionMatch = false;
    if (town.geo_region) {
      // Handle both comma-separated and single values
      const geoRegions = town.geo_region.includes(',') 
        ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
        : [town.geo_region.toLowerCase()];
      
      geoRegionMatch = geoRegions.some(gr => userRegionsLower.includes(gr));
      console.log(`  ✓ geo_region match: ${geoRegionMatch}`);
      console.log(`    (checking: [${geoRegions.join(', ')}] against [${userRegionsLower.join(', ')}])`);
    }
    
    // Calculate what score would be
    let score = 0;
    if (countryMatch) score = 40;
    else if (regionsArrayMatch || geoRegionMatch) score = 30;
    
    console.log(`  → Would get ${score}/40 points for country/region`);
  });
}

testRegionMatching();