#!/usr/bin/env node

/**
 * Test comprehensive scoring to ensure all towns work correctly
 */

// Test data matching Tilman's preferences
const userPreferences = {
  countries: ['Spain'],
  regions: ['Mediterranean', 'Southern Europe'],
  geographic_features: ['Coastal'],
  vegetation_types: ['Mediterranean', 'Subtropical', 'Tropical']
};

// Spanish Mediterranean town (should score high)
const valencia = {
  name: 'Valencia',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe,Mediterranean',
  regions: ['Mediterranean', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Spanish Atlantic town (should score well)
const baiona = {
  name: 'Baiona',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe',
  regions: ['Atlantic', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Portuguese town (should score medium)
const lisbon = {
  name: 'Lisbon',
  country: 'Portugal',
  geo_region: 'Southern Europe,Western Europe',
  regions: ['Atlantic', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Italian town (should score well - Mediterranean)
const rome = {
  name: 'Rome',
  country: 'Italy',
  geo_region: 'Southern Europe,Mediterranean',
  regions: ['Mediterranean'],
  geographic_features_actual: ['continental'],
  vegetation_type_actual: ['mediterranean']
};

console.log('Testing Comprehensive Region Scoring\n');
console.log('=' .repeat(60));
console.log('User Preferences:');
console.log('  Countries:', userPreferences.countries);
console.log('  Regions:', userPreferences.regions);
console.log('  Geographic:', userPreferences.geographic_features);
console.log('  Vegetation:', userPreferences.vegetation_types);
console.log('=' .repeat(60));

function calculateSimplifiedScore(prefs, town) {
  let countryScore = 0;
  let geoScore = 0;
  let vegScore = 0;
  
  // Country/Region scoring (40 points max)
  const countryMatch = prefs.countries.includes(town.country);
  if (countryMatch) {
    countryScore = 40;
  } else {
    // Check region match (case-insensitive)
    const userRegionsLower = prefs.regions.map(r => r.toLowerCase());
    
    // Check regions array
    const regionsMatch = town.regions?.some(r => 
      userRegionsLower.includes(r.toLowerCase())
    );
    
    // Check geo_region (comma-separated)
    let geoRegionMatch = false;
    if (town.geo_region) {
      const geoRegions = town.geo_region.includes(',')
        ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
        : [town.geo_region.toLowerCase()];
      geoRegionMatch = geoRegions.some(gr => userRegionsLower.includes(gr));
    }
    
    if (regionsMatch || geoRegionMatch) {
      countryScore = 30;
    }
  }
  
  // Geographic features (30 points max)
  if (prefs.geographic_features?.length) {
    const userGeoLower = prefs.geographic_features.map(f => f.toLowerCase());
    const townGeoLower = town.geographic_features_actual?.map(f => f.toLowerCase()) || [];
    if (userGeoLower.some(f => townGeoLower.includes(f))) {
      geoScore = 30;
    }
  }
  
  // Vegetation (20 points max)
  if (prefs.vegetation_types?.length) {
    const userVegLower = prefs.vegetation_types.map(v => v.toLowerCase());
    const townVegLower = town.vegetation_type_actual?.map(v => v.toLowerCase()) || [];
    if (userVegLower.some(v => townVegLower.includes(v))) {
      vegScore = 20;
    }
  }
  
  const total = countryScore + geoScore + vegScore;
  const percentage = Math.round((total / 90) * 100);
  
  return {
    countryScore,
    geoScore,
    vegScore,
    total,
    percentage
  };
}

// Test each town
[valencia, baiona, lisbon, rome].forEach(town => {
  const score = calculateSimplifiedScore(userPreferences, town);
  console.log(`\n${town.name} (${town.country}):`);
  console.log(`  geo_region: ${town.geo_region}`);
  console.log(`  Scoring:`);
  console.log(`    Country/Region: ${score.countryScore}/40 pts`);
  console.log(`    Geographic: ${score.geoScore}/30 pts`);
  console.log(`    Vegetation: ${score.vegScore}/20 pts`);
  console.log(`  → Total: ${score.total}/90 = ${score.percentage}%`);
});

console.log('\n' + '=' .repeat(60));
console.log('Expected Results:');
console.log('  Valencia: ~100% (Spain + Mediterranean + Coastal + Mediterranean veg)');
console.log('  Baiona: ~89% (Spain + Southern Europe + Coastal + Mediterranean veg)');
console.log('  Lisbon: ~67% (Southern Europe + Coastal + Mediterranean veg)');
console.log('  Rome: ~67% (Mediterranean + Southern Europe + Mediterranean veg)');