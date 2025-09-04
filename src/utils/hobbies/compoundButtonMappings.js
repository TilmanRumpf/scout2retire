// Compound Button Mappings using Database Groups
// This module fetches actual group members from the database instead of hard-coding

import supabase from '../supabaseClient';

// Map button IDs to database group names
const BUTTON_TO_GROUP_MAPPING = {
  // Activities
  'golf_tennis': 'Golf & Tennis Related',
  'walking_cycling': 'Walking & Cycling Related',
  'water_sports': 'Water Sports Related',
  'water_crafts': 'Water Crafts Related',
  'winter_sports': 'Winter Sports Related',
  // Interests
  'gardening': 'Gardening & Pets Related',
  'arts': 'Arts & Crafts Related',
  'music_theater': 'Music & Theater Related',
  'cooking_wine': 'Cooking & Wine Related',
  'history': 'Museums & History Related'
};

// Cache for group members to avoid repeated queries
let groupMembersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch all hobbies for a specific group from the database
 */
async function fetchGroupMembers(groupName) {
  const { data, error } = await supabase
    .from('hobbies')
    .select('name')
    .eq('group_name', groupName)
    .order('name');
  
  if (error) {
    console.error(`Error fetching group ${groupName}:`, error);
    return [];
  }
  
  console.log(`Group ${groupName} has ${data.length} hobbies`);
  
  // Convert hobby names to normalized format (lowercase, underscores)
  return data.map(h => h.name.toLowerCase().replace(/\s+/g, '_'));
}

/**
 * Get compound button mappings from database groups
 * Returns an object mapping button IDs to arrays of hobby IDs
 */
export async function getCompoundMappings() {
  // Check cache
  if (groupMembersCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return groupMembersCache;
  }
  
  try {
    const mappings = {};
    
    // Fetch all groups in parallel
    const promises = Object.entries(BUTTON_TO_GROUP_MAPPING).map(async ([buttonId, groupName]) => {
      const members = await fetchGroupMembers(groupName);
      return { buttonId, members };
    });
    
    const results = await Promise.all(promises);
    
    // Build the mappings object
    results.forEach(({ buttonId, members }) => {
      mappings[buttonId] = members;
    });
    
    // Cache the results
    groupMembersCache = mappings;
    cacheTimestamp = Date.now();
    
    console.log('Loaded compound mappings from database:', mappings);
    
    return mappings;
  } catch (error) {
    console.error('Failed to load mappings from database, using hardcoded fallback:', error);
    // Return hardcoded mappings as fallback
    return getHardcodedMappings();
  }
}

/**
 * Create reverse mapping from individual hobbies to compound buttons
 */
export async function getReverseMapping() {
  const compoundMappings = await getCompoundMappings();
  const reverseMapping = {};
  
  Object.entries(compoundMappings).forEach(([compound, items]) => {
    items.forEach(item => {
      if (!reverseMapping[item]) reverseMapping[item] = [];
      reverseMapping[item].push(compound);
    });
  });
  
  return reverseMapping;
}

/**
 * Check if a hobby belongs to a compound button group
 */
export async function isHobbyInGroup(hobbyId, buttonId) {
  const mappings = await getCompoundMappings();
  return mappings[buttonId]?.includes(hobbyId) || false;
}

/**
 * Get all hobbies for selected compound buttons
 */
export async function getHobbiesForButtons(buttonIds) {
  if (!buttonIds || buttonIds.length === 0) {
    return [];
  }
  
  try {
    const mappings = await getCompoundMappings();
    const allHobbies = new Set();
    
    buttonIds.forEach(buttonId => {
      const hobbies = mappings[buttonId] || [];
      hobbies.forEach(h => allHobbies.add(h));
    });
    
    return Array.from(allHobbies);
  } catch (error) {
    console.error('Error getting hobbies for buttons:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Reconstruct compound buttons from individual hobby selections
 */
export async function reconstructCompoundButtons(hobbyIds) {
  const reverseMapping = await getReverseMapping();
  const compoundButtons = new Set();
  
  hobbyIds.forEach(hobbyId => {
    const buttons = reverseMapping[hobbyId] || [];
    buttons.forEach(b => compoundButtons.add(b));
  });
  
  return Array.from(compoundButtons);
}

// For backward compatibility, export a function that returns hard-coded mappings
// This can be used as a fallback if database query fails
export function getHardcodedMappings() {
  return {
    // Activities
    'golf_tennis': ['golf', 'tennis', 'pickleball', 'bocce_ball', 'petanque', 'shuffleboard', 'ping_pong'],
    'walking_cycling': ['walking', 'cycling', 'hiking', 'jogging', 'mountain_biking', 'nordic_walking', 'geocaching', 'orienteering', 'walking_groups'],
    'water_sports': ['swimming', 'snorkeling', 'water_skiing', 'swimming_laps', 'water_aerobics'],
    'water_crafts': ['boating', 'canoeing', 'kayaking', 'paddleboarding', 'sailing', 'rowing', 'jet_skiing', 'fishing', 'deep_sea_fishing'],
    'winter_sports': ['skiing', 'cross_country_skiing', 'downhill_skiing', 'snowboarding', 'ice_skating', 'sledding', 'snowshoeing', 'snowmobiling', 'curling', 'ice_fishing'],
    // Interests
    'gardening': ['gardening', 'herb_gardening', 'vegetable_gardening', 'flower_arranging', 'birdwatching', 'beekeeping', 'dog_walking', 'dog_training', 'nature_walks', 'aquarium_keeping'],
    'arts': ['arts', 'crafts', 'painting', 'drawing', 'pottery', 'sculpture', 'woodworking', 'jewelry_making', 'photography', 'calligraphy', 'embroidery', 'knitting', 'crochet', 'quilting', 'sewing', 'scrapbooking', 'sketching', 'watercolor'],
    'music_theater': ['music', 'theater', 'dancing', 'ballroom_dancing', 'choir_singing', 'community_theater', 'film_appreciation', 'folk_dancing', 'instrument_playing', 'jazz_appreciation', 'karaoke', 'latin_dancing', 'line_dancing', 'musical_instrument', 'opera', 'salsa_dancing', 'tango_dancing'],
    'cooking_wine': ['cooking', 'wine', 'baking', 'cheese_making', 'coffee_culture', 'cooking_classes', 'culinary_arts', 'fine_dining', 'food_tours', 'local_cuisine', 'wine_tasting', 'wine_tours'],
    'history': ['museums', 'history', 'historical_sites', 'genealogy', 'antique_collecting']
  };
}