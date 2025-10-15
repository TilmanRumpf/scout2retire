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
  'walking', 'reading', 'cooking', 'gardening', 'photography',
  'yoga', 'meditation', 'bird watching', 'writing', 'painting',
  'music', 'chess', 'board games', 'knitting', 'hiking'
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
  
  // 2. Check distinctive hobbies from top_hobbies (case-insensitive + underscore/space)
  if (town.top_hobbies && town.top_hobbies.length > 0) {
    userHobbies.forEach(hobby => {
      // Normalize: lowercase and replace underscores with spaces
      const normalizedUserHobby = hobby.toLowerCase().replace(/_/g, ' ');
      
      // Check case-insensitive match with underscore/space normalization
      const matchFound = town.top_hobbies.some(townHobby => 
        townHobby.toLowerCase().replace(/_/g, ' ') === normalizedUserHobby
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
    
    // Normalize hobby name for comparison (handle underscores)
    const normalizedHobby = hobby.toLowerCase().replace(/_/g, ' ');
    if (waterSports.some(sport => sport.toLowerCase().replace(/_/g, ' ') === normalizedHobby)) {
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
  
  // SMART SCORING: True native matches score HIGH (85-95%)
  // But must be ACTUAL native matches, not loose associations
  
  // Define STRICT native match patterns
  const nativeMatches = [
    // Water Sports/Crafts + TRULY COASTAL (not just any river!)
    {
      userPattern: h => h.includes('swim') || h.includes('surf') || h.includes('sail') || 
                       h.includes('kayak') || h.includes('boat') || h.includes('diving') ||
                       h.includes('water') || h.includes('paddle') || h.includes('fish'),
      townPattern: t => {
        // Must be COASTAL or have MAJOR water bodies, not just a river
        // Handle both string and array formats
        const geoFeatures = Array.isArray(t.geographic_features_actual) 
          ? t.geographic_features_actual.join(' ').toLowerCase()
          : (typeof t.geographic_features_actual === 'string' ? t.geographic_features_actual.toLowerCase() : '');
        
        const isCoastal = geoFeatures.includes('coastal');
        const hasLake = geoFeatures.includes('lake');
        // Must have actual water activities in top_hobbies to qualify
        const hasWaterHobbies = t.top_hobbies?.some(h => 
          h.toLowerCase().includes('swim') || h.toLowerCase().includes('surf') ||
          h.toLowerCase().includes('sail') || h.toLowerCase().includes('diving') ||
          h.toLowerCase().includes('kayak') || h.toLowerCase().includes('boat')
        );
        
        // STRICT: Must be coastal/lake AND have water hobbies listed
        return (isCoastal || hasLake) && hasWaterHobbies;
      }
    },
    // Winter Sports + ACTUAL SKI RESORTS
    {
      userPattern: h => h.includes('ski') || h.includes('snow') || h.includes('ice') || 
                       h.includes('winter'),
      townPattern: t => {
        // Must have actual ski/winter facilities mentioned
        const hasWinterHobbies = t.top_hobbies?.some(h => 
          h.toLowerCase().includes('ski') || h.toLowerCase().includes('snow') ||
          h.toLowerCase().includes('ice skat') || h.toLowerCase().includes('winter')
        );
        const geoFeatures = Array.isArray(t.geographic_features_actual) 
          ? t.geographic_features_actual.join(' ').toLowerCase()
          : (typeof t.geographic_features_actual === 'string' ? t.geographic_features_actual.toLowerCase() : '');
        
        const isMountainous = geoFeatures.includes('mountain') || geoFeatures.includes('alpine');
        
        // STRICT: Must have winter activities listed, mountains alone aren't enough
        return hasWinterHobbies && isMountainous;
      }
    },
    // Golf & Tennis + ACTUAL GOLF COURSES/TENNIS COURTS
    {
      userPattern: h => h.includes('golf') || h.includes('tennis') || h.includes('pickleball'),
      townPattern: t => {
        // Must explicitly mention golf/tennis, not just "high outdoor rating"
        return t.top_hobbies?.some(h => 
          h.toLowerCase().includes('golf') || 
          h.toLowerCase().includes('tennis') ||
          h.toLowerCase().includes('pickleball')
        );
      }
    },
    // Hiking & Nature + ACTUAL TRAILS (not just walking which is everywhere)
    {
      userPattern: h => h.includes('hik') || h.includes('mountain') || h.includes('trail') ||
                       h.includes('trekking') || h.includes('climb'),
      townPattern: t => {
        const hasHikingHobbies = t.top_hobbies?.some(h => 
          h.toLowerCase().includes('hik') || h.toLowerCase().includes('trail') ||
          h.toLowerCase().includes('trek') || h.toLowerCase().includes('climb')
        );
        const geoFeatures = Array.isArray(t.geographic_features_actual) 
          ? t.geographic_features_actual.join(' ').toLowerCase()
          : (typeof t.geographic_features_actual === 'string' ? t.geographic_features_actual.toLowerCase() : '');
        
        const hasMountains = geoFeatures.includes('mountain') || geoFeatures.includes('hill');
        
        return hasHikingHobbies || (hasMountains && t.outdoor_rating >= 8);
      }
    },
    // Arts & Crafts + ACTUAL ART FACILITIES
    {
      userPattern: h => h.includes('art') || h.includes('craft') || h.includes('paint') || 
                       h.includes('pottery') || h.includes('sculpt'),
      townPattern: t => {
        // Must have actual art activities mentioned, not just "cultural"
        return t.top_hobbies?.some(h => 
          h.toLowerCase().includes('art') || h.toLowerCase().includes('craft') ||
          h.toLowerCase().includes('paint') || h.toLowerCase().includes('pottery') ||
          h.toLowerCase().includes('museum') || h.toLowerCase().includes('gallery')
        );
      }
    },
    // Music & Theater + ACTUAL VENUES
    {
      userPattern: h => h.includes('music') || h.includes('theater') || h.includes('dance') || 
                       h.includes('choir') || h.includes('opera'),
      townPattern: t => {
        // Must have actual music/theater activities listed
        return t.top_hobbies?.some(h => 
          h.toLowerCase().includes('music') || h.toLowerCase().includes('theater') ||
          h.toLowerCase().includes('concert') || h.toLowerCase().includes('opera') ||
          h.toLowerCase().includes('dance') || h.toLowerCase().includes('perform')
        );
      }
    }
  ];
  
  // Check for any native match
  for (const pattern of nativeMatches) {
    const hasUserActivities = userHobbies.some(pattern.userPattern);
    const townSupports = pattern.townPattern(town);
    
    if (hasUserActivities && townSupports) {
      // Count specific matches for this pattern
      const specificMatches = inference.details.distinctive.filter(pattern.userPattern).length;
      
      // Native match = 85% base + up to 15% bonus for specific matches
      const baseScore = 85;
      const bonusPerMatch = Math.min(15, specificMatches * 2);
      
      return {
        score: Math.min(100, baseScore + bonusPerMatch),
        available: inference.availableHobbies.length,
        requested: userHobbies.length,
        matchPercentage: inference.matchPercentage,
        details: inference.details,
        nativeMatch: true
      };
    }
  }
  
  // For non-native matches, use percentage of AVAILABLE activities that match
  // Not percentage of user's total hobbies (which is nonsensical)
  const matchedCount = inference.details.distinctive.length + 
                       (inference.details.inferred.length * 0.8) +
                       (inference.details.universal.length * 0.5);
  
  // If town has hobbies, score based on how many match
  if (town.top_hobbies && town.top_hobbies.length > 0) {
    const normalizedScore = Math.round((matchedCount / town.top_hobbies.length) * 100);
    return {
      score: Math.min(100, normalizedScore),
      available: inference.availableHobbies.length,
      requested: userHobbies.length,
      matchPercentage: inference.matchPercentage,
      details: inference.details
    };
  }
  
  // Fallback: score based on matched vs requested (but cap at 70% for non-native)
  const fallbackScore = Math.round((matchedCount / Math.max(10, userHobbies.length)) * 100);
  const normalizedScore = Math.min(70, fallbackScore);
  
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