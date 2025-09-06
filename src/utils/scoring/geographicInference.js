/**
 * Geographic Inference System for Hobby Availability
 * 
 * Instead of storing 865,000 town_hobby relationships,
 * we infer hobby availability from town characteristics.
 */

/**
 * Universal hobbies available everywhere
 * These don't need to be in top_hobbies
 */
const UNIVERSAL_HOBBIES = [
  'Walking', 'Reading', 'Cooking', 'Gardening', 'Photography',
  'Yoga', 'Meditation', 'Bird Watching', 'Writing', 'Painting',
  'Music', 'Chess', 'Board Games', 'Knitting', 'Hiking'
];

/**
 * Infer which hobbies are available in a town based on its characteristics
 * @param {Object} town - Town data with all characteristics
 * @param {Array} userHobbies - User's selected hobbies to check
 * @returns {Object} Inference results with available hobbies and confidence
 */
export function inferHobbyAvailability(town, userHobbies) {
  // Safety checks
  if (!town || typeof town !== 'object') {
    console.error('inferHobbyAvailability: Invalid town object', town);
    return {
      availableHobbies: [],
      matchPercentage: 0,
      details: { universal: [], distinctive: [], inferred: [], notAvailable: userHobbies || [] }
    };
  }
  
  if (!Array.isArray(userHobbies)) {
    console.error('inferHobbyAvailability: userHobbies must be an array', userHobbies);
    return {
      availableHobbies: [],
      matchPercentage: 0,
      details: { universal: [], distinctive: [], inferred: [], notAvailable: [] }
    };
  }
  
  const availableHobbies = new Set();
  const inferenceDetails = {
    universal: [],
    distinctive: [],
    inferred: [],
    notAvailable: [],
    confidence: 0
  };
  
  // 1. Add all universal hobbies that user wants
  userHobbies.forEach(hobby => {
    if (UNIVERSAL_HOBBIES.includes(hobby)) {
      availableHobbies.add(hobby);
      inferenceDetails.universal.push(hobby);
    }
  });
  
  // 2. Check distinctive hobbies from top_hobbies (case-insensitive)
  if (town.top_hobbies && town.top_hobbies.length > 0) {
    userHobbies.forEach(hobby => {
      // Check case-insensitive match
      const matchFound = town.top_hobbies.some(townHobby => 
        townHobby.toLowerCase() === hobby.toLowerCase()
      );
      if (matchFound) {
        availableHobbies.add(hobby);
        inferenceDetails.distinctive.push(hobby);
      }
    });
  }
  
  // 3. Geographic inference based on features
  const inferred = inferFromGeography(town, userHobbies);
  inferred.forEach(hobby => {
    if (!availableHobbies.has(hobby)) {
      availableHobbies.add(hobby);
      inferenceDetails.inferred.push(hobby);
    }
  });
  
  // 4. Identify hobbies not available
  userHobbies.forEach(hobby => {
    if (!availableHobbies.has(hobby)) {
      inferenceDetails.notAvailable.push(hobby);
    }
  });
  
  // Calculate confidence score (0-100)
  const totalRequested = userHobbies.length;
  const totalAvailable = availableHobbies.size;
  inferenceDetails.confidence = Math.round((totalAvailable / totalRequested) * 100);
  
  return {
    availableHobbies: Array.from(availableHobbies),
    matchPercentage: inferenceDetails.confidence,
    details: inferenceDetails
  };
}

/**
 * Infer hobbies from geographic features
 */
