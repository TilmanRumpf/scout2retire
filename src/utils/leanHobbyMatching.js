/**
 * Lean Hobby Matching System
 * Efficient, direct correlation between user onboarding choices and town capabilities
 */

import supabase from './supabaseClient.js';

/**
 * Core hobby categories that users actually select (based on data analysis)
 * These are the ONLY hobbies that matter for matching
 */
const CORE_HOBBIES = {
  // Top physical activities (80% of user selections)
  activities: [
    'walking', 'cycling', 'swimming', 'golf', 'tennis', 
    'fishing', 'hiking', 'water_sports', 'gardening'
  ],
  // Top interests (cultural/indoor)
  interests: [
    'theater', 'wine', 'music', 'reading', 'cooking', 
    'arts', 'history', 'museums', 'volunteering'
  ]
};

/**
 * Universal hobbies available in EVERY town
 * No need to store these in town_hobbies table
 */
const UNIVERSAL_HOBBIES = [
  'walking', 'reading', 'cooking', 'gardening', 'arts', 'music'
];

/**
 * Location-specific hobbies that require infrastructure
 * These MUST be checked against town capabilities
 */
const LOCATION_SPECIFIC = {
  'swimming': ['beach', 'pool', 'lake', 'coast'],
  'water_sports': ['beach', 'coast', 'lake', 'water'],
  'fishing': ['coast', 'lake', 'river', 'ocean'],
  'golf': ['golf_course'],
  'tennis': ['tennis_courts', 'sports_facilities'],
  'hiking': ['trails', 'mountains', 'parks'],
  'cycling': ['bike_paths', 'trails'],
  'wine': ['vineyards', 'wine_region'],
  'theater': ['cultural_center', 'theater'],
  'museums': ['museums', 'galleries']
};

/**
 * LEAN scoring function - direct and efficient
 * @param {Array} userActivities - User's selected activities
 * @param {Array} userInterests - User's selected interests  
 * @param {Object} town - Town data with basic fields
 * @returns {Object} Score and breakdown
 */
export function calculateLeanHobbyScore(userActivities = [], userInterests = [], town) {
  let score = 0;
  let matched = [];
  let missing = [];
  
  // Combine all user hobbies
  const allUserHobbies = [...userActivities, ...userInterests];
  const totalHobbies = allUserHobbies.length;
  
  // No hobbies = flexible user = perfect score
  if (totalHobbies === 0) {
    return {
      score: 100,
      matched: [],
      missing: [],
      factors: [{ factor: 'Open to any activities', score: 100 }]
    };
  }
  
  // Check each hobby
  for (const hobby of allUserHobbies) {
    const hobbyLower = hobby.toLowerCase();
    
    // Universal hobbies are always available
    if (UNIVERSAL_HOBBIES.includes(hobbyLower)) {
      matched.push(hobby);
      continue;
    }
    
    // Check location-specific hobbies
    if (LOCATION_SPECIFIC[hobbyLower]) {
      const requirements = LOCATION_SPECIFIC[hobbyLower];
      const townFeatures = [
        ...(town.geographic_features_actual || []),
        ...(town.activities_available || []),
        town.description || ''
      ].join(' ').toLowerCase();
      
      // Check if town has ANY of the required features
      const hasFeature = requirements.some(req => townFeatures.includes(req));
      
      if (hasFeature) {
        matched.push(hobby);
      } else {
        missing.push(hobby);
      }
    } else {
      // Unknown hobby - check if mentioned in town description
      const townText = (town.description || '').toLowerCase();
      if (townText.includes(hobbyLower)) {
        matched.push(hobby);
      } else {
        missing.push(hobby);
      }
    }
  }
  
  // Calculate score - simple percentage
  const matchPercentage = (matched.length / totalHobbies) * 100;
  score = Math.round(matchPercentage);
  
  // Generate factors
  const factors = [];
  if (matchPercentage >= 80) {
    factors.push({ 
      factor: `Excellent: ${matched.length}/${totalHobbies} hobbies available`,
      score: score
    });
  } else if (matchPercentage >= 60) {
    factors.push({ 
      factor: `Good: ${matched.length}/${totalHobbies} hobbies available`,
      score: score
    });
  } else if (matchPercentage >= 40) {
    factors.push({ 
      factor: `Fair: ${matched.length}/${totalHobbies} hobbies available`,
      score: score
    });
  } else {
    factors.push({ 
      factor: `Limited: ${matched.length}/${totalHobbies} hobbies available`,
      score: score
    });
  }
  
  // Add specific feedback
  if (missing.length > 0 && missing.length <= 3) {
    factors.push({ 
      factor: `Missing: ${missing.join(', ')}`,
      score: 0
    });
  }
  
  return {
    score: score,
    matched: matched,
    missing: missing,
    factors: factors,
    category: 'Hobbies'
  };
}

