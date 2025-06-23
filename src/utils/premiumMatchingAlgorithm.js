// Premium Matching Algorithm for Scout2Retire
// Enhanced algorithm with adaptive weights, fuzzy matching, and deeper insights

import { 
  getCategoryWeights, 
  getBudgetScoringRanges,
  getAdministrationWeights,
  getHobbiesScoringBonuses,
  getRegionScoringValues 
} from './scoringConfigLoader';

/**
 * Enhanced matching algorithm with premium features
 */
export const calculatePremiumMatch = (town, userPreferences) => {
  // Get adaptive weights from configuration
  const weights = getCategoryWeights(userPreferences);
  
  // Calculate enhanced scores for the 6 accepted categories only
  const categoryScores = {
    region: calculateRegionScore(town, userPreferences),
    climate: calculatePremiumClimateScore(town, userPreferences),
    culture: calculatePremiumCultureScore(town, userPreferences),
    hobbies: calculateHobbiesScore(town, userPreferences),
    administration: calculateEnhancedAdministrationScore(town, userPreferences),
    budget: calculatePremiumBudgetScore(town, userPreferences)
  };
  
  // Calculate weighted total
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    const weight = weights[category] || 0;
    if (weight > 0 && score !== null) {
      totalScore += score * weight;
      totalWeight += weight;
    }
  });
  
  // Normalize score
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  // Apply quality bonus for premium destinations
  const qualityBonus = calculateQualityBonus(town, categoryScores);
  const finalScore = Math.min(100, normalizedScore + qualityBonus);
  
  // Generate comprehensive insights
  const insights = generatePremiumInsights(town, userPreferences, categoryScores);
  const warnings = identifyDetailedWarnings(town, userPreferences);
  const highlights = identifyHighlights(town, categoryScores);
  const matchReasons = generateMatchReasons(categoryScores, userPreferences, town);
  
  return {
    score: Math.round(finalScore),
    breakdown: categoryScores,
    matchReasons,
    insights,
    warnings,
    highlights,
    confidence: calculateConfidenceLevel(town),
    value_rating: calculateValueRating(town, categoryScores)
  };
};

/**
 * Calculate adaptive weights based on user's priorities
 */
const calculateAdaptiveWeights = (preferences) => {
  // Base weights for the 6 accepted categories
  const baseWeights = {
    region: 0.10,
    climate: 0.15,
    culture: 0.15,
    hobbies: 0.15,
    administration: 0.20,  // Includes healthcare, safety, visa, tax
    budget: 0.25
  };
  
  const weights = { ...baseWeights };
  
  // Healthcare priority adjustment (now part of administration)
  if (preferences.administration?.health_considerations?.healthcare_access) {
    const access = preferences.administration.health_considerations.healthcare_access;
    if (access === 'full_access' || access === 'hospital_specialists') {
      weights.administration = 0.30;
      weights.hobbies -= 0.05;
      weights.culture -= 0.05;
    }
  }
  
  // Budget conscious adjustment
  if (preferences.costs?.property_tax_sensitive || 
      preferences.costs?.income_tax_sensitive || 
      preferences.costs?.sales_tax_sensitive) {
    weights.budget = 0.30;
    weights.administration = 0.25;
    weights.hobbies -= 0.05;
  }
  
  // Active lifestyle adjustment
  if (preferences.hobbies?.activities?.length > 5 || 
      preferences.hobbies?.interests?.length > 5) {
    weights.hobbies = 0.20;
    weights.culture = 0.20;
    weights.administration -= 0.05;
    weights.region -= 0.05;
  }
  
  // Climate sensitive adjustment
  if (preferences.climate_preferences?.seasonal_preference && 
      preferences.climate_preferences.seasonal_preference !== 'Optional') {
    weights.climate = 0.20;
    weights.hobbies -= 0.05;
  }
  
  // Normalize weights to ensure they sum to 1.0
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / sum;
  });
  
  return weights;
};

/**
 * Premium budget scoring with fuzzy matching and tax considerations
 */