function inferFromGeography(town, userHobbies) {
  const inferred = [];
  
  userHobbies.forEach(hobby => {
    // WATER SPORTS - Coastal or lake towns (case-insensitive check)
    const waterSports = ['Swimming', 'Sailing', 'Surfing', 'Scuba Diving', 'Kayaking', 
         'Fishing', 'Boating', 'Windsurfing', 'Kitesurfing', 'Snorkeling',
         'Water Skiing', 'Swimming Laps', 'Water Aerobics', 'Stand-up Paddleboarding',
         'Canoeing', 'Jet Skiing', 'Deep Sea Fishing'];
    
    if (waterSports.some(sport => sport.toLowerCase() === hobby.toLowerCase())) {
      // Check geographic features with case-insensitive comparison
      const hasCoastal = town.geographic_features_actual?.some(f => 
        f && f.toString().toLowerCase() === 'coastal'
      );
      
      if (town.distance_to_ocean_km === 0 || hasCoastal ||
          (town.distance_to_water_km === 0 && town.distance_to_ocean_km <= 50)) {
        inferred.push(hobby);
      }
    }
    
    // WINTER SPORTS - Mountain towns with elevation
    const winterSports = ['Downhill Skiing', 'Snowboarding', 'Cross-country Skiing', 'Snowshoeing',
         'Ice Skating', 'Skiing'];
    if (winterSports.some(sport => sport.toLowerCase() === hobby.toLowerCase())) {
      // Check geographic features with case-insensitive comparison
      const hasMountain = town.geographic_features_actual?.some(f => 
        f && f.toString().toLowerCase() === 'mountain'
      );
      
      if (town.elevation_meters > 800 || 
          town.ski_resorts_count > 0 || hasMountain) {
        inferred.push(hobby);
      }
    }
    
    // GOLF - Infrastructure dependent
    if (hobby.toLowerCase() === 'golf' && town.golf_courses_count > 0) {
      inferred.push(hobby);
    }
    
    // TENNIS/RACQUET SPORTS - Infrastructure dependent
    const racquetSports = ['Tennis', 'Padel', 'Pickleball', 'Bocce Ball', 'Petanque'];
    if (racquetSports.some(sport => sport.toLowerCase() === hobby.toLowerCase()) && 
        town.tennis_courts_count > 0) {
      inferred.push(hobby);
    }
    
    // CULTURAL ACTIVITIES - Urban areas
    const culturalActivities = ['Museums', 'Theater', 'Opera', 'Art Galleries', 'Concerts',
         'Food Tours', 'Ballet'];
    if (culturalActivities.some(activity => activity.toLowerCase() === hobby.toLowerCase())) {
      if (town.population >= 100000 || town.distance_to_urban_center === 0) {
        inferred.push(hobby);
      }
      // Smaller towns near urban centers get partial access
      else if (town.distance_to_urban_center <= 40 && town.population >= 20000) {
        const partialCultural = ['Museums', 'Theater', 'Concerts'];
        if (partialCultural.some(activity => activity.toLowerCase() === hobby.toLowerCase())) {
          inferred.push(hobby);
        }
      }
    }
    
    // MARKETS - Most towns have some form
    const markets = ['Farmers Markets', 'Flea Markets'];
    if (markets.some(market => market.toLowerCase() === hobby.toLowerCase())) {
      if (town.population >= 10000) {
        inferred.push(hobby);
      }
    }
    
    // WINE/VINEYARD activities - Wine regions
    const wineActivities = ['Wine Tasting', 'Vineyards', 'Wine'];
    if (wineActivities.some(activity => activity.toLowerCase() === hobby.toLowerCase())) {
      // Mediterranean countries are wine regions
      if (['Spain', 'France', 'Italy', 'Portugal', 'Greece'].includes(town.country)) {
        inferred.push(hobby);
      }
      // Other known wine regions
      else if (['Australia', 'Argentina', 'Chile', 'South Africa'].includes(town.country) &&
          town.geographic_features_actual?.some(f => f && f.toString().toLowerCase() === 'valley')) {
        inferred.push(hobby);
      }
    }
    
    // FITNESS/WELLNESS - Urban and tourist areas
    const fitnessActivities = ['Fitness Classes', 'Pilates', 'Spa & Wellness', 'Gym'];
    if (fitnessActivities.some(activity => activity.toLowerCase() === hobby.toLowerCase())) {
      if (town.population >= 50000 || 
          town.distance_to_urban_center <= 20 ||
          town.distance_to_ocean_km === 0) {
        inferred.push(hobby);
      }
    }
    
    // OUTDOOR ACTIVITIES - Walking, Hiking, Cycling
    const outdoorActivities = ['Walking', 'Hiking', 'Cycling', 'Mountain Biking'];
    if (outdoorActivities.some(activity => activity.toLowerCase() === hobby.toLowerCase())) {
      // Walking is universal but we still add it
      if (hobby.toLowerCase() === 'walking') {
        inferred.push(hobby);
      }
      // Hiking in elevated or natural areas
      else if (hobby.toLowerCase() === 'hiking' && 
          (town.elevation_meters > 200 || 
           town.geographic_features_actual?.some(f => f && f.toString().toLowerCase() === 'mountain') ||
           town.hiking_trails_km > 0)) {
        inferred.push(hobby);
      }
      // Mountain biking in elevated areas
      else if (hobby.toLowerCase() === 'mountain biking' && 
          (town.elevation_meters > 500 || 
           town.geographic_features_actual?.some(f => f && f.toString().toLowerCase() === 'mountain'))) {
        inferred.push(hobby);
      }
      // Regular cycling in most developed areas
      else if (hobby.toLowerCase() === 'cycling' && town.population >= 20000) {
        inferred.push(hobby);
      }
    }
  });
  
  return inferred;
}

/**
 * Calculate hobby match score for a town
 * This replaces the old town_hobbies table lookup
 */
export function calculateHobbyScore(town, userHobbies) {
  if (!userHobbies || userHobbies.length === 0) {
    return {
      score: 0,
      available: 0,
      requested: 0,
      details: null
    };
  }
  
  const inference = inferHobbyAvailability(town, userHobbies);
  
  // Score calculation (0-100)
  // - Full points for distinctive hobbies (in top_hobbies)
  // - Partial points for inferred hobbies
  // - Minimal points for universal hobbies
  
  let score = 0;
  const weights = {
    distinctive: 1.0,  // Perfect match - town is known for this
    inferred: 0.8,     // Good match - infrastructure supports it
    universal: 0.5     // Basic match - available everywhere
  };
  
  inference.details.distinctive.forEach(() => score += weights.distinctive);
  inference.details.inferred.forEach(() => score += weights.inferred);
  inference.details.universal.forEach(() => score += weights.universal);
  
  // Normalize to 0-100
  const maxPossibleScore = userHobbies.length;
  const normalizedScore = Math.round((score / maxPossibleScore) * 100);
  
  return {
    score: normalizedScore,
    available: inference.availableHobbies.length,
    requested: userHobbies.length,
    matchPercentage: inference.matchPercentage,
    details: inference.details
  };
}

/**
 * Urban spillover effect
 * Towns near urban centers inherit some urban amenities
 */
export function getUrbanSpilloverMultiplier(distanceToUrban) {
  if (distanceToUrban === 0) return 1.0;      // Is urban center
  if (distanceToUrban <= 20) return 0.9;      // Very close
  if (distanceToUrban <= 40) return 0.7;      // Commutable
  if (distanceToUrban <= 60) return 0.5;      // Day trip distance
  if (distanceToUrban <= 100) return 0.3;     // Weekend trip
  return 0.1;                                  // Limited access
}

/**
 * Check if a specific hobby is likely available
 */
export function isHobbyLikelyAvailable(town, hobbyName) {
  const inference = inferHobbyAvailability(town, [hobbyName]);
  return inference.availableHobbies.includes(hobbyName);
}