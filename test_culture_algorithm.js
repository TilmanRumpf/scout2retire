import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

// Culture adjacency maps
const CULTURE_ADJACENCY = {
  urban_rural: {
    'urban': ['suburban'],
    'suburban': ['urban', 'rural'],
    'rural': ['suburban']
  },
  pace_of_life: {
    'fast': ['moderate'],
    'moderate': ['fast', 'relaxed'],
    'relaxed': ['moderate']
  },
  expat_community: {
    'large': ['moderate'],
    'moderate': ['large', 'small'],
    'small': ['moderate']
  }
};

// Test the new culture algorithm
function calculateCultureScore(preferences, town) {
  let score = 0;
  let factors = [];
  
  // Check if user has any culture preferences at all
  const hasAnyPreferences = 
    preferences.lifestyle_preferences?.urban_rural?.length ||
    preferences.lifestyle_preferences?.pace_of_life?.length ||
    preferences.expat_community_preference?.length ||
    preferences.language_comfort?.preferences?.length ||
    preferences.language_comfort?.already_speak?.length ||
    (preferences.cultural_importance?.dining_nightlife > 1) ||
    (preferences.cultural_importance?.cultural_events > 1) ||
    (preferences.cultural_importance?.museums > 1);
  
  if (!hasAnyPreferences) {
    score = 100;
    factors.push({ factor: 'Open to any culture', score: 100 });
    return { score, factors, category: 'Culture' };
  }
  
  // 1. LIVING ENVIRONMENT (20 points)
  const livingEnvPref = preferences.lifestyle_preferences?.urban_rural;
  if (!livingEnvPref || livingEnvPref.length === 0) {
    score += 20;
    factors.push({ factor: 'Flexible on living environment', score: 20 });
  } else if (town.urban_rural_character) {
    if (livingEnvPref.includes(town.urban_rural_character)) {
      score += 20;
      factors.push({ factor: `Living environment matched (${town.urban_rural_character})`, score: 20 });
    } else {
      let isAdjacent = false;
      for (const pref of livingEnvPref) {
        if (CULTURE_ADJACENCY.urban_rural[pref]?.includes(town.urban_rural_character)) {
          isAdjacent = true;
          break;
        }
      }
      if (isAdjacent) {
        score += 10;
        factors.push({ factor: `Living environment close match (${town.urban_rural_character})`, score: 10 });
      } else {
        factors.push({ factor: `Living environment mismatch (${town.urban_rural_character})`, score: 0 });
      }
    }
  } else {
    score += 12;
    factors.push({ factor: 'Living environment data unavailable', score: 12 });
  }
  
  // 2. PACE OF LIFE (20 points)
  const pacePref = preferences.lifestyle_preferences?.pace_of_life;
  const townPace = town.pace_of_life_actual || town.pace_of_life;
  
  if (!pacePref || pacePref.length === 0) {
    score += 20;
    factors.push({ factor: 'Flexible on pace of life', score: 20 });
  } else if (townPace) {
    if (pacePref.includes(townPace)) {
      score += 20;
      factors.push({ factor: `Pace of life matched (${townPace})`, score: 20 });
    } else {
      let isAdjacent = false;
      for (const pref of pacePref) {
        if (CULTURE_ADJACENCY.pace_of_life[pref]?.includes(townPace)) {
          isAdjacent = true;
          break;
        }
      }
      if (isAdjacent) {
        score += 10;
        factors.push({ factor: `Pace of life close match (${townPace})`, score: 10 });
      } else {
        factors.push({ factor: `Pace of life mismatch (${townPace})`, score: 0 });
      }
    }
  } else {
    score += 12;
    factors.push({ factor: 'Pace of life data unavailable', score: 12 });
  }
  
  // For testing, simplified language and other scores
  score += 20; // Language
  score += 10; // Expat community
  score += 10; // Dining
  score += 10; // Events
  score += 10; // Museums
  
  factors.push({ factor: 'Language (simplified for test)', score: 20 });
  factors.push({ factor: 'Expat community (simplified)', score: 10 });
  factors.push({ factor: 'Cultural amenities (simplified)', score: 30 });
  
  return {
    score: Math.min(score, 100),
    factors,
    category: 'Culture'
  };
}

