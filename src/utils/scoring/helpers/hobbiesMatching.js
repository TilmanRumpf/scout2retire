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
  // OLD FORMAT: Compound buttons that need expansion (shouldn't see these anymore)
  'walking_cycling': ['Walking', 'Cycling', 'Hiking', 'Mountain Biking'],
  'golf_tennis': ['Golf', 'Tennis', 'Pickleball', 'Bocce Ball', 'Petanque'],
  'water_sports': ['Swimming', 'Snorkeling', 'Water Skiing', 'Swimming Laps', 'Water Aerobics'],
  'water_crafts': ['Kayaking', 'Sailing', 'Boating', 'Canoeing', 'Stand-up Paddleboarding'],
  'winter_sports': ['Downhill Skiing', 'Cross-country Skiing', 'Ice Skating', 'Snowboarding'],
  
  // NEW FORMAT: Direct hobby mappings (lowercase to proper case)
  'swimming': 'Swimming',
  'snorkeling': 'Snorkeling', 
  'water_skiing': 'Water Skiing',
  'swimming_laps': 'Swimming Laps',
  'water_aerobics': 'Water Aerobics',
  'golf': 'Golf',
  'tennis': 'Tennis',
  'pickleball': 'Pickleball',
  'bocce_ball': 'Bocce Ball',
  'petanque': 'Petanque',
  'shuffleboard': 'Shuffleboard',
  'ping_pong': 'Ping Pong',
  'walking': 'Walking',
  'cycling': 'Cycling',
  'hiking': 'Hiking',
  'jogging': 'Jogging',
  'mountain_biking': 'Mountain Biking',
  'nordic_walking': 'Nordic Walking',
  'fishing': 'Fishing',
  'gardening': 'Gardening',
  'skiing': 'Downhill Skiing',
  'cross_country_skiing': 'Cross-country Skiing',
  'ice_skating': 'Ice Skating',
  'snowboarding': 'Snowboarding',
  'sailing': 'Sailing',
  'kayaking': 'Kayaking',
  'canoeing': 'Canoeing',
  'boating': 'Boating',
  'paddleboarding': 'Paddleboarding',
  
  // Interests
  'arts': 'Arts & Crafts',
  'crafts': 'Arts & Crafts',
  'music': 'Music',
  'theater': 'Theater',
  'reading': 'Reading',
  'cooking': 'Cooking',
  'wine': 'Wine Tasting',
  'cooking_wine': ['Cooking', 'Wine Tasting', 'Wine'],
  'Cooking & Wine': ['Cooking', 'Wine Tasting', 'Wine'],
  'museums': 'Museums',
  'history': 'History',
  'photography': 'Photography',
  'painting': 'Painting',
  'drawing': 'Drawing',
  'pottery': 'Pottery',
  'dancing': 'Dancing',
  'yoga': 'Yoga',
  'volunteering': 'Volunteering'
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

  // Collect all user hobbies (normalize names)
  const userHobbyNames = [];
  
  // Add activities
  if (userHobbies.activities?.length) {
    userHobbies.activities.forEach(activity => {
      const mapped = legacyMapping[activity] || activity;
      // Handle both single strings and arrays
      if (Array.isArray(mapped)) {
        userHobbyNames.push(...mapped);
      } else {
        userHobbyNames.push(mapped);
      }
    });
  }
  
  // Add interests  
  if (userHobbies.interests?.length) {
    userHobbies.interests.forEach(interest => {
      const mapped = legacyMapping[interest] || interest;
      // Handle both single strings and arrays
      if (Array.isArray(mapped)) {
        userHobbyNames.push(...mapped);
      } else {
        userHobbyNames.push(mapped);
      }
    });
  }
  
  // Add custom physical activities from "Add More" button
  if (userHobbies.custom_physical?.length) {
    userHobbies.custom_physical.forEach(activity => {
      userHobbyNames.push(activity);
    });
  }
  
  // Add custom hobbies from "Add More" button
  if (userHobbies.custom_hobbies?.length) {
    userHobbies.custom_hobbies.forEach(hobby => {
      userHobbyNames.push(hobby);
    });
  }

  // Use Geographic Inference to determine available hobbies
  const inference = inferHobbyAvailability(town, userHobbyNames);
  const inferredScore = inferenceScore(town, userHobbyNames);
  
  // Extract details from inference
  matchedHobbies = inference.availableHobbies;
  missingHobbies = inference.details.notAvailable;
  const universalMatches = inference.details.universal;
  const totalUserHobbies = userHobbyNames.length;
  const totalMatches = matchedHobbies.length;

  // Use inference-based scoring which considers distinctive vs universal hobbies
  if (totalUserHobbies > 0) {
    // Use the sophisticated inference score
    score = inferredScore.score;
    
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