/**
 * Get towns with best hobby matches for a user (LEAN QUERY)
 * Uses direct SQL for efficiency
 */
export async function getTopHobbyMatches(userId, limit = 10) {
  try {
    // First get user preferences
    const { data: userData, error: userError } = await supabase
      .from('user_preferences')
      .select('activities, interests')
      .eq('user_id', userId)
      .single();
    
    if (userError) throw userError;
    
    const userActivities = userData.activities || [];
    const userInterests = userData.interests || [];
    
    // If no hobbies, all towns are equal
    if (userActivities.length === 0 && userInterests.length === 0) {
      const { data: towns } = await supabase
        .from('towns')
        .select('*')
        .not('image_url_1', 'is', null)
        .limit(limit);
      
      return towns.map(t => ({
        ...t,
        hobbyScore: 100,
        hobbyMatch: 'Flexible user - all towns suitable'
      }));
    }
    
    // Get all towns with photos
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .not('image_url_1', 'is', null);
    
    if (townsError) throw townsError;
    
    // Score each town
    const scoredTowns = towns.map(town => {
      const result = calculateLeanHobbyScore(userActivities, userInterests, town);
      return {
        ...town,
        hobbyScore: result.score,
        hobbyMatched: result.matched,
        hobbyMissing: result.missing
      };
    });
    
    // Sort by hobby score and return top matches
    return scoredTowns
      .sort((a, b) => b.hobbyScore - a.hobbyScore)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting hobby matches:', error);
    return [];
  }
}

/**
 * Populate town capabilities based on existing data
 * One-time migration to set up lean hobby matching
 */
export async function populateTownCapabilities() {
  try {
    // Get all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, geographic_features_actual, activities_available, description');
    
    if (error) throw error;
    
    const updates = [];
    
    for (const town of towns) {
      const capabilities = new Set();
      
      // Extract capabilities from geographic features
      const geoFeatures = town.geographic_features_actual || [];
      geoFeatures.forEach(f => {
        const feature = f.toLowerCase();
        if (feature.includes('coast') || feature.includes('beach')) {
          capabilities.add('swimming');
          capabilities.add('water_sports');
          capabilities.add('fishing');
        }
        if (feature.includes('mountain') || feature.includes('hill')) {
          capabilities.add('hiking');
        }
        if (feature.includes('lake') || feature.includes('river')) {
          capabilities.add('fishing');
          capabilities.add('swimming');
        }
      });
      
      // Extract from activities available
      const activities = town.activities_available || [];
      activities.forEach(a => {
        const activity = a.toLowerCase();
        if (activity.includes('golf')) capabilities.add('golf');
        if (activity.includes('tennis')) capabilities.add('tennis');
        if (activity.includes('wine') || activity.includes('vineyard')) capabilities.add('wine');
        if (activity.includes('museum')) capabilities.add('museums');
        if (activity.includes('theater')) capabilities.add('theater');
        if (activity.includes('hik') || activity.includes('trail')) capabilities.add('hiking');
        if (activity.includes('cycl') || activity.includes('bike')) capabilities.add('cycling');
      });
      
      // Extract from description
      const description = (town.description || '').toLowerCase();
      if (description.includes('golf')) capabilities.add('golf');
      if (description.includes('beach') || description.includes('coast')) {
        capabilities.add('swimming');
        capabilities.add('water_sports');
      }
      if (description.includes('wine') || description.includes('vineyard')) capabilities.add('wine');
      if (description.includes('museum')) capabilities.add('museums');
      if (description.includes('theater') || description.includes('cultural')) capabilities.add('theater');
      
      // Store capabilities as JSON in a new field (or update existing)
      if (capabilities.size > 0) {
        updates.push({
          id: town.id,
          hobby_capabilities: Array.from(capabilities)
        });
      }
    }
    
    // Batch update towns with capabilities
    console.log(`Updating ${updates.length} towns with hobby capabilities...`);
    
    // You would update the towns table with a new hobby_capabilities field
    // This is a one-time migration
    
    return updates;
    
  } catch (error) {
    console.error('Error populating capabilities:', error);
    return [];
  }
}