import supabase from '../../supabaseClient.js';
import { inferHobbyAvailability, calculateHobbyScore as inferenceScore } from '../geographicInference.js';

/**
 * Enhanced hobbies matching using Geographic Inference System
 * 
 * Instead of using towns_hobbies table (865k relationships),
 * we infer hobby availability from town characteristics
 */

// Cache for hobbies data to avoid repeated fetches
let hobbiesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Get all hobbies from database with caching
 */
async function getAllHobbies() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (hobbiesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return hobbiesCache;
  }

  try {
    const { data, error } = await supabase
      .from('hobbies')
      .select('*');
    
    if (error) throw error;
    
    // Update cache
    hobbiesCache = data;
    cacheTimestamp = now;
    
    return data;
  } catch (error) {
    console.error('Error fetching hobbies:', error);
    return [];
  }
}

/**
 * Get hobbies available in a specific town using Geographic Inference
 * No longer uses towns_hobbies table
 */
async function getTownHobbies(town) {
  // This function is now deprecated - we use inference directly
  // Kept for backwards compatibility but returns empty
  return [];
}

/**
 * Map activity strings to proper hobby names in database
 * UPDATED: Now handles both old compound buttons AND new expanded hobbies
 */
const legacyMapping = {
  // OLD FORMAT: Compound buttons that need expansion (keep lowercase!)
  'walking_cycling': ['walking', 'cycling', 'hiking', 'mountain biking'],
  'golf_tennis': ['golf', 'tennis', 'pickleball', 'bocce ball', 'petanque'],
  'water_sports': ['swimming', 'snorkeling', 'water skiing', 'swimming laps', 'water aerobics'],
  'water_crafts': ['kayaking', 'sailing', 'boating', 'canoeing', 'stand-up paddleboarding'],
  'winter_sports': ['downhill skiing', 'cross-country skiing', 'ice skating', 'snowboarding'],
  
  // NEW FORMAT: Keep lowercase (no case conversion!)
  'swimming': 'swimming',
  'snorkeling': 'snorkeling', 
  'water_skiing': 'water skiing',
  'swimming_laps': 'swimming laps',
  'water_aerobics': 'water aerobics',
  'golf': 'golf',
  'tennis': 'tennis',
  'pickleball': 'pickleball',
  'bocce_ball': 'bocce ball',
  'petanque': 'petanque',
  'shuffleboard': 'shuffleboard',
  'ping_pong': 'ping pong',
  'walking': 'walking',
  'cycling': 'cycling',
  'hiking': 'hiking',
  'jogging': 'jogging',
  'mountain_biking': 'mountain biking',
  'nordic_walking': 'nordic walking',
  'fishing': 'fishing',
  'gardening': 'gardening',
  'skiing': 'downhill skiing',
  'cross_country_skiing': 'cross-country skiing',
  'ice_skating': 'ice skating',
  'snowboarding': 'snowboarding',
  'sailing': 'sailing',
  'kayaking': 'kayaking',
  'canoeing': 'canoeing',
  'boating': 'boating',
  'paddleboarding': 'paddleboarding',
  'stand_up_paddleboarding': 'stand-up paddleboarding',
  'surfing': 'surfing',
  'windsurfing': 'windsurfing',
  'kitesurfing': 'kitesurfing',
  'scuba_diving': 'scuba diving',
  'deep_sea_fishing': 'deep sea fishing',
  'water_polo': 'water polo',
  'yacht_racing': 'yacht racing',
  
  // Interests (keep lowercase!)
  'arts': 'arts & crafts',
  'crafts': 'arts & crafts',
  'music': 'music',
  'theater': 'theater',
  'reading': 'reading',
  'cooking': 'cooking',
  'wine': 'wine tasting',
  'cooking_wine': ['cooking', 'wine tasting', 'wine'],
  'Cooking & Wine': ['cooking', 'wine tasting', 'wine'],
  'museums': 'museums',
  'history': 'history',
  'photography': 'photography',
  'painting': 'painting',
  'drawing': 'drawing',
  'pottery': 'pottery',
  'dancing': 'dancing',
  'yoga': 'yoga',
  'volunteering': 'volunteering'
};