const calculatePremiumBudgetScore = (town, preferences) => {
  if (!preferences.costs?.total_monthly_budget || !town.cost_index) return 50;
  
  const budget = preferences.costs.total_monthly_budget;
  const cost = town.cost_index;
  const ratio = cost / budget;
  
  // Base score with fuzzy matching
  let score;
  if (ratio <= 0.5) score = 100;      // Exceptional value
  else if (ratio <= 0.7) score = 95;  // Great value
  else if (ratio <= 0.85) score = 90; // Good value
  else if (ratio <= 1.0) score = 85;  // Within budget
  else if (ratio <= 1.15) score = 70; // Slight stretch
  else if (ratio <= 1.3) score = 50;  // Significant stretch
  else if (ratio <= 1.5) score = 30;  // Difficult
  else score = 10;                    // Out of range
  
  // Tax sensitivity adjustments
  if (preferences.costs?.property_tax_sensitive && town.property_tax_rate) {
    if (town.property_tax_rate < 1) score += 5;
    else if (town.property_tax_rate > 2) score -= 5;
  }
  
  if (preferences.costs?.income_tax_sensitive && town.income_tax_rate) {
    if (town.income_tax_rate === 0) score += 10;
    else if (town.income_tax_rate < 10) score += 5;
    else if (town.income_tax_rate > 20) score -= 10;
  }
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Premium healthcare scoring with specific needs matching
 */
const calculatePremiumHealthcareScore = (town, preferences) => {
  let baseScore = (town.healthcare_score || 5) * 10;
  
  // Specific healthcare access requirements
  if (preferences.administration?.health_considerations?.healthcare_access) {
    const access = preferences.administration.health_considerations.healthcare_access;
    
    switch(access) {
      case 'full_access':
        if (town.healthcare_score >= 9) baseScore = 100;
        else if (town.healthcare_score >= 8) baseScore = 85;
        else if (town.healthcare_score >= 7) baseScore = 70;
        else baseScore = Math.min(50, baseScore);
        break;
        
      case 'hospital_specialists':
        if (town.healthcare_score >= 8) baseScore = 95;
        else if (town.healthcare_score >= 7) baseScore = 85;
        else if (town.healthcare_score >= 6) baseScore = 75;
        else baseScore = Math.min(60, baseScore);
        break;
        
      case 'hospital_general':
        if (town.healthcare_score >= 6) baseScore = 90;
        else if (town.healthcare_score >= 5) baseScore = 80;
        else baseScore = Math.min(70, baseScore);
        break;
        
      case 'general_practitioner':
        baseScore = Math.max(70, baseScore);
        break;
        
      case 'pharmacy_only':
        baseScore = Math.max(80, baseScore);
        break;
    }
  }
  
  // Ongoing treatment considerations
  if (preferences.administration?.health_considerations?.ongoing_treatment && 
      preferences.administration.health_considerations.ongoing_treatment !== 'none') {
    if (town.healthcare_score < 8) {
      baseScore = Math.min(70, baseScore);
    }
  }
  
  // English-speaking doctors bonus
  if (preferences.culture_preferences?.language_comfort?.preferences?.includes('english_only')) {
    if (town.english_speaking_doctors) {
      baseScore += 10;
    } else if (town.primary_language?.toLowerCase() !== 'english') {
      baseScore -= 10;
    }
  }
  
  return Math.min(100, Math.max(0, baseScore));
};

/**
 * Premium climate scoring with seasonal and health considerations
 */
const calculatePremiumClimateScore = (town, preferences) => {
  if (!preferences.climate_preferences) return 70;
  
  let totalScore = 0;
  let factors = 0;
  
  // Enhanced climate type mapping
  const climateTypes = {
    'tropical': { summer: 'hot', winter: 'warm', humidity: 'humid', sunshine: 'mostly_sunny' },
    'mediterranean': { summer: 'warm', winter: 'mild', humidity: 'balanced', sunshine: 'mostly_sunny' },
    'oceanic': { summer: 'mild', winter: 'cool', humidity: 'balanced', sunshine: 'balanced' },
    'continental': { summer: 'warm', winter: 'cold', humidity: 'balanced', sunshine: 'balanced' },
    'desert': { summer: 'hot', winter: 'mild', humidity: 'dry', sunshine: 'mostly_sunny' },
    'subtropical': { summer: 'hot', winter: 'mild', humidity: 'humid', sunshine: 'balanced' }
  };
  
  const townClimateType = town.climate?.toLowerCase() || '';
  let climateProfile = null;
  
  // Find matching climate profile
  for (const [type, profile] of Object.entries(climateTypes)) {
    if (townClimateType.includes(type)) {
      climateProfile = profile;
      break;
    }
  }
  
  if (climateProfile) {
    // Summer preferences
    if (preferences.climate_preferences.summer_climate_preference?.length > 0) {
      const summerMatch = preferences.climate_preferences.summer_climate_preference.includes(climateProfile.summer);
      totalScore += summerMatch ? 95 : 60;
      factors++;
    }
    
    // Winter preferences
    if (preferences.climate_preferences.winter_climate_preference?.length > 0) {
      const winterMatch = preferences.climate_preferences.winter_climate_preference.includes(climateProfile.winter);
      totalScore += winterMatch ? 95 : 60;
      factors++;
    }
    
    // Humidity preferences
    if (preferences.climate_preferences.humidity_level?.length > 0) {
      const humidityMatch = preferences.climate_preferences.humidity_level.includes(climateProfile.humidity);
      totalScore += humidityMatch ? 90 : 50;
      factors++;
    }
    
    // Sunshine preferences
    if (preferences.climate_preferences.sunshine?.length > 0) {
      const sunshineMatch = preferences.climate_preferences.sunshine.includes(climateProfile.sunshine);
      totalScore += sunshineMatch ? 90 : 60;
      factors++;
    }
  }
  
  // Environmental health considerations
  if (preferences.administration?.health_considerations?.environmental_health) {
    const envHealth = preferences.administration.health_considerations.environmental_health;
    
    if (envHealth === 'very_sensitive') {
      // Penalize high humidity for very sensitive
      if (climateProfile?.humidity === 'humid') {
        totalScore -= 20 * factors;
      }
    } else if (envHealth === 'air_quality') {
      // Bonus for dry climates
      if (climateProfile?.humidity === 'dry') {
        totalScore += 10 * factors;
      }
    }
  }
  
  return factors > 0 ? Math.min(100, Math.max(0, totalScore / factors)) : 70;
};

/**
 * Premium culture scoring with lifestyle compatibility
 */
const calculatePremiumCultureScore = (town, preferences) => {
  if (!preferences.culture_preferences) return 70;
  
  let totalScore = 0;
  let factors = 0;
  
  // Language compatibility
  if (preferences.culture_preferences.language_comfort?.preferences?.length > 0) {
    let langScore = 70;
    const langPrefs = preferences.culture_preferences.language_comfort.preferences;
    
    if (langPrefs.includes('english_only')) {
      if (town.primary_language?.toLowerCase().includes('english')) {
        langScore = 100;
      } else if (town.english_proficiency_score >= 80) {
        langScore = 90;
      } else if (town.english_proficiency_score >= 60) {
        langScore = 70;
      } else {
        langScore = 40;
      }
    } else if (langPrefs.includes('willing_to_learn')) {
      langScore = 85;
      if (town.english_proficiency_score >= 50) langScore += 10;
    } else if (langPrefs.includes('comfortable')) {
      langScore = 95;
    }
    
    totalScore += langScore;
    factors++;
  }
  
  // Expat community
  if (preferences.culture_preferences.expat_community_preference?.length > 0) {
    let expatScore = 70;
    const expatPrefs = preferences.culture_preferences.expat_community_preference;
    const townExpat = town.expat_population?.toLowerCase() || '';
    
    expatPrefs.forEach(pref => {
      if (pref === 'large' && townExpat.includes('large')) expatScore = Math.max(expatScore, 95);
      else if (pref === 'moderate' && townExpat.includes('moderate')) expatScore = Math.max(expatScore, 90);
      else if (pref === 'small' && townExpat.includes('small')) expatScore = Math.max(expatScore, 85);
    });
    
    totalScore += expatScore;
    factors++;
  }
  
  // Pace of life
  if (preferences.culture_preferences.lifestyle_preferences?.pace_of_life?.length > 0) {
    let paceScore = 70;
    const pacePrefs = preferences.culture_preferences.lifestyle_preferences.pace_of_life;
    const description = (town.description || '').toLowerCase();
    
    pacePrefs.forEach(pref => {
      if (pref === 'slow' && (description.includes('relaxed') || description.includes('quiet'))) {
        paceScore = Math.max(paceScore, 95);
      } else if (pref === 'moderate' && !description.includes('hectic') && !description.includes('busy')) {
        paceScore = Math.max(paceScore, 85);
      } else if (pref === 'fast' && (description.includes('vibrant') || description.includes('bustling'))) {
        paceScore = Math.max(paceScore, 90);
      }
    });
    
    totalScore += paceScore;
    factors++;
  }
  
  // Urban/Rural
  if (preferences.culture_preferences.lifestyle_preferences?.urban_rural?.length > 0) {
    let urbanScore = 70;
    const urbanPrefs = preferences.culture_preferences.lifestyle_preferences.urban_rural;
    const population = town.population || 0;
    
    urbanPrefs.forEach(pref => {
      if (pref === 'urban' && population > 500000) urbanScore = Math.max(urbanScore, 95);
      else if (pref === 'suburban' && population > 50000 && population < 500000) {
        urbanScore = Math.max(urbanScore, 90);
      } else if (pref === 'rural' && population < 50000) urbanScore = Math.max(urbanScore, 95);
    });
    
    totalScore += urbanScore;
    factors++;
  }
  
  // Social preference
  if (preferences.culture_preferences.lifestyle_preferences?.social_preference) {
    let socialScore = 70;
    const socialPref = preferences.culture_preferences.lifestyle_preferences.social_preference;
    const hasExpats = town.expat_population && !town.expat_population.toLowerCase().includes('small');
    
    if (socialPref === 'social' && hasExpats) socialScore = 90;
    else if (socialPref === 'balanced') socialScore = 85;
    else if (socialPref === 'private' && town.population < 100000) socialScore = 90;
    
    totalScore += socialScore;
    factors++;
  }
  
  return factors > 0 ? totalScore / factors : 70;
};

/**
 * Hobbies scoring based on activities and interests
 */
const calculateHobbiesScore = (town, preferences) => {
  if (!preferences.hobbies) return 70;
  
  let totalScore = 0;
  let factors = 0;
  
  // Activity matching
  if (preferences.hobbies.activities?.length > 0) {
    let activityScore = 50; // Base score
    const activities = preferences.hobbies.activities;
    const description = (town.description || '').toLowerCase();
    const features = (town.geographic_features || '').toLowerCase();
    
    // Water activities
    if (activities.includes('swimming') || activities.includes('water_sports')) {
      if (features.includes('beach') || features.includes('coast')) activityScore += 20;
    }
    
    // Mountain activities
    if (activities.includes('hiking') || activities.includes('winter_sports')) {
      if (features.includes('mountain')) activityScore += 20;
    }
    
    // Golf
    if (activities.includes('golf')) {
      if (description.includes('golf')) activityScore += 15;
    }
    
    // Cycling
    if (activities.includes('cycling')) {
      if (description.includes('cycling') || description.includes('bike')) activityScore += 15;
    }
    
    // Fishing
    if (activities.includes('fishing')) {
      if (features.includes('coast') || description.includes('fishing')) activityScore += 15;
    }
    
    totalScore += Math.min(100, activityScore);
    factors++;
  }
  
  // Interest matching
  if (preferences.hobbies.interests?.length > 0) {
    let interestScore = 50;
    const interests = preferences.hobbies.interests;
    const description = (town.description || '').toLowerCase();
    
    // History & Arts
    if (interests.includes('history') || interests.includes('arts')) {
      if (description.includes('historic') || description.includes('heritage') || 
          description.includes('museum') || description.includes('cultural')) {
        interestScore += 20;
      }
    }
    
    // Nature
    if (interests.includes('nature')) {
      if (description.includes('nature') || description.includes('park') || 
          description.includes('wildlife')) {
        interestScore += 20;
      }
    }
    
    // Wine & Food
    if (interests.includes('wine') || interests.includes('cooking')) {
      if (description.includes('wine') || description.includes('culinary') || 
          description.includes('cuisine')) {
        interestScore += 15;
      }
    }
    
    totalScore += Math.min(100, interestScore);
    factors++;
  }
  
  return factors > 0 ? totalScore / factors : 70;
};

/**
 * Infrastructure quality scoring
 */
const calculateInfrastructureScore = (town) => {
  let score = 70; // Base score
  
  // Internet quality (critical for modern retirees)
  if (town.internet_speed_mbps) {
    if (town.internet_speed_mbps >= 100) score += 20;
    else if (town.internet_speed_mbps >= 50) score += 15;
    else if (town.internet_speed_mbps >= 25) score += 10;
    else score -= 10;
  }
  
  // Transportation
  if (town.public_transport_score) {
    if (town.public_transport_score >= 8) score += 10;
    else if (town.public_transport_score >= 6) score += 5;
  }
  
  // General infrastructure from description
  const description = (town.description || '').toLowerCase();
  if (description.includes('modern') || description.includes('excellent infrastructure')) {
    score += 5;
  }
  
  return Math.min(100, score);
};

/**
 * Connectivity scoring for travel and access
 */
const calculateConnectivityScore = (town, preferences) => {
  let score = 70;
  
  // Travel frequency consideration
  if (preferences.hobbies?.travel_frequency) {
    const frequency = preferences.hobbies.travel_frequency;
    
    if (frequency === 'frequent') {
      // Need good airport access
      if (town.transport_links?.toLowerCase().includes('international airport')) {
        score += 20;
      } else if (town.transport_links?.toLowerCase().includes('airport')) {
        score += 10;
      }
    } else if (frequency === 'occasional') {
      // Some connectivity needed
      if (town.transport_links?.toLowerCase().includes('airport')) {
        score += 10;
      }
    }
  }
  
  // Mobility preferences
  if (preferences.costs?.mobility) {
    const mobility = preferences.costs.mobility;
    
    if (mobility.international === 'major_airport') {
      if (town.transport_links?.toLowerCase().includes('international')) score += 10;
    }
    
    if (mobility.local === 'public_transit') {
      if (town.public_transport_score >= 7) score += 10;
    }
  }
  
  return Math.min(100, score);
};

/**
 * Basic scoring functions (keeping compatibility)
 */
const calculateSafetyScore = (town, preferences) => {
  const baseScore = (town.safety_score || 5) * 10;
  
  if (preferences.administration?.safety_importance?.includes('good')) {
    return town.safety_score >= 7 ? baseScore + 10 : baseScore - 10;
  }
  
  return baseScore;
};

const calculateRegionScore = (town, preferences) => {
  if (!preferences.region_preferences) return 70;
  
  let score = 0;
  let factors = 0;
  
  // 1. Direct country match (highest priority)
  if (preferences.region_preferences.countries?.length > 0) {
    const userCountries = preferences.region_preferences.countries.map(c => c.toLowerCase());
    const townCountry = town.country.toLowerCase();
    
    if (userCountries.includes(townCountry)) {
      score += 100;
      factors++;
    } else {
      // Check if neighboring country
      const neighbors = {
        'portugal': ['spain'],
        'spain': ['portugal', 'france'],
        'france': ['spain', 'italy', 'belgium', 'germany', 'switzerland'],
        'italy': ['france', 'switzerland', 'austria', 'slovenia'],
        'germany': ['france', 'netherlands', 'belgium', 'switzerland', 'austria', 'czech republic', 'poland'],
        'mexico': ['guatemala', 'belize'],
        'costa rica': ['panama', 'nicaragua'],
        'panama': ['costa rica', 'colombia'],
        'thailand': ['malaysia', 'cambodia', 'laos', 'myanmar'],
        'malaysia': ['thailand', 'singapore', 'indonesia']
      };
      
      // Check if town is in a neighboring country
      let isNeighbor = false;
      userCountries.forEach(userCountry => {
        if (neighbors[userCountry]?.includes(townCountry)) {
          isNeighbor = true;
        }
      });
      
      if (isNeighbor) {
        score += 85; // High score for neighbors
        factors++;
      } else {
        score += 40; // Base score for non-selected countries
        factors++;
      }
    }
  }
  
  // 2. Region/continent match
  if (preferences.region_preferences.regions?.length > 0) {
    const userRegions = preferences.region_preferences.regions.map(r => r.toLowerCase());
    const townCountry = town.country.toLowerCase();
    
    const regionMappings = {
      'europe': ['portugal', 'spain', 'france', 'italy', 'greece', 'germany', 'netherlands', 'belgium', 'austria', 'switzerland', 'czech republic', 'poland', 'croatia', 'malta', 'cyprus'],
      'mediterranean': ['spain', 'france', 'italy', 'greece', 'croatia', 'malta', 'cyprus', 'turkey', 'morocco', 'tunisia'],
      'iberian': ['portugal', 'spain'],
      'north america': ['mexico', 'united states', 'canada'],
      'central america': ['costa rica', 'panama', 'nicaragua', 'guatemala', 'belize', 'honduras', 'el salvador'],
      'south america': ['ecuador', 'colombia', 'peru', 'chile', 'argentina', 'uruguay', 'brazil'],
      'southeast asia': ['thailand', 'malaysia', 'philippines', 'vietnam', 'cambodia', 'indonesia', 'singapore'],
      'caribbean': ['barbados', 'dominican republic', 'jamaica', 'bahamas', 'trinidad and tobago']
    };
    
    let regionMatch = false;
    userRegions.forEach(userRegion => {
      Object.entries(regionMappings).forEach(([region, countries]) => {
        if (userRegion.includes(region) && countries.includes(townCountry)) {
          regionMatch = true;
        }
      });
    });
    
    if (regionMatch) {
      score += 90;
      factors++;
    }
  }
  
  // 3. Geographic features match
  if (preferences.region_preferences.geographic_features?.length > 0) {
    const townFeatures = (town.geographic_features || '').toLowerCase();
    const userFeatures = preferences.region_preferences.geographic_features;
    
    let featureScore = 0;
    let featureCount = 0;
    
    userFeatures.forEach(feature => {
      const featureLower = feature.toLowerCase();
      if (townFeatures.includes(featureLower) || 
          (featureLower === 'coastal' && townFeatures.includes('coast')) ||
          (featureLower === 'mountains' && townFeatures.includes('mountain')) ||
          (featureLower === 'islands' && townFeatures.includes('island'))) {
        featureScore += 95;
        featureCount++;
      }
    });
    
    if (featureCount > 0) {
      score += featureScore / featureCount;
      factors++;
    }
  }
  
  // Calculate weighted average
  if (factors === 0) return 70; // Default if no preferences
  
  return Math.round(score / factors);
};

const calculateEnhancedAdministrationScore = (town, preferences) => {
  if (!preferences.administration) return 70;
  
  let totalScore = 0;
  let factors = 0;
  
  // Healthcare scoring (major component of administration)
  if (town.healthcare_score) {
    let healthScore = calculatePremiumHealthcareScore(town, preferences);
    totalScore += healthScore * 1.5; // Higher weight for healthcare
    factors += 1.5;
  }
  
  // Safety scoring
  if (town.safety_score) {
    let safetyScore = calculateSafetyScore(town, preferences);
    totalScore += safetyScore;
    factors++;
  }
  
  // Visa preferences
  if (preferences.administration.visa_preference?.length > 0) {
    let visaScore = 70;
    if (preferences.administration.visa_preference.includes('good')) {
      if (town.visa_info?.toLowerCase().includes('easy') || 
          town.visa_info?.toLowerCase().includes('simple')) {
        visaScore = 90;
      }
    }
    totalScore += visaScore;
    factors++;
  }
  
  // Tax preferences
  if (preferences.administration.tax_preference?.length > 0) {
    let taxScore = 70;
    if (preferences.administration.tax_preference.includes('good')) {
      if (town.tax_info?.toLowerCase().includes('favorable') || 
          town.tax_info?.toLowerCase().includes('low')) {
        taxScore = 90;
      }
    }
    totalScore += taxScore;
    factors++;
  }
  
  // Government efficiency
  if (preferences.administration.government_efficiency?.length > 0) {
    let govScore = 70;
    if (preferences.administration.government_efficiency.includes('good')) {
      if (town.government_rating >= 7) govScore = 90;
      else if (town.government_rating >= 5) govScore = 75;
    }
    totalScore += govScore * 0.5; // Lower weight
    factors += 0.5;
  }
  
  // Infrastructure (now part of administration)
  const infraScore = calculateInfrastructureScore(town);
  totalScore += infraScore * 0.5;
  factors += 0.5;
  
  return factors > 0 ? totalScore / factors : 70;
};

const calculateAdministrationScore = calculateEnhancedAdministrationScore;

/**
 * Premium insight generation
 */
const generatePremiumInsights = (town, preferences, scores) => {
  const insights = [];
  
  // Value insights
  if (scores.budget >= 90 && scores.healthcare >= 80) {
    insights.push({
      type: 'value',
      text: 'Premium healthcare at an affordable cost',
      priority: 1
    });
  }
  
  // Perfect match insights
  const highScores = Object.entries(scores).filter(([_, score]) => score >= 90).length;
  if (highScores >= 5) {
    insights.push({
      type: 'match',
      text: 'Strong match across multiple categories',
      priority: 1
    });
  }
  
  // Lifestyle insights
  if (scores.culture >= 85 && scores.lifestyle >= 80) {
    insights.push({
      type: 'lifestyle',
      text: 'Strong cultural fit with vibrant expat community',
      priority: 2
    });
  }
  
  // Climate paradise
  if (scores.climate >= 90) {
    insights.push({
      type: 'climate',
      text: 'Climate matches your year-round preferences',
      priority: 3
    });
  }
  
  // Small town
  if (scores.budget >= 85 && town.population < 100000) {
    insights.push({
      type: 'discovery',
      text: 'Affordable small town with amenities',
      priority: 2
    });
  }
  
  return insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(i => i.text);
};

/**
 * Detailed warning generation
 */
const identifyDetailedWarnings = (town, preferences) => {
  const warnings = [];
  
  // Budget warnings
  if (preferences.costs?.total_monthly_budget && town.cost_index) {
    const overBudget = ((town.cost_index - preferences.costs.total_monthly_budget) / 
                       preferences.costs.total_monthly_budget) * 100;
    if (overBudget > 30) {
      warnings.push(`${Math.round(overBudget)}% over budget - significant financial stretch`);
    } else if (overBudget > 15) {
      warnings.push(`${Math.round(overBudget)}% over budget - manageable with planning`);
    }
  }
  
  // Language barriers
  if (preferences.culture_preferences?.language_comfort?.preferences?.includes('english_only')) {
    if (!town.primary_language?.toLowerCase().includes('english')) {
      if (!town.english_proficiency_score || town.english_proficiency_score < 60) {
        warnings.push('Language barrier - limited English proficiency');
      }
    }
  }
  
  // Healthcare limitations
  if (preferences.administration?.health_considerations?.healthcare_access === 'full_access') {
    if (town.healthcare_score < 7) {
      warnings.push('Healthcare may not meet specialized needs');
    }
  }
  
  // Climate sensitivities
  if (preferences.administration?.health_considerations?.environmental_health === 'very_sensitive') {
    if (town.climate?.toLowerCase().includes('humid')) {
      warnings.push('High humidity may affect sensitive individuals');
    }
  }
  
  return warnings;
};

/**
 * Highlight identification
 */
const identifyHighlights = (town, scores) => {
  const highlights = [];
  
  if (town.unesco_heritage_sites > 0) {
    highlights.push('UNESCO World Heritage Site');
  }
  
  if (scores.healthcare >= 95) {
    highlights.push('World-class healthcare');
  }
  
  if (scores.safety >= 95) {
    highlights.push('Very safe');
  }
  
  if (scores.infrastructure >= 90) {
    highlights.push('Modern infrastructure');
  }
  
  if (town.expat_population?.toLowerCase().includes('large')) {
    highlights.push('Thriving expat community');
  }
  
  return highlights;
};

/**
 * Generate match reasons
 */
const generateMatchReasons = (scores, preferences, town) => {
  const reasons = [];
  
  // Find top 3 scoring categories
  const sortedScores = Object.entries(scores)
    .filter(([cat, score]) => score !== null && score !== undefined)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  sortedScores.forEach(([category, score]) => {
    if (score >= 80) {
      reasons.push(getCategoryReason(category, score, preferences, town));
    }
  });
  
  if (reasons.length === 0) {
    reasons.push('Balanced across all categories');
  }
  
  return reasons;
};

/**
 * Generate category-specific reasons
 */
const getCategoryReason = (category, score, preferences, town) => {
  switch(category) {
    case 'budget':
      if (preferences.costs?.total_monthly_budget && town.cost_index) {
        const savings = preferences.costs.total_monthly_budget - town.cost_index;
        return `Budget-friendly: Save $${Math.round(savings)}/month`;
      }
      return 'Good value for money';
      
    case 'healthcare':
      return 'Quality healthcare facilities';
      
    case 'climate':
      return 'Climate matches your preferences';
      
    case 'culture':
      if (town.expat_population?.includes('Large')) {
        return 'Vibrant expat community with familiar amenities';
      }
      return 'Strong cultural compatibility';
      
    case 'lifestyle':
      return 'Matches your activities and interests';
      
    case 'infrastructure':
      return 'Modern infrastructure and connectivity';
      
    case 'safety':
      return 'Very safe location';
      
    default:
      return `Strong ${category} compatibility`;
  }
};

/**
 * Calculate confidence level
 */
const calculateConfidenceLevel = (town) => {
  let dataPoints = 0;
  let totalPoints = 0;
  
  const requiredFields = [
    'cost_index', 'healthcare_score', 'safety_score', 
    'climate', 'population', 'expat_population'
  ];
  
  requiredFields.forEach(field => {
    totalPoints++;
    if (town[field] !== null && town[field] !== undefined && town[field] !== '') {
      dataPoints++;
    }
  });
  
  const completeness = (dataPoints / totalPoints) * 100;
  
  if (completeness >= 90) return 'High';
  if (completeness >= 70) return 'Medium';
  return 'Low';
};

/**
 * Calculate value rating
 */
const calculateValueRating = (town, scores) => {
  const valueScore = (scores.budget * 0.4) + 
                     (scores.healthcare * 0.3) + 
                     (scores.infrastructure * 0.2) + 
                     (scores.safety * 0.1);
  
  // Return null to disable value rating display
  return null;
};

// Quality bonus calculation
const calculateQualityBonus = (town, scores) => {
  let bonus = 0;
  
  // Premium destination bonus
  if (scores.healthcare >= 90 && scores.safety >= 90) {
    bonus += 5;
  }
  
  // Infrastructure excellence
  if (scores.infrastructure >= 85) {
    bonus += 3;
  }
  
  // Cultural heritage
  if (town.unesco_heritage_sites > 0) {
    bonus += 2;
  }
  
  // Perfect climate
  if (scores.climate >= 95) {
    bonus += 2;
  }
  
  return bonus;
};

export default calculatePremiumMatch;