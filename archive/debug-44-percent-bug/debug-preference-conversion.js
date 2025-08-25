// Debug script to test user preference conversion logic

// Tilman's actual preferences from database
const tilmanDbPreferences = {
  "regions": ["Mediterranean", "Southern Europe"],
  "countries": ["Spain", "Spain"], // Duplicates in DB
  "provinces": ["Any Province"],
  "geographic_features": ["Coastal", "coastal"], // Duplicates/case issues
  "vegetation_types": ["Subtropical", "Mediterranean", "Tropical"]
};

// Copy the convertPreferencesToAlgorithmFormat logic
function convertPreferencesToAlgorithmFormat(userPreferences) {
  console.log("=== PREFERENCE CONVERSION DEBUG ===");
  console.log("Input preferences:", userPreferences);
  
  // Handle region preferences - combine countries and regions from top-level fields
  const regionPreferences = userPreferences.region || userPreferences.region_preferences || {};
  
  // If top-level countries/regions exist, ensure they're in the region_preferences object
  if (userPreferences.countries || userPreferences.regions) {
    regionPreferences.countries = userPreferences.countries || regionPreferences.countries || [];
    regionPreferences.regions = userPreferences.regions || regionPreferences.regions || [];
  }
  
  // Add geographic_features and vegetation_types if present at top level
  if (userPreferences.geographic_features) {
    regionPreferences.geographic_features = userPreferences.geographic_features;
  }
  if (userPreferences.vegetation_types) {
    regionPreferences.vegetation_types = userPreferences.vegetation_types;
  }
  if (userPreferences.provinces) {
    regionPreferences.provinces = userPreferences.provinces;
  }
  
  console.log("Converted region preferences:", regionPreferences);
  
  return {
    region_preferences: regionPreferences,
    climate_preferences: userPreferences.climate || userPreferences.climate_preferences || {},
    culture_preferences: userPreferences.culture || userPreferences.culture_preferences || {},
    hobbies_preferences: userPreferences.hobbies || userPreferences.hobbies_preferences || {},
    admin_preferences: userPreferences.administration || userPreferences.admin_preferences || {},
    budget_preferences: userPreferences.costs || userPreferences.budget_preferences || {}
  };
}

// Manual region scoring logic (copied from algorithm)
function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  console.log("\n=== REGION SCORING DEBUG ===");
  console.log("Region preferences:", preferences);
  console.log("Town data:", {
    country: town.country,
    geo_region: town.geo_region,
    geographic_features_actual: town.geographic_features_actual,
    vegetation_type_actual: town.vegetation_type_actual,
    regions: town.regions
  });
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log("Preference flags:", {
    hasCountryPrefs,
    hasRegionPrefs,
    hasGeoPrefs,
    hasVegPrefs
  });
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
      console.log("Checking countries:", preferences.countries, "against", town.country);
      for (const country of preferences.countries) {
        if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          console.log(`✅ COUNTRY MATCH: ${country} === ${town.country}`)
          break
        }
      }
    }
    
    // If no country match, check for region match
    if (!countryMatched && hasRegionPrefs) {
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      console.log("Checking regions:", userRegionsLower);
      console.log("Town regions:", town.regions);
      console.log("Town geo_region:", town.geo_region);
      
      if (town.regions?.some(region => userRegionsLower.includes(region.toLowerCase()))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
        console.log('✅ REGIONS ARRAY MATCH')
      }
      // Also check geo_region for broader matches
      else if (town.geo_region) {
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        console.log("Geo regions parsed:", geoRegions);
        
        if (geoRegions.some(gr => userRegionsLower.includes(gr))) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
          console.log('✅ GEO_REGION MATCH')
        }
      }
    }
  }
  
  score += regionCountryScore
  console.log(`Region/Country score: ${regionCountryScore}/40`)
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
    console.log('Open to any geography: 30 points')
  } else {
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    console.log("User geo features:", userFeatures);
    console.log("Town geo features:", town.geographic_features_actual);
    
    let hasMatch = false
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
      console.log(`Geographic feature match: ${hasMatch}`);
    }
    
    // FALLBACK: Check regions array for coastal indicators
    if (!hasMatch && userFeatures.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
      console.log(`Coastal fallback match: ${hasMatch}`);
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
      console.log('✅ GEOGRAPHIC FEATURES MATCH: 30 points')
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
      console.log('❌ NO GEOGRAPHIC FEATURES MATCH: 0 points')
    }
  }
  
  score += geoScore
  console.log(`Geographic features score: ${geoScore}/30`)
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
    console.log('Open to any vegetation: 20 points')
  } else if (town.vegetation_type_actual?.length) {
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    
    console.log("User vegetation:", userVeg);
    console.log("Town vegetation:", townVeg);
    
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    console.log(`Vegetation match: ${hasMatch}`);
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
      console.log('✅ VEGETATION MATCH: 20 points')
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
      console.log('❌ NO VEGETATION MATCH: 0 points')
    }
  } else {
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
    console.log('❌ NO VEGETATION DATA: 0 points')
  }
  
  score += vegScore
  console.log(`Vegetation score: ${vegScore}/20`)
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  console.log(`\nFINAL CALCULATION: ${score}/${totalPossible} = ${percentage}%`)
  
  return {
    score: percentage,
    factors,
    category: 'Region'
  }
}

// Test data
const valenciaData = {
  id: 1,
  name: "Valencia",
  country: "Spain",
  region: "Valencia Community",
  regions: ["EU","Schengen","Iberian Peninsula","Mediterranean","NATO","Pyrenees","Mediterranean Climate","OECD","Europe","Coastal"],
  geo_region: "Southern Europe,Western Europe,Mediterranean",
  geographic_features_actual: ["coastal"],
  vegetation_type_actual: ["mediterranean"]
};

console.log("=== TESTING TILMAN'S ACTUAL DATA ===");

// Step 1: Convert preferences
const converted = convertPreferencesToAlgorithmFormat(tilmanDbPreferences);

// Step 2: Score region match
const regionResult = calculateRegionScore(converted.region_preferences, valenciaData);

console.log("\n=== FINAL RESULT ===");
console.log("Region score:", regionResult.score + "%");
console.log("Factors:");
regionResult.factors.forEach(factor => {
  console.log(`  - ${factor.factor}: ${factor.score} points`);
});

if (regionResult.score < 90) {
  console.log("\n⚠️ ISSUE DETECTED!");
  console.log("Expected: 100% (Country + Coastal + Mediterranean)");
  console.log("Actual:", regionResult.score + "%");
  
  // Check for common issues
  if (!converted.region_preferences.countries?.includes("Spain")) {
    console.log("❌ Spain not found in countries array");
  }
  if (!converted.region_preferences.geographic_features?.map(f => f.toLowerCase()).includes("coastal")) {
    console.log("❌ Coastal not found in geographic features");  
  }
  if (!converted.region_preferences.vegetation_types?.map(f => f.toLowerCase()).includes("mediterranean")) {
    console.log("❌ Mediterranean not found in vegetation types");
  }
} else {
  console.log("\n✅ REGION SCORING WORKING CORRECTLY");
}