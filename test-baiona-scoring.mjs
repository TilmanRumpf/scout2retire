// Let's test what preferences would give Baiona 100%

const bainoaData = {
  name: 'Baiona',
  country: 'Spain',
  geo_region: 'Southern Europe,Western Europe',
  regions: ['EU', 'Schengen', 'Iberian Peninsula', 'Atlantic', 'NATO', 'Pyrenees', 'Mediterranean Climate', 'OECD', 'Europe', 'Coastal'],
  geographic_features_actual: ['coastal'],
  vegetation_type_actual: ['mediterranean']
};

// Test different user preference scenarios
const scenarios = [
  {
    name: 'Spain + Coastal + Mediterranean',
    prefs: {
      countries: ['Spain'],
      regions: [],
      geographic_features: ['Coastal'],
      vegetation_types: ['Mediterranean']
    }
  },
  {
    name: 'No preferences (open to anywhere)',
    prefs: {
      countries: [],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    }
  },
  {
    name: 'Europe + Coastal + Mediterranean',
    prefs: {
      countries: [],
      regions: ['Europe', 'Southern Europe'],
      geographic_features: ['Coastal'],
      vegetation_types: ['Mediterranean']
    }
  },
  {
    name: 'Spain only',
    prefs: {
      countries: ['Spain'],
      regions: [],
      geographic_features: [],
      vegetation_types: []
    }
  }
];

console.log('=== BAIONA REGIONAL SCORING SCENARIOS ===\n');

for (const scenario of scenarios) {
  console.log(`Scenario: ${scenario.name}`);
  console.log('User preferences:', JSON.stringify(scenario.prefs, null, 2));
  
  // Calculate scores based on algorithm logic
  let regionScore = 0;
  let geoScore = 0;
  let vegScore = 0;
  
  // Region/Country scoring (40 points max)
  if (!scenario.prefs.countries?.length && !scenario.prefs.regions?.length) {
    regionScore = 40; // Open to any location
  } else if (scenario.prefs.countries?.includes('Spain')) {
    regionScore = 40; // Country match
  } else if (scenario.prefs.regions?.some(r => bainoaData.regions.includes(r))) {
    regionScore = 30; // Region match
  }
  
  // Geographic scoring (30 points max)
  if (!scenario.prefs.geographic_features?.length) {
    geoScore = 30; // No preference
  } else if (scenario.prefs.geographic_features.map(f => f.toLowerCase()).includes('coastal')) {
    geoScore = 30; // Match
  }
  
  // Vegetation scoring (20 points max)
  if (!scenario.prefs.vegetation_types?.length) {
    vegScore = 20; // No preference
  } else if (scenario.prefs.vegetation_types.map(v => v.toLowerCase()).includes('mediterranean')) {
    vegScore = 20; // Match
  }
  
  const totalScore = regionScore + geoScore + vegScore;
  const percentage = Math.round((totalScore / 90) * 100);
  
  console.log(`Scores: Region=${regionScore}/40, Geo=${geoScore}/30, Veg=${vegScore}/20`);
  console.log(`TOTAL: ${totalScore}/90 = ${percentage}%`);
  console.log(percentage === 100 ? '✅ 100% MATCH!' : `❌ Not 100% (${percentage}%)`);
  console.log('---\n');
}