/**
 * Calculate hobbies match score between user preferences and town
 * 
 * @param {Object} userHobbies - User's hobby preferences
 *   - activities: array of activity strings
 *   - interests: array of interest strings
 *   - custom_activities: array of custom hobby strings
 *   - travel_frequency: string (rare/occasional/frequent)
 * @param {Object} town - Town data with id
 * @returns {Object} Score breakdown with details
 */
export async function calculateHobbiesScore(userHobbies, town) {
  let score = 0;
  let factors = [];
  let matchedHobbies = [];
  let missingHobbies = [];

  // If user has no preferences, they're flexible - perfect score
  if (!userHobbies?.activities?.length && 
      !userHobbies?.interests?.length &&
      !userHobbies?.custom_activities?.length) {
    return {
      score: 100,
      factors: [{ factor: 'Open to any activities', score: 100 }],
      category: 'Hobbies',
      details: {
        matched: [],
        missing: [],
        universal: [],
        totalUserHobbies: 0,
        townSpecificHobbies: 0
      }
    };
  }

  // Collect all user hobbies (normalize names) with tier tracking
  const userHobbyNames = [];
  const hobbyTiers = {}; // Track which tier each hobby came from
  
  // Create a Set of custom_physical items for fast lookup
  const customPhysicalSet = new Set(userHobbies.custom_physical || []);
  
  // Add activities with proper tier assignment
  if (userHobbies.activities?.length) {
    userHobbies.activities.forEach(activity => {
      const mapped = legacyMapping[activity] || activity;
      // Handle both single strings and arrays
      if (Array.isArray(mapped)) {
        mapped.forEach(h => {
          userHobbyNames.push(h);
          // Check if this activity is from Explore More (Tier 2) or compound button (Tier 1)
          hobbyTiers[h] = customPhysicalSet.has(h) ? 2 : 1;
        });
      } else {
        userHobbyNames.push(mapped);
        // Check if this activity is from Explore More (Tier 2) or compound button (Tier 1)
        hobbyTiers[mapped] = customPhysicalSet.has(activity) ? 2 : 1;
      }
    });
  }
  
  // Create a Set of custom_hobbies items for fast lookup
  const customHobbiesSet = new Set(userHobbies.custom_hobbies || []);
  
  // Add interests with proper tier assignment
  if (userHobbies.interests?.length) {
    userHobbies.interests.forEach(interest => {
      const mapped = legacyMapping[interest] || interest;
      // Handle both single strings and arrays
      if (Array.isArray(mapped)) {
        mapped.forEach(h => {
          userHobbyNames.push(h);
          // Check if this interest is from Explore More (Tier 2) or compound button (Tier 1)
          hobbyTiers[h] = customHobbiesSet.has(h) ? 2 : 1;
        });
      } else {
        userHobbyNames.push(mapped);
        // Check if this interest is from Explore More (Tier 2) or compound button (Tier 1)
        hobbyTiers[mapped] = customHobbiesSet.has(interest) ? 2 : 1;
      }
    });
  }
  
  // Note: We don't need to add custom_physical and custom_hobbies separately
  // because they're already included in activities/interests arrays (see OnboardingHobbies.jsx line 940)
  // The tier assignment above already handles them correctly

  // Use Geographic Inference to determine available hobbies
  const inference = inferHobbyAvailability(town, userHobbyNames);
  const inferredScore = inferenceScore(town, userHobbyNames);
  
  // Extract details from inference
  matchedHobbies = inference.availableHobbies;
  missingHobbies = inference.details.notAvailable;
  const universalMatches = inference.details.universal;
  const totalUserHobbies = userHobbyNames.length;
  const totalMatches = matchedHobbies.length;

  // Use inference-based scoring with TIERED weighting
  if (totalUserHobbies > 0) {
    // Calculate weighted score based on tiers
    let weightedMatches = 0;
    let totalWeight = 0;
    
    // Count weighted matches
    matchedHobbies.forEach(hobby => {
      const tier = hobbyTiers[hobby] || 1;
      const weight = tier === 2 ? 2 : 1; // Tier 2 gets 2x weight
      weightedMatches += weight;
    });
    
    // Count total weights for all user hobbies
    userHobbyNames.forEach(hobby => {
      const tier = hobbyTiers[hobby] || 1;
      const weight = tier === 2 ? 2 : 1;
      totalWeight += weight;
    });
    
    // Calculate weighted percentage
    const weightedPercentage = totalWeight > 0 ? (weightedMatches / totalWeight * 100) : 0;
    
    // Base score on weighted percentage
    score = Math.round(weightedPercentage);
    
    // Add bonus for native matches (from inference score)
    if (inferredScore.score > score) {
      // Native matches can boost score up to 95%
      score = Math.min(95, Math.max(score, inferredScore.score));
    }
    
    // Add factors based on match quality
    const matchPercentage = inferredScore.matchPercentage;
    
    if (matchPercentage >= 80) {
      factors.push({ 
        factor: `${totalMatches}/${totalUserHobbies} hobbies available`, 
        score: Math.round(score) 
      });
    } else if (matchPercentage >= 60) {
      factors.push({ 
        factor: `Most hobbies available (${totalMatches}/${totalUserHobbies})`, 
        score: Math.round(score) 
      });
    } else if (matchPercentage >= 40) {
      factors.push({ 
        factor: `Some hobbies available (${totalMatches}/${totalUserHobbies})`, 
        score: Math.round(score) 
      });
    } else if (matchPercentage >= 20) {
      factors.push({ 
        factor: `Few hobbies available (${totalMatches}/${totalUserHobbies})`, 
        score: Math.round(score) 
      });
    } else {
      factors.push({ 
        factor: `Limited hobby matches (${totalMatches}/${totalUserHobbies})`, 
        score: Math.round(score) 
      });
    }
    
    // Add detail about distinctive hobbies if present
    if (inference.details.distinctive.length > 0) {
      factors.push({
        factor: `Town specializes in: ${inference.details.distinctive.slice(0, 3).join(', ')}`,
        score: 10
      });
      score = Math.min(100, score + 10);
    }
  }

  // Bonus for travel infrastructure (up to 15 points)
  if (userHobbies.travel_frequency) {
    const hasAirport = town.activity_infrastructure?.airport || 
                      town.transport_links?.includes('airport') ||
                      town.distance_to_airport < 50;
    
    if (userHobbies.travel_frequency === 'frequent' && hasAirport) {
      score += 15;
      factors.push({ factor: 'Good airport access for frequent travel', score: 15 });
    } else if (userHobbies.travel_frequency === 'frequent' && !hasAirport) {
      // Penalty for frequent travelers without good airport access
      score -= 10;
      factors.push({ factor: 'Poor airport access for frequent traveler', score: -10 });
    } else if (userHobbies.travel_frequency === 'occasional' && hasAirport) {
      score += 10;
      factors.push({ factor: 'Airport access for occasional travel', score: 10 });
    }
  }

  // Count town's distinctive hobbies for context
  const townSpecificCount = town.top_hobbies?.length || 0;

  // Ensure score is between 0 and 100
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    factors,
    category: 'Hobbies',
    details: {
      matched: matchedHobbies,
      missing: missingHobbies,
      universal: universalMatches,
      totalUserHobbies,
      townSpecificHobbies: townSpecificCount,
      matchPercentage: totalUserHobbies > 0 ? (totalMatches / totalUserHobbies * 100).toFixed(1) : 0
    }
  };
}

/**
 * Get hobby recommendations for a town using inference
 */
export async function getTownHobbyRecommendations(town) {
  // Get all possible hobbies
  const allHobbies = await getAllHobbies();
  const allHobbyNames = allHobbies.map(h => h.name);
  
  // Use inference to determine which are available
  const inference = inferHobbyAvailability(town, allHobbyNames);
  const availableNames = new Set(inference.availableHobbies);
  
  // Filter to only available hobbies
  const availableHobbies = allHobbies.filter(hobby => 
    availableNames.has(hobby.name)
  );
  
  // Separate distinctive (from top_hobbies) and others
  const distinctiveHobbies = town.top_hobbies || [];
  const highlights = [];
  
  // Add distinctive hobbies as highlights
  distinctiveHobbies.slice(0, 5).forEach(hobbyName => {
    highlights.push(`${hobbyName} (Town specialty)`);
  });
  
  // Group by category
  const grouped = {
    distinctive: distinctiveHobbies,
    activities: availableHobbies.filter(h => h.category === 'activity'),
    interests: availableHobbies.filter(h => h.category === 'interest'),
    universal: inference.details.universal
  };
  
  return {
    total: availableHobbies.length,
    grouped,
    highlights
  };
}