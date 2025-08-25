// Standalone debug script to test the region scoring logic without supabase dependencies

// Copy the relevant region scoring logic
function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  console.log('\n=== REGION SCORING DEBUG ===')
  console.log('User preferences:', {
    countries: preferences.countries,
    regions: preferences.regions,
    geographic_features: preferences.geographic_features,
    vegetation_types: preferences.vegetation_types
  })
  console.log('Town data:', {
    country: town.country,
    geo_region: town.geo_region,
    geographic_features_actual: town.geographic_features_actual,
    vegetation_type_actual: town.vegetation_type_actual,
    regions: town.regions
  })
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // PART 1: REGION/COUNTRY MATCHING (Max 40 points)
  let regionCountryScore = 0
  
  if (!hasCountryPrefs && !hasRegionPrefs) {
    // No country/region preferences = 100% = 40 points
    regionCountryScore = 40
    factors.push({ factor: 'Open to any country/region', score: 40 })
  } else {
    // Check for country match first (highest priority)
    let countryMatched = false
    if (hasCountryPrefs) {
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
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array (case-insensitive)
      const userRegionsLower = preferences.regions.map(r => r.toLowerCase())
      
      console.log('Checking regions...')
      console.log('User regions (lowercase):', userRegionsLower)
      console.log('Town regions array:', town.regions)
      
      if (town.regions?.some(region => {
        const match = userRegionsLower.includes(region.toLowerCase())
        console.log(`  Checking "${region.toLowerCase()}" against user preferences: ${match}`)
        return match
      })) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
        console.log('✅ REGIONS ARRAY MATCH')
      }
      // Also check geo_region for broader matches (now comma-separated)
      else if (town.geo_region) {
        console.log('Checking geo_region:', town.geo_region)
        
        // Handle comma-separated geo_region
        const geoRegions = town.geo_region.includes(',') 
          ? town.geo_region.split(',').map(r => r.trim().toLowerCase())
          : [town.geo_region.toLowerCase()]
        
        console.log('Geo regions (parsed):', geoRegions)
        
        const match = geoRegions.some(gr => {
          const isMatch = userRegionsLower.includes(gr)
          console.log(`  Checking geo_region "${gr}" against user preferences: ${isMatch}`)
          return isMatch
        })
        
        if (match) {
          regionCountryScore = 30
          factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
          console.log('✅ GEO_REGION MATCH')
        }
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
      console.log('❌ NO REGION/COUNTRY MATCH')
    }
  }
  
  score += regionCountryScore
  console.log(`Region/Country score: ${regionCountryScore}/40`)
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  // Define all possible geographic features
  const ALL_GEO_FEATURES = ['coastal', 'mountain', 'island', 'lake', 'river', 'valley', 'desert', 'forest', 'plains']
  const userSelectedAllGeo = preferences.geographic_features?.length === ALL_GEO_FEATURES.length &&
    ALL_GEO_FEATURES.every(f => preferences.geographic_features.map(gf => gf.toLowerCase()).includes(f))
  
  if (!hasGeoPrefs || userSelectedAllGeo) {
    // No geographic preferences OR selected ALL = 100% = 30 points (user is open to anything)
    geoScore = 30
    factors.push({ factor: userSelectedAllGeo ? 'Open to all geographies (all selected)' : 'Open to any geography', score: 30 })
    console.log('Open to any geography: 30 points')
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
    
    console.log('Checking geographic features...')
    console.log('User features (lowercase):', userFeatures)
    console.log('Town features:', town.geographic_features_actual)
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => {
        const match = townFeatures.includes(feature)
        console.log(`  User feature "${feature}" in town features: ${match}`)
        return match
      })
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && userFeatures.includes('coastal') && town.regions?.length) {
      console.log('Checking regions for coastal indicators...')
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific', 'mediterranean']
      hasMatch = town.regions.some(region => {
        const regionLower = region.toLowerCase()
        const match = coastalIndicators.some(indicator => regionLower.includes(indicator))
        console.log(`  Region "${region}" contains coastal indicator: ${match}`)
        return match
      })
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
      console.log('✅ GEOGRAPHIC FEATURES MATCH: 30 points')
    } else {
      // IMPROVED: Give partial credit for related geographic features
      const relatedFeatures = {
        'coastal': ['island', 'lake', 'river'],  // All water access
        'island': ['coastal'],  // Islands are inherently coastal
        'lake': ['coastal', 'river'],  // Water features
        'river': ['lake', 'coastal'],  // Water features
        'mountain': ['valley', 'forest'],  // Often found together
        'valley': ['mountain', 'river'],  // Valleys often have rivers
        'forest': ['mountain', 'valley'],  // Forest areas
        'plains': ['valley'],  // Similar flat terrain
        'desert': []  // Desert is unique
      }
      
      let partialMatch = false
      if (town.geographic_features_actual?.length) {
        const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
        for (const userFeature of userFeatures) {
          const related = relatedFeatures[userFeature] || []
          if (townFeatures.some(tf => related.includes(tf))) {
            geoScore = 15  // 50% credit for related features
            factors.push({ factor: 'Related geographic features (partial match)', score: 15 })
            partialMatch = true
            console.log(`✅ PARTIAL GEOGRAPHIC MATCH: ${userFeature} relates to town features: 15 points`)
            break
          }
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No geographic feature match', score: 0 })
        console.log('❌ NO GEOGRAPHIC FEATURES MATCH: 0 points')
      }
    }
  }
  
  score += geoScore
  console.log(`Geographic features score: ${geoScore}/30`)
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  // Define all possible vegetation types
  const ALL_VEG_TYPES = ['tropical', 'subtropical', 'mediterranean', 'forest', 'grassland', 'desert']
  const userSelectedAllVeg = preferences.vegetation_types?.length === ALL_VEG_TYPES.length &&
    ALL_VEG_TYPES.every(v => preferences.vegetation_types.map(vt => vt.toLowerCase()).includes(v))
  
  if (!hasVegPrefs || userSelectedAllVeg) {
    // No vegetation preferences OR selected ALL = 100% = 20 points (user is open to anything)
    vegScore = 20
    factors.push({ factor: userSelectedAllVeg ? 'Open to all vegetation (all selected)' : 'Open to any vegetation', score: 20 })
    console.log('Open to any vegetation: 20 points')
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    
    console.log('Checking vegetation types...')
    console.log('User vegetation (lowercase):', userVeg)
    console.log('Town vegetation (lowercase):', townVeg)
    
    const hasMatch = userVeg.some(veg => {
      const match = townVeg.includes(veg)
      console.log(`  User vegetation "${veg}" in town vegetation: ${match}`)
      return match
    })
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
      console.log('✅ VEGETATION MATCH: 20 points')
    } else {
      // IMPROVED: Give partial credit for related vegetation types
      const relatedVegetation = {
        'mediterranean': ['subtropical'],
        'subtropical': ['mediterranean', 'tropical'],
        'tropical': ['subtropical'],
        'forest': ['grassland'],
        'grassland': ['forest']
      }
      
      let partialMatch = false
      for (const userVegType of userVeg) {
        const related = relatedVegetation[userVegType] || []
        if (townVeg.some(tv => related.includes(tv))) {
          vegScore = 10  // 50% credit for related vegetation
          factors.push({ factor: 'Related vegetation type (partial match)', score: 10 })
          partialMatch = true
          console.log(`✅ PARTIAL VEGETATION MATCH: ${userVegType} relates to town vegetation: 10 points`)
          break
        }
      }
      
      if (!partialMatch) {
        factors.push({ factor: 'No vegetation match', score: 0 })
        console.log('❌ NO VEGETATION MATCH: 0 points')
      }
    }
  } else {
    // User has preferences but town has no vegetation data
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
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

// Tilman's actual preferences
const tilmanPreferences = {
  countries: ["Spain"],
  regions: ["Mediterranean", "Southern Europe"],
  geographic_features: ["Coastal"],
  vegetation_types: ["Subtropical", "Mediterranean", "Tropical"]
};

// Example Spanish town (Valencia)
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

console.log("=== DEBUGGING SPANISH REGION MATCHING ===");
console.log("\nTilman's preferences:");
console.log("Countries:", tilmanPreferences.countries);
console.log("Regions:", tilmanPreferences.regions);
console.log("Geographic features:", tilmanPreferences.geographic_features);
console.log("Vegetation types:", tilmanPreferences.vegetation_types);

console.log("\nValencia town data:");
console.log("Country:", valenciaData.country);
console.log("Regions array:", valenciaData.regions);
console.log("Geo_region:", valenciaData.geo_region);
console.log("Geographic features:", valenciaData.geographic_features_actual);
console.log("Vegetation type:", valenciaData.vegetation_type_actual);

const result = calculateRegionScore(tilmanPreferences, valenciaData);

console.log("\n=== REGION SCORING RESULT ===");
console.log("Score:", result.score + "%");
console.log("Factors:");
result.factors.forEach(factor => {
  console.log(`  - ${factor.factor}: ${factor.score} points`);
});

console.log("\n=== ANALYSIS ===");
console.log("Expected: Should be close to 100% since:");
console.log("1. Country match: Spain ✓ (40 points)");
console.log("2. Geographic features: coastal ✓ (30 points)");
console.log("3. Vegetation: mediterranean ✓ (20 points)");
console.log("4. Total expected: 90/90 = 100%");

if (result.score < 90) {
  console.log("\n⚠️ BUG DETECTED: Score is unexpectedly low!");
} else {
  console.log("\n✅ SCORE LOOKS CORRECT");
}