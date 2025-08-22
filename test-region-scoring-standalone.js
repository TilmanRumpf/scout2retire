// Standalone test for region scoring algorithm
// Copied from enhancedMatchingAlgorithm.js to test in isolation

function calculateRegionScore(preferences, town) {
  let score = 0
  let factors = []
  
  // Check if user has any preferences at all
  const hasCountryPrefs = preferences.countries?.length > 0
  const hasRegionPrefs = preferences.regions?.length > 0
  const hasGeoPrefs = preferences.geographic_features?.length > 0
  const hasVegPrefs = preferences.vegetation_types?.length > 0
  
  // If user has NO preferences at all, they're open to anywhere - give perfect score
  if (!hasCountryPrefs && !hasRegionPrefs && !hasGeoPrefs && !hasVegPrefs) {
    score = 100
    factors.push({ factor: 'Open to any location', score: 100 })
    return { score, factors, category: 'Region' }
  }
  
  // US States list for matching
  const US_STATES = new Set([
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas',
    'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ])
  
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
        // Check if it's a US state
        if (US_STATES.has(country) && town.country === 'United States' && town.region === country) {
          regionCountryScore = 40
          factors.push({ factor: `State match (${country})`, score: 40 })
          countryMatched = true
          break
        } else if (country === town.country) {
          regionCountryScore = 40
          factors.push({ factor: 'Country match', score: 40 })
          countryMatched = true
          break
        }
      }
    }
    
    // If no country match, check for region match (75% = 30 points)
    if (!countryMatched && hasRegionPrefs) {
      // Check traditional regions array
      if (town.regions?.some(region => preferences.regions.includes(region))) {
        regionCountryScore = 30
        factors.push({ factor: 'Region match only', score: 30 })
      }
      // Also check geo_region for broader matches
      else if (town.geo_region && preferences.regions.includes(town.geo_region)) {
        regionCountryScore = 30
        factors.push({ factor: `Region match only (${town.geo_region})`, score: 30 })
      }
    }
    
    // If nothing matched and user had preferences, no points awarded
    if (regionCountryScore === 0 && (hasCountryPrefs || hasRegionPrefs)) {
      // No match = 0 points (as per specification)
      regionCountryScore = 0
      factors.push({ factor: 'No location match', score: 0 })
    }
  }
  
  score += regionCountryScore
  
  // PART 2: GEOGRAPHIC FEATURES (Max 30 points)
  let geoScore = 0
  
  if (!hasGeoPrefs) {
    // No geographic preferences = 100% = 30 points
    geoScore = 30
    factors.push({ factor: 'Open to any geography', score: 30 })
  } else {
    // Check if ANY geographic feature matches
    let hasMatch = false
    
    // First try actual geographic features
    if (town.geographic_features_actual?.length) {
      const userFeatures = preferences.geographic_features.map(f => f.toLowerCase())
      const townFeatures = town.geographic_features_actual.map(f => f.toLowerCase())
      hasMatch = userFeatures.some(feature => townFeatures.includes(feature))
    }
    
    // FALLBACK: Check regions array for coastal indicators when no geographic data
    if (!hasMatch && preferences.geographic_features.includes('coastal') && town.regions?.length) {
      const coastalIndicators = ['gulf', 'ocean', 'coast', 'beach', 'sea', 'atlantic', 'pacific']
      hasMatch = town.regions.some(region => 
        coastalIndicators.some(indicator => region.toLowerCase().includes(indicator))
      )
    }
    
    if (hasMatch) {
      geoScore = 30
      factors.push({ factor: 'Geographic features match', score: 30 })
    } else {
      factors.push({ factor: 'No geographic feature match', score: 0 })
    }
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    // No vegetation preferences = 100% = 20 points
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
  } else if (town.vegetation_type_actual?.length) {
    // Check if ANY vegetation type matches
    const userVeg = preferences.vegetation_types.map(v => v.toLowerCase())
    const townVeg = town.vegetation_type_actual.map(v => v.toLowerCase())
    const hasMatch = userVeg.some(veg => townVeg.includes(veg))
    
    if (hasMatch) {
      vegScore = 20
      factors.push({ factor: 'Vegetation type match', score: 20 })
    } else {
      factors.push({ factor: 'No vegetation match', score: 0 })
    }
  } else {
    // User has preferences but town has no vegetation data
    factors.push({ factor: 'Vegetation data unavailable', score: 0 })
  }
  
  score += vegScore
  
  // Calculate final percentage based on 90 points total
  const totalPossible = 90
  const percentage = Math.round((score / totalPossible) * 100)
  
  return {
    score: percentage,
    factors,
    category: 'Region',
    rawScore: score,
    maxScore: totalPossible
  }
}

// Test cases for region scoring
const testCases = [
  {
    name: "No preferences = 100%",
    preferences: {
      countries: [],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal'],
      vegetation_type_actual: ['mediterranean']
    },
    expected: 100
  },
  {
    name: "Country match with no other prefs = 100%",
    preferences: {
      countries: ['Portugal'],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 100 // 40/90 + 30/90 + 20/90 = 90/90 = 100%
  },
  {
    name: "Region match only (wrong country) = 89%",
    preferences: {
      countries: ['Spain'],
      regions: ['Algarve'],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 89 // 30/90 (region match) + 30/90 (no geo pref) + 20/90 (no veg pref) = 80/90 = 89%
  },
  {
    name: "No location match = 56%",
    preferences: {
      countries: ['Spain'],
      regions: ['Costa del Sol'],
      geographic_features: [],
      vegetation_types: []
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: [],
      vegetation_type_actual: []
    },
    expected: 56 // 0/90 (no match) + 30/90 (no geo pref) + 20/90 (no veg pref) = 50/90 = 56%
  },
  {
    name: "Full match with all features = 100%",
    preferences: {
      countries: ['Portugal'],
      regions: ['Algarve'],
      geographic_features: ['coastal'],
      vegetation_types: ['mediterranean']
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal', 'beach'],
      vegetation_type_actual: ['mediterranean', 'subtropical']
    },
    expected: 100 // 40/90 + 30/90 + 20/90 = 90/90 = 100%
  },
  {
    name: "Country match but wrong features = 44%",
    preferences: {
      countries: ['Portugal'],
      regions: [],
      geographic_features: ['mountainous'],
      vegetation_types: ['alpine']
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal', 'beach'],
      vegetation_type_actual: ['mediterranean', 'subtropical']
    },
    expected: 44 // 40/90 (country) + 0/90 (wrong geo) + 0/90 (wrong veg) = 40/90 = 44%
  },
  {
    name: "Wrong country, no region pref, but geo+veg match = 56%",
    preferences: {
      countries: ['Spain'],
      regions: [],
      geographic_features: ['coastal'],
      vegetation_types: ['mediterranean']
    },
    town: {
      country: 'Portugal',
      region: 'Algarve',
      regions: ['Algarve', 'Southern Portugal'],
      geographic_features_actual: ['coastal'],
      vegetation_type_actual: ['mediterranean']
    },
    expected: 56 // 0/90 (wrong country) + 30/90 (geo match) + 20/90 (veg match) = 50/90 = 56%
  }
];

// Run tests
console.log('Testing Region Scoring Algorithm\n');
console.log('=' .repeat(60));

let passCount = 0;

testCases.forEach(test => {
  const result = calculateRegionScore(test.preferences, test.town);
  const passed = result.score === test.expected;
  if (passed) passCount++;
  
  console.log(`\nTest: ${test.name}`);
  console.log(`Expected: ${test.expected}%`);
  console.log(`Actual: ${result.score}%`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!passed) {
    console.log('Breakdown:');
    result.factors.forEach(f => {
      console.log(`  - ${f.factor}: ${f.score} pts`);
    });
    console.log(`Raw score: ${result.rawScore}/${result.maxScore}`);
  }
});

console.log('\n' + '=' .repeat(60));
console.log('Test Summary:');
console.log(`${passCount}/${testCases.length} tests passed`);

if (passCount === testCases.length) {
  console.log('\n✅ All tests passed! Region scoring is working correctly.');
} else {
  console.log('\n❌ Some tests failed. Review the algorithm.');
}