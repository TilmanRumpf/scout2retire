import supabase from '../../supabaseClient.js';

/**
 * Enhanced hobbies matching using normalized hobbies database
 * 
 * This function intelligently matches user hobbies with town offerings
 * using the normalized hobbies table with universal vs specific hobbies
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
 * Get hobbies available in a specific town
 */
async function getTownHobbies(townId) {
  try {
    const { data, error } = await supabase
      .from('towns_hobbies')
      .select('hobby_id')
      .eq('town_id', townId);
    
    if (error) throw error;
    
    return data.map(th => th.hobby_id);
  } catch (error) {
    console.error('Error fetching town hobbies from towns_hobbies:', error);
    return [];
  }
}

/**
 * Map old activity/interest strings to hobby names for backward compatibility
 */
const legacyMapping = {
  // Compound mappings (expand to multiple hobbies)
  'walking_cycling': ['Walking', 'Cycling'],
  'golf_tennis': ['Golf', 'Tennis'],
  'water_sports': ['Swimming', 'Water Sports'],
  'water_crafts': ['Kayaking', 'Sailing', 'Boating'],
  'winter_sports': ['Winter Sports', 'Ice skating', 'Cross-country skiing'],
  'arts_culture': ['Arts & Crafts', 'Theater', 'Music'],
  'food_drink': ['Cooking', 'Wine', 'Baking'],
  
  // Activities
  'walking': 'Walking',
  'swimming': 'Swimming',
  'cycling': 'Cycling',
  'golf': 'Golf',
  'tennis': 'Tennis',
  'water_sports': 'Water Sports',
  'winter_sports': 'Winter Sports',
  'fishing': 'Fishing',
  'gardening': 'Gardening',
  
  // Interests
  'arts': 'Arts & Crafts',
  'music': 'Music',
  'theater': 'Theater',
  'reading': 'Reading',
  'cooking': 'Cooking',
  'wine': 'Wine',
  'history': 'History',
  'photography': 'Photography',
  'volunteering': 'Volunteering',
  
  // Common alternatives
  'hiking': 'Hiking',
  'sailing': 'Sailing',
  'yoga': 'Yoga',
  'dancing': 'Dancing',
  'museums': 'Museums'
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

  // Get all hobbies data
  const allHobbies = await getAllHobbies();
  const townSpecificHobbyIds = await getTownHobbies(town.id);
  
  // Create lookup maps
  const hobbyByName = {};
  const hobbyById = {};
  const universalHobbies = new Set();
  
  allHobbies.forEach(hobby => {
    hobbyByName[hobby.name.toLowerCase()] = hobby;
    hobbyById[hobby.id] = hobby;
    if (hobby.is_universal) {
      universalHobbies.add(hobby.name.toLowerCase());
    }
  });

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
  
  // Add custom activities (ensure Title Case)
  if (userHobbies.custom_activities?.length) {
    userHobbies.custom_activities.forEach(activity => {
      // Convert to Title Case to match database format
      const titleCased = activity.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      userHobbyNames.push(titleCased);
    });
  }

  // Calculate matches
  let totalMatches = 0;
  const totalUserHobbies = userHobbyNames.length;
  const universalMatches = [];

  userHobbyNames.forEach(hobbyName => {
    const normalizedName = hobbyName.toLowerCase();
    const hobby = hobbyByName[normalizedName];
    
    if (hobby) {
      // Check if hobby is available in this town
      if (hobby.is_universal) {
        // Universal hobbies are available everywhere
        totalMatches++;
        matchedHobbies.push(hobbyName);
        universalMatches.push(hobbyName);
      } else if (townSpecificHobbyIds.includes(hobby.id)) {
        // Location-specific hobby is available in this town
        totalMatches++;
        matchedHobbies.push(hobbyName);
      } else {
        // Hobby not available in this town
        missingHobbies.push(hobbyName);
      }
    } else {
      // Hobby not in database (shouldn't happen with good data)
      // console.warn(`Hobby not found in database: ${hobbyName}`);
      missingHobbies.push(hobbyName);
    }
  });

  // Calculate base score - REALISTIC scoring based on actual matches
  if (totalUserHobbies > 0) {
    const matchPercentage = (totalMatches / totalUserHobbies) * 100;
    
    // Direct proportional scoring - no inflation
    score = Math.min(85, matchPercentage * 0.85);  // Cap at 85 to leave room for bonuses
    
    // Add factors based on match quality
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

  // Count town's specific hobbies for context
  const townSpecificCount = townSpecificHobbyIds.length;

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
 * Get hobby recommendations for a town
 */
export async function getTownHobbyRecommendations(townId) {
  const allHobbies = await getAllHobbies();
  const townSpecificHobbyIds = await getTownHobbies(townId);
  
  // Get all available hobbies (universal + town-specific)
  const availableHobbies = allHobbies.filter(hobby => 
    hobby.is_universal || townSpecificHobbyIds.includes(hobby.id)
  );
  
  // Group by category
  const grouped = {
    activities: availableHobbies.filter(h => h.category === 'activity'),
    interests: availableHobbies.filter(h => h.category === 'interest'),
    custom: availableHobbies.filter(h => h.category === 'custom')
  };
  
  return {
    total: availableHobbies.length,
    grouped,
    highlights: availableHobbies
      .filter(h => h.description)
      .slice(0, 5)
      .map(h => `${h.name}: ${h.description}`)
  };
}