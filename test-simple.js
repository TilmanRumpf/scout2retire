// Simplified region scoring test
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
  }
  
  score += geoScore
  
  // PART 3: VEGETATION TYPE (Max 20 points)
  let vegScore = 0
  
  if (!hasVegPrefs) {
    // No vegetation preferences = 100% = 20 points
    vegScore = 20
    factors.push({ factor: 'Open to any vegetation', score: 20 })
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

// Test Spanish town matching
const spanishTown = {
  id: 1,
  name: 'Granada',
  country: 'Spain',
  region: 'Andalusia'
};

// Test user with Spain preference
const userWithSpainPref = {
  countries: ['Spain'],
  regions: ['Europe', 'Mediterranean']
};

// Test user with no preferences (should get 100%)
const userWithNoPrefs = {};

console.log('=== Testing Region Scoring ===');
console.log('Spanish town:', spanishTown.name, spanishTown.country);

console.log('\n1. User with Spain preference:');
const result1 = calculateRegionScore(userWithSpainPref, spanishTown);
console.log('Score:', result1.score + '%');
console.log('Raw score:', result1.rawScore + '/' + result1.maxScore);
console.log('Factors:', result1.factors.map(f => f.factor + ' (' + f.score + ' pts)'));

console.log('\n2. User with no preferences:');
const result2 = calculateRegionScore(userWithNoPrefs, spanishTown);
console.log('Score:', result2.score + '%');
console.log('Factors:', result2.factors.map(f => f.factor + ' (' + f.score + ' pts)'));

console.log('\n3. User with different country preference (Portugal):');
const userWithPortugalPref = {
  countries: ['Portugal'],
  regions: ['Europe']
};
const result3 = calculateRegionScore(userWithPortugalPref, spanishTown);
console.log('Score:', result3.score + '%');
console.log('Raw score:', result3.rawScore + '/' + result3.maxScore);
console.log('Factors:', result3.factors.map(f => f.factor + ' (' + f.score + ' pts)'));