async function testCultureAlgorithm() {
  console.log('Testing New Culture Algorithm\n');
  console.log('='.repeat(50));
  
  // Get a sample town with culture data
  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .not('urban_rural_character', 'is', null)
    .not('pace_of_life_actual', 'is', null)
    .limit(3);
  
  if (error) {
    console.error('Error fetching towns:', error);
    return;
  }
  
  // Test Case 1: User with no preferences (should get 100%)
  console.log('\nTest 1: User with NO preferences');
  console.log('-'.repeat(30));
  const noPrefs = {};
  const result1 = calculateCultureScore(noPrefs, towns[0]);
  console.log(`Score: ${result1.score}/100`);
  console.log('Factors:', result1.factors);
  
  // Test Case 2: User with exact matches
  console.log('\n\nTest 2: User with EXACT matches');
  console.log('-'.repeat(30));
  const exactPrefs = {
    lifestyle_preferences: {
      urban_rural: [towns[0].urban_rural_character],
      pace_of_life: [towns[0].pace_of_life_actual || towns[0].pace_of_life]
    },
    expat_community_preference: [towns[0].expat_community_size],
    cultural_importance: {
      dining_nightlife: 1,
      cultural_events: 1,
      museums: 1
    }
  };
  const result2 = calculateCultureScore(exactPrefs, towns[0]);
  console.log(`Town: ${towns[0].name}, ${towns[0].country}`);
  console.log(`Score: ${result2.score}/100`);
  console.log('Factors:', result2.factors);
  
  // Test Case 3: User with adjacent matches
  console.log('\n\nTest 3: User with ADJACENT matches');
  console.log('-'.repeat(30));
  const adjacentPrefs = {
    lifestyle_preferences: {
      urban_rural: ['urban'],
      pace_of_life: ['fast']
    },
    expat_community_preference: ['large'],
    cultural_importance: {
      dining_nightlife: 5,
      cultural_events: 5,
      museums: 5
    }
  };
  
  // Find a suburban/moderate town
  const suburbanTown = towns.find(t => t.urban_rural_character === 'suburban') || towns[1];
  const result3 = calculateCultureScore(adjacentPrefs, suburbanTown);
  console.log(`Town: ${suburbanTown.name}, ${suburbanTown.country}`);
  console.log(`Urban/Rural: ${suburbanTown.urban_rural_character}`);
  console.log(`Pace: ${suburbanTown.pace_of_life_actual || suburbanTown.pace_of_life}`);
  console.log(`Score: ${result3.score}/100`);
  console.log('Factors:', result3.factors);
  
  // Test Case 4: User with mismatches
  console.log('\n\nTest 4: User with MISMATCHES');
  console.log('-'.repeat(30));
  const mismatchPrefs = {
    lifestyle_preferences: {
      urban_rural: ['rural'],
      pace_of_life: ['relaxed']
    },
    expat_community_preference: ['small'],
    cultural_importance: {
      dining_nightlife: 9,
      cultural_events: 9,
      museums: 9
    }
  };
  
  // Find an urban/fast town
  const urbanTown = towns.find(t => t.urban_rural_character === 'urban') || towns[0];
  const result4 = calculateCultureScore(mismatchPrefs, urbanTown);
  console.log(`Town: ${urbanTown.name}, ${urbanTown.country}`);
  console.log(`Urban/Rural: ${urbanTown.urban_rural_character}`);
  console.log(`Pace: ${urbanTown.pace_of_life_actual || urbanTown.pace_of_life}`);
  console.log(`Score: ${result4.score}/100`);
  console.log('Factors:', result4.factors);
  
  console.log('\n' + '='.repeat(50));
  console.log('Culture Algorithm Test Complete');
}

testCultureAlgorithm();