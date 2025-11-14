/**
 * Culture V2 Behavioral Analysis Script
 *
 * This script tests Culture V2 scoring with synthetic data that exercises
 * the new traditional_progressive_lean and social_atmosphere fields.
 *
 * Purpose: Generate data for CultureV2_Comparison_Report.md
 */

import './setup.js';
import { calculateCultureScore } from '../../src/utils/scoring/categories/cultureScoring.js';
import { FEATURE_FLAGS } from '../../src/utils/scoring/config.js';

// ============================================================================
// SYNTHETIC USER PROFILES
// ============================================================================

const userProfiles = {
  U1_traditional_quiet: {
    label: 'U1: Traditional + Quiet',
    preferences: {
      lifestyle_preferences: {
        urban_rural_preference: ['suburban'],
        pace_of_life_preference: ['relaxed']
      },
      language_comfort: {
        preferences: ['english_only'],
        already_speak: []
      },
      expat_community_preference: ['moderate'],
      cultural_importance: {
        dining_nightlife: 3,
        cultural_events: 'occasional',
        museums: 3
      },
      traditional_progressive_lean: ['traditional'],
      social_atmosphere: ['quiet']
    }
  },

  U2_progressive_vibrant: {
    label: 'U2: Progressive + Vibrant',
    preferences: {
      lifestyle_preferences: {
        urban_rural_preference: ['urban'],
        pace_of_life_preference: ['fast']
      },
      language_comfort: {
        preferences: ['willing_to_learn'],
        already_speak: ['English']
      },
      expat_community_preference: ['large'],
      cultural_importance: {
        dining_nightlife: 5,
        cultural_events: 'frequent',
        museums: 5
      },
      traditional_progressive_lean: ['progressive'],
      social_atmosphere: ['vibrant']
    }
  },

  U3_balanced_friendly: {
    label: 'U3: Balanced + Friendly',
    preferences: {
      lifestyle_preferences: {
        urban_rural_preference: ['suburban'],
        pace_of_life_preference: ['moderate']
      },
      language_comfort: {
        preferences: ['comfortable'],
        already_speak: ['English', 'Spanish']
      },
      expat_community_preference: ['moderate'],
      cultural_importance: {
        dining_nightlife: 3,
        cultural_events: 'regular',
        museums: 3
      },
      traditional_progressive_lean: ['balanced'],
      social_atmosphere: ['friendly']
    }
  },

  U4_open_to_anything: {
    label: 'U4: Open to Anything',
    preferences: {
      lifestyle_preferences: {
        urban_rural_preference: [],
        pace_of_life_preference: []
      },
      language_comfort: {
        preferences: [],
        already_speak: []
      },
      expat_community_preference: [],
      cultural_importance: {
        dining_nightlife: 1,
        cultural_events: 'occasional',
        museums: 1
      },
      // No V2 fields specified - should get 50% fallback
      traditional_progressive_lean: [],
      social_atmosphere: []
    }
  }
};

// ============================================================================
// SYNTHETIC TOWNS
// ============================================================================

const townTemplates = {
  // For U1: Traditional + Quiet user
  U1_TownA_perfect: {
    label: 'Town A (Perfect)',
    data: {
      town_name: 'Traditional Quiet Town',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'relaxed',
      primary_language: 'English',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 6,
      cultural_events_frequency: 'occasional',
      museums_rating: 7,
      traditional_progressive_lean: 'traditional',
      social_atmosphere: 'quiet'
    }
  },

  U1_TownB_adjacent: {
    label: 'Town B (Adjacent)',
    data: {
      town_name: 'Balanced Friendly Town',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'relaxed',
      primary_language: 'English',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 6,
      cultural_events_frequency: 'occasional',
      museums_rating: 7,
      traditional_progressive_lean: 'balanced',  // Adjacent to traditional
      social_atmosphere: 'friendly'               // Adjacent to quiet
    }
  },

  U1_TownC_opposite: {
    label: 'Town C (Opposite)',
    data: {
      town_name: 'Progressive Vibrant Town',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'relaxed',
      primary_language: 'English',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 6,
      cultural_events_frequency: 'occasional',
      museums_rating: 7,
      traditional_progressive_lean: 'progressive',  // Opposite of traditional
      social_atmosphere: 'vibrant'                  // Opposite of quiet
    }
  },

  // For U2: Progressive + Vibrant user
  U2_TownA_perfect: {
    label: 'Town A (Perfect)',
    data: {
      town_name: 'Progressive Vibrant City',
      urban_rural_character: 'urban',
      pace_of_life_actual: 'fast',
      primary_language: 'Spanish',
      english_proficiency_level: 'high',
      expat_community_size: 'large',
      restaurants_rating: 10,
      nightlife_rating: 10,
      cultural_events_frequency: 'frequent',
      museums_rating: 10,
      traditional_progressive_lean: 'progressive',
      social_atmosphere: 'vibrant'
    }
  },

  U2_TownB_adjacent: {
    label: 'Town B (Adjacent)',
    data: {
      town_name: 'Balanced Friendly City',
      urban_rural_character: 'urban',
      pace_of_life_actual: 'fast',
      primary_language: 'Spanish',
      english_proficiency_level: 'high',
      expat_community_size: 'large',
      restaurants_rating: 10,
      nightlife_rating: 10,
      cultural_events_frequency: 'frequent',
      museums_rating: 10,
      traditional_progressive_lean: 'balanced',  // Adjacent to progressive
      social_atmosphere: 'friendly'              // Adjacent to vibrant
    }
  },

  U2_TownC_opposite: {
    label: 'Town C (Opposite)',
    data: {
      town_name: 'Traditional Quiet City',
      urban_rural_character: 'urban',
      pace_of_life_actual: 'fast',
      primary_language: 'Spanish',
      english_proficiency_level: 'high',
      expat_community_size: 'large',
      restaurants_rating: 10,
      nightlife_rating: 10,
      cultural_events_frequency: 'frequent',
      museums_rating: 10,
      traditional_progressive_lean: 'traditional',  // Opposite of progressive
      social_atmosphere: 'quiet'                    // Opposite of vibrant
    }
  },

  // For U3: Balanced + Friendly user
  U3_TownA_perfect: {
    label: 'Town A (Perfect)',
    data: {
      town_name: 'Balanced Friendly Suburb',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'moderate',
      primary_language: 'Spanish',
      english_proficiency_level: 'moderate',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 7,
      cultural_events_frequency: 'regular',
      museums_rating: 7,
      traditional_progressive_lean: 'balanced',
      social_atmosphere: 'friendly'
    }
  },

  U3_TownB_traditional: {
    label: 'Town B (Traditional)',
    data: {
      town_name: 'Traditional Quiet Suburb',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'moderate',
      primary_language: 'Spanish',
      english_proficiency_level: 'moderate',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 7,
      cultural_events_frequency: 'regular',
      museums_rating: 7,
      traditional_progressive_lean: 'traditional',  // Adjacent to balanced
      social_atmosphere: 'quiet'                    // Adjacent to friendly
    }
  },

  U3_TownC_progressive: {
    label: 'Town C (Progressive)',
    data: {
      town_name: 'Progressive Vibrant Suburb',
      urban_rural_character: 'suburban',
      pace_of_life_actual: 'moderate',
      primary_language: 'Spanish',
      english_proficiency_level: 'moderate',
      expat_community_size: 'moderate',
      restaurants_rating: 7,
      nightlife_rating: 7,
      cultural_events_frequency: 'regular',
      museums_rating: 7,
      traditional_progressive_lean: 'progressive',  // Adjacent to balanced
      social_atmosphere: 'vibrant'                  // Adjacent to friendly
    }
  },

  // For U4: Open to anything
  U4_TownA_traditional: {
    label: 'Town A (Traditional)',
    data: {
      town_name: 'Some Traditional Town',
      traditional_progressive_lean: 'traditional',
      social_atmosphere: 'quiet'
      // Minimal other data - testing fallback behavior
    }
  },

  U4_TownB_balanced: {
    label: 'Town B (Balanced)',
    data: {
      town_name: 'Some Balanced Town',
      traditional_progressive_lean: 'balanced',
      social_atmosphere: 'friendly'
    }
  },

  U4_TownC_progressive: {
    label: 'Town C (Progressive)',
    data: {
      town_name: 'Some Progressive Town',
      traditional_progressive_lean: 'progressive',
      social_atmosphere: 'vibrant'
    }
  }
};

// ============================================================================
// TEST EXECUTION
// ============================================================================

function analyzeUserTownPair(userKey, townKey) {
  const user = userProfiles[userKey];
  const town = townTemplates[townKey];

  // Score with V1 (flag OFF)
  FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING = false;
  const v1Result = calculateCultureScore(user.preferences, town.data);

  // Score with V2 (flag ON)
  FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING = true;
  const v2Result = calculateCultureScore(user.preferences, town.data);

  // Restore flag
  FEATURE_FLAGS.ENABLE_CULTURE_V2_SCORING = false;

  return {
    userLabel: user.label,
    townLabel: town.label,
    userTraditional: user.preferences.traditional_progressive_lean?.[0] || '(none)',
    townTraditional: town.data.traditional_progressive_lean || '(none)',
    userSocial: user.preferences.social_atmosphere?.[0] || '(none)',
    townSocial: town.data.social_atmosphere || '(none)',
    cultureV1: v1Result.score,
    cultureV2: v2Result.score,
    cultureDiff: v2Result.score - v1Result.score,
    v1Factors: v1Result.factors,
    v2Factors: v2Result.factors
  };
}

// ============================================================================
// RUN ANALYSIS
// ============================================================================

console.log('📊 Culture V2 Behavioral Analysis\n');
console.log('═'.repeat(80));

const results = [];

// U1: Traditional + Quiet
console.log('\n👤 U1: Traditional + Quiet User');
console.log('─'.repeat(80));
['U1_TownA_perfect', 'U1_TownB_adjacent', 'U1_TownC_opposite'].forEach(townKey => {
  const result = analyzeUserTownPair('U1_traditional_quiet', townKey);
  results.push(result);
  console.log(`  ${result.townLabel}:`);
  console.log(`    Traditional: ${result.userTraditional} → ${result.townTraditional}`);
  console.log(`    Social: ${result.userSocial} → ${result.townSocial}`);
  console.log(`    Culture V1: ${result.cultureV1}%  |  V2: ${result.cultureV2}%  |  Diff: ${result.cultureDiff > 0 ? '+' : ''}${result.cultureDiff}`);
});

// U2: Progressive + Vibrant
console.log('\n👤 U2: Progressive + Vibrant User');
console.log('─'.repeat(80));
['U2_TownA_perfect', 'U2_TownB_adjacent', 'U2_TownC_opposite'].forEach(townKey => {
  const result = analyzeUserTownPair('U2_progressive_vibrant', townKey);
  results.push(result);
  console.log(`  ${result.townLabel}:`);
  console.log(`    Traditional: ${result.userTraditional} → ${result.townTraditional}`);
  console.log(`    Social: ${result.userSocial} → ${result.townSocial}`);
  console.log(`    Culture V1: ${result.cultureV1}%  |  V2: ${result.cultureV2}%  |  Diff: ${result.cultureDiff > 0 ? '+' : ''}${result.cultureDiff}`);
});

// U3: Balanced + Friendly
console.log('\n👤 U3: Balanced + Friendly User');
console.log('─'.repeat(80));
['U3_TownA_perfect', 'U3_TownB_traditional', 'U3_TownC_progressive'].forEach(townKey => {
  const result = analyzeUserTownPair('U3_balanced_friendly', townKey);
  results.push(result);
  console.log(`  ${result.townLabel}:`);
  console.log(`    Traditional: ${result.userTraditional} → ${result.townTraditional}`);
  console.log(`    Social: ${result.userSocial} → ${result.townSocial}`);
  console.log(`    Culture V1: ${result.cultureV1}%  |  V2: ${result.cultureV2}%  |  Diff: ${result.cultureDiff > 0 ? '+' : ''}${result.cultureDiff}`);
});

// U4: Open to anything
console.log('\n👤 U4: Open to Anything User (No V2 Preferences)');
console.log('─'.repeat(80));
['U4_TownA_traditional', 'U4_TownB_balanced', 'U4_TownC_progressive'].forEach(townKey => {
  const result = analyzeUserTownPair('U4_open_to_anything', townKey);
  results.push(result);
  console.log(`  ${result.townLabel}:`);
  console.log(`    Traditional: ${result.userTraditional} → ${result.townTraditional}`);
  console.log(`    Social: ${result.userSocial} → ${result.townSocial}`);
  console.log(`    Culture V1: ${result.cultureV1}%  |  V2: ${result.cultureV2}%  |  Diff: ${result.cultureDiff > 0 ? '+' : ''}${result.cultureDiff}`);
});

// ============================================================================
// STATISTICS
// ============================================================================

console.log('\n📈 Statistics Across All Test Cases');
console.log('═'.repeat(80));

const diffs = results.map(r => r.cultureDiff);
const minDiff = Math.min(...diffs);
const maxDiff = Math.max(...diffs);
const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

console.log(`  Culture Score Changes (V2 − V1):`);
console.log(`    Min: ${minDiff}%`);
console.log(`    Max: ${maxDiff}%`);
console.log(`    Average: ${avgDiff.toFixed(1)}%`);

const positiveDiffs = diffs.filter(d => d > 0).length;
const negativeDiffs = diffs.filter(d => d < 0).length;
const zeroDiffs = diffs.filter(d => d === 0).length;

console.log(`\n  Distribution:`);
console.log(`    Increased: ${positiveDiffs} cases`);
console.log(`    Decreased: ${negativeDiffs} cases`);
console.log(`    Unchanged: ${zeroDiffs} cases`);

console.log('\n═'.repeat(80));
console.log('✅ Analysis complete!');
console.log(`   Results saved for CultureV2_Comparison_Report.md`);

// Export results for report generation
export { results, userProfiles, townTemplates };
