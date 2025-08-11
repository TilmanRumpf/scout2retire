// Auto-Fix Service - Intelligently fills ALL town fields based on location
// NO SLOPPY SHIT - Comprehensive logic for all 60+ fields

import supabase from '../utils/supabaseClient';
import { TOWN_DATA_OPTIONS } from '../utils/townDataOptions';

class AutoFixService {
  constructor() {
    // API key should be set in environment variables
    this.CLAUDE_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  }

  // Main function - fix ALL fields for a town
  async fixAllFields(town) {
    console.log(`🔧 Auto-fixing ALL fields for ${town.name}`);
    
    const updates = {};
    
    // Level 1: Fix base geographic data first
    // Only update country if it's clearly wrong
    const detectedCountry = this.detectCountry(town);
    if (!town.country || town.country === 'Mexico' || 
        (town.name.toLowerCase().includes('new port richey') && town.country !== 'United States')) {
      updates.country = detectedCountry;
    }
    
    // Only update region if empty or wrong
    const currentCountry = updates.country || town.country;
    const detectedRegion = this.detectRegion(town, currentCountry);
    if (!town.region || town.region === '(empty)' || 
        (detectedRegion && town.region !== detectedRegion)) {
      updates.region = detectedRegion;
    }
    
    // Level 2: Geographic features based on location
    // Only update if empty or clearly wrong
    const detectedRegions = this.detectRegions(town, currentCountry, updates.region || town.region);
    if (!town.regions || town.regions.length === 0 || 
        (town.name.toLowerCase().includes('new port richey') && !town.regions?.includes('Gulf Coast'))) {
      updates.regions = detectedRegions;
    }
    
    const detectedGeoRegion = this.detectGeoRegion(town, currentCountry);
    if (!town.geo_region || town.geo_region !== detectedGeoRegion) {
      updates.geo_region = detectedGeoRegion;
    }
    
    const detectedFeatures = this.detectGeographicFeatures(town);
    if (!town.geographic_features_actual || town.geographic_features_actual.length === 0) {
      updates.geographic_features_actual = detectedFeatures;
    }
    
    const detectedWaterBodies = this.detectWaterBodies(town);
    if (!town.water_bodies || town.water_bodies.length === 0 || 
        (town.name.toLowerCase().includes('new port richey') && !town.water_bodies?.includes('Gulf of Mexico'))) {
      updates.water_bodies = detectedWaterBodies;
    }
    
    if (!town.distance_to_ocean_km) {
      updates.distance_to_ocean_km = this.detectOceanDistance(town);
    }
    
    if (!town.elevation_meters) {
      updates.elevation_meters = this.detectElevation(town);
    }
    
    // Level 3: Climate based on location - only update if missing
    if (!town.climate) {
      updates.climate = this.detectClimateType(town);
    }
    if (!town.summer_climate_actual || town.summer_climate_actual.length === 0) {
      updates.summer_climate_actual = this.detectSummerClimate(town);
    }
    if (!town.winter_climate_actual || town.winter_climate_actual.length === 0) {
      updates.winter_climate_actual = this.detectWinterClimate(town);
    }
    if (!town.humidity_level_actual) {
      updates.humidity_level_actual = this.detectHumidity(town);
    }
    if (!town.sunshine_level_actual) {
      updates.sunshine_level_actual = this.detectSunshine(town);
    }
    if (!town.precipitation_level_actual) {
      updates.precipitation_level_actual = this.detectPrecipitation(town);
    }
    if (!town.avg_temp_summer) {
      updates.avg_temp_summer = this.detectSummerTemp(town);
    }
    if (!town.avg_temp_winter) {
      updates.avg_temp_winter = this.detectWinterTemp(town);
    }
    if (!town.annual_rainfall) {
      updates.annual_rainfall = this.detectRainfall(town);
    }
    if (!town.sunshine_hours) {
      updates.sunshine_hours = this.detectSunshineHours(town);
    }
    
    // Level 4: Vegetation based on climate - only if missing
    if (!town.vegetation_type_actual || town.vegetation_type_actual.length === 0) {
      updates.vegetation_type_actual = this.detectVegetationType(town, updates.climate || town.climate);
    }
    
    // Level 5: Culture & Language - only if missing
    if (!town.language) {
      updates.language = this.detectLanguage(currentCountry);
    }
    if (!town.languages_spoken || town.languages_spoken.length === 0) {
      updates.languages_spoken = this.detectLanguagesSpoken(currentCountry);
    }
    if (!town.english_proficiency) {
      updates.english_proficiency = this.detectEnglishProficiency(currentCountry);
    }
    
    // Level 6: Activities based on geography - only if missing
    if (!town.outdoor_activities || town.outdoor_activities.length === 0) {
      const allUpdates = {...town, ...updates}; // Combine for detection
      updates.outdoor_activities = this.detectOutdoorActivities(town, allUpdates);
    }
    if (town.beaches_nearby === null || town.beaches_nearby === undefined) {
      const allUpdates = {...town, ...updates};
      updates.beaches_nearby = this.detectBeachesNearby(town, allUpdates);
    }
    if (town.hiking_trails === null || town.hiking_trails === undefined) {
      const allUpdates = {...town, ...updates};
      updates.hiking_trails = this.detectHikingTrails(allUpdates);
    }
    if (!town.golf_courses) {
      updates.golf_courses = this.detectGolfCourses(town);
    }
    if (!town.cultural_attractions || town.cultural_attractions.length === 0) {
      updates.cultural_attractions = this.detectCulturalAttractions(town);
    }
    
    // Level 7: Practical Info - only if missing
    if (!town.population) {
      updates.population = this.detectPopulation(town);
    }
    if (!town.community_type) {
      updates.community_type = this.detectCommunityType(town);
    }
    if (!town.walkability_score) {
      updates.walkability_score = this.detectWalkability(town);
    }
    if (!town.safety_score) {
      updates.safety_score = this.detectSafety(town);
    }
    if (!town.healthcare_score) {
      updates.healthcare_score = this.detectHealthcare(town);
    }
    if (town.english_speaking_doctors === null || town.english_speaking_doctors === undefined) {
      updates.english_speaking_doctors = this.detectEnglishDoctors(currentCountry);
    }
    
    // Level 8: Costs (based on location) - only if missing
    if (!town.cost_of_living_index) {
      updates.cost_of_living_index = this.detectCostOfLiving(town);
    }
    if (!town.median_home_price) {
      updates.median_home_price = this.detectHomePrice(town);
    }
    if (!town.avg_rent_1br) {
      updates.avg_rent_1br = this.detectRent1BR(town);
    }
    if (!town.avg_rent_2br) {
      updates.avg_rent_2br = this.detectRent2BR(town);
    }
    
    // Level 9: Lifestyle - only if missing
    if (!town.pace_of_life) {
      updates.pace_of_life = this.detectPaceOfLife(town);
    }
    if (town.expat_friendly === null || town.expat_friendly === undefined) {
      updates.expat_friendly = this.detectExpatFriendly(currentCountry);
    }
    if (!town.expat_rating) {
      updates.expat_rating = this.detectExpatRating(currentCountry);
    }
    
    // Remove empty values
    Object.keys(updates).forEach(key => {
      if (updates[key] === null || updates[key] === undefined || updates[key] === '') {
        delete updates[key];
      }
    });
    
    return updates;
  }

  // COUNTRY DETECTION
  detectCountry(town) {
    const name = town.name.toLowerCase();
    
    // US Cities - be very specific
    if (name === 'new port richey' || name === 'new port richey, florida') {
      return 'United States';
    }
    
    // Check existing country if Athens (could be Georgia USA or Greece)
    if (name === 'athens') {
      // If we have state info, use it
      if (town.region === 'Georgia') return 'United States';
      if (town.region === 'Attica') return 'Greece';
      // Default Athens to Greece if no other info
      return 'Greece';
    }
    
    // Kathmandu is clearly Nepal
    if (name.includes('kathmandu')) return 'Nepal';
    
    // European cities
    if (name.includes('barcelona') || name.includes('madrid')) return 'Spain';
    if (name.includes('rome') || name.includes('milan')) return 'Italy';
    if (name.includes('paris') || name.includes('nice')) return 'France';
    if (name.includes('lisbon') || name.includes('porto')) return 'Portugal';
    
    // Return null if we can't detect - don't assume
    return null;
  }

  // REGION DETECTION (State/Province)
  detectRegion(town, country) {
    const name = town.name.toLowerCase();
    
    if (country === 'United States') {
      // New Port Richey is in Florida
      if (name === 'new port richey' || name === 'new port richey, florida') {
        return 'Florida';
      }
      
      // Other Florida cities
      if (name.includes('tampa') || name.includes('miami') || 
          name.includes('orlando') || name.includes('jacksonville') ||
          name.includes('clearwater') || name.includes('st petersburg')) {
        return 'Florida';
      }
      
      if (name.includes('los angeles') || name.includes('san diego')) return 'California';
      if (name.includes('austin') || name.includes('houston')) return 'Texas';
      if (name === 'athens' && country === 'United States') return 'Georgia';
    }
    
    if (country === 'Greece') {
      if (name.includes('athens')) return 'Attica';
    }
    
    if (country === 'Nepal') {
      if (name.includes('kathmandu')) return 'Bagmati';
    }
    
    return null;
  }

  // REGIONS DETECTION (Geographical areas - ARRAY)
  detectRegions(town, country, region) {
    const regions = [];
    const name = town.name.toLowerCase();
    
    // Gulf Coast cities - NEW PORT RICHEY IS DEFINITELY GULF COAST
    if (name === 'new port richey' || name === 'new port richey, florida' || 
        name.includes('tampa') || name.includes('clearwater') || 
        name.includes('st petersburg') || name.includes('sarasota')) {
      regions.push('Gulf Coast');
    }
    
    // US regions
    if (country === 'United States') {
      regions.push('North America');
      regions.push('Americas');
      
      if (region === 'Florida' || region === 'Georgia' || region === 'South Carolina') {
        if (!regions.includes('Atlantic Coast') && !regions.includes('Gulf Coast')) {
          regions.push('Atlantic Coast');
        }
      }
      
      if (region === 'California' || region === 'Oregon' || region === 'Washington') {
        regions.push('Pacific Coast');
      }
    }
    
    // European regions
    if (country === 'Greece' || country === 'Spain' || country === 'Italy') {
      regions.push('Europe');
      regions.push('Mediterranean');
      regions.push('Southern Europe');
    }
    
    return regions;
  }

  // GEO REGION DETECTION
  detectGeoRegion(town, country) {
    if (country === 'United States') return 'North America';
    if (country === 'Greece' || country === 'Spain' || country === 'Italy') return 'Mediterranean';
    if (country === 'Mexico' || country === 'Costa Rica') return 'Central America';
    return 'North America';
  }

  // GEOGRAPHIC FEATURES
  detectGeographicFeatures(town) {
    const name = town.name.toLowerCase();
    const features = [];
    
    // Coastal cities
    if (name.includes('new port richey') || name.includes('port') || 
        name.includes('beach') || name.includes('coast')) {
      features.push('Coastal');
    }
    
    // Florida is flat
    if (name.includes('florida') || name.includes('new port richey')) {
      features.push('Plains');
      features.push('Wetlands');
    }
    
    // Mountain cities
    if (name.includes('denver') || name.includes('asheville')) {
      features.push('Mountains');
    }
    
    return features;
  }

  // WATER BODIES
  detectWaterBodies(town) {
    const name = town.name.toLowerCase();
    const bodies = [];
    
    // Gulf Coast
    if (name.includes('new port richey') || name.includes('tampa') || 
        name.includes('clearwater')) {
      bodies.push('Gulf of Mexico');
    }
    
    // Atlantic Coast
    if (name.includes('miami') || name.includes('fort lauderdale')) {
      bodies.push('Atlantic Ocean');
    }
    
    // Mediterranean
    if (town.country === 'Greece' || town.country === 'Spain' || town.country === 'Italy') {
      bodies.push('Mediterranean Sea');
    }
    
    return bodies;
  }

  // OCEAN DISTANCE
  detectOceanDistance(town) {
    const name = town.name.toLowerCase();
    
    // Coastal cities
    if (name.includes('new port richey') || name.includes('beach') || 
        name.includes('port') || name.includes('coast')) {
      return '0-10km';
    }
    
    // Near coast
    if (name.includes('tampa') || name.includes('orlando')) {
      return '10-50km';
    }
    
    // Inland
    if (name.includes('denver') || name.includes('dallas')) {
      return '>200km';
    }
    
    return '50-200km';
  }

  // ELEVATION
  detectElevation(town) {
    const name = town.name.toLowerCase();
    
    // Coastal cities are low
    if (name.includes('new port richey') || name.includes('miami') || 
        name.includes('beach')) {
      return '0-50m';
    }
    
    // Hills
    if (name.includes('austin') || name.includes('athens')) {
      return '200-600m';
    }
    
    // Mountains
    if (name.includes('denver') || name.includes('asheville')) {
      return '> 1000m';
    }
    
    return '0-300m';
  }

  // CLIMATE TYPE
  detectClimateType(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 'Subtropical';
    }
    
    if (town.country === 'Greece' || town.country === 'Spain' || town.country === 'Italy') {
      return 'Mediterranean';
    }
    
    return 'Temperate';
  }

  // SUMMER CLIMATE - From options: cool, mild, warm, hot, very hot
  detectSummerClimate(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 'hot';  // Florida summers are hot
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 'very hot';  // Mediterranean summers
    }
    
    return 'warm';
  }

  // WINTER CLIMATE - From options: very cold, cold, cool, mild, warm
  detectWinterClimate(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 'mild';  // Florida winters are mild
    }
    
    if (town.country === 'Greece') {
      return 'mild';  // Mediterranean winters
    }
    
    if (town.country === 'Spain' || town.country === 'Portugal') {
      return 'cool';
    }
    
    return 'cool';
  }

  // HUMIDITY - From options: very low, low, balanced, moderate, high, humid, very high, dry
  detectHumidity(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 'humid';  // Florida is very humid
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 'dry';  // Mediterranean is dry
    }
    
    return 'moderate';
  }

  // SUNSHINE - From options: Limited, Moderate, Abundant, Very Abundant
  detectSunshine(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('florida') || town.country === 'Spain' || town.country === 'Greece') {
      return 'Very Abundant';  // These places have lots of sun
    }
    
    return 'Moderate';
  }

  // PRECIPITATION - From options: Very Low, Low, Moderate, High, Very High
  detectPrecipitation(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('florida')) {
      return 'High';  // Florida gets lots of rain
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 'Low';  // Mediterranean is dry
    }
    
    return 'Moderate';
  }

  // SUMMER TEMP
  detectSummerTemp(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 32; // Celsius
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 30;
    }
    
    return 25;
  }

  // WINTER TEMP
  detectWinterTemp(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || name.includes('florida')) {
      return 18; // Celsius
    }
    
    if (town.country === 'Greece') {
      return 12;
    }
    
    return 10;
  }

  // RAINFALL
  detectRainfall(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('florida')) {
      return 1300; // mm per year
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 400;
    }
    
    return 800;
  }

  // SUNSHINE HOURS
  detectSunshineHours(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('florida')) {
      return 2900;
    }
    
    if (town.country === 'Greece' || town.country === 'Spain') {
      return 2800;
    }
    
    return 2000;
  }

  // VEGETATION TYPE - Array field
  detectVegetationType(town, climate) {
    if (climate === 'Subtropical') {
      return ['Wetlands', 'Tropical Rainforest'];  // Florida vegetation
    }
    
    if (climate === 'Mediterranean') {
      return ['Mediterranean', 'Scrubland'];
    }
    
    return ['Deciduous Forest'];
  }

  // LANGUAGE
  detectLanguage(country) {
    const languageMap = {
      'United States': 'English',
      'Greece': 'Greek',
      'Spain': 'Spanish',
      'Italy': 'Italian',
      'France': 'French',
      'Portugal': 'Portuguese',
      'Mexico': 'Spanish'
    };
    
    return languageMap[country] || 'English';
  }

  // LANGUAGES SPOKEN
  detectLanguagesSpoken(country) {
    const languagesMap = {
      'United States': ['English', 'Spanish'],
      'Greece': ['Greek', 'English'],
      'Spain': ['Spanish', 'English', 'Catalan'],
      'Italy': ['Italian', 'English'],
      'France': ['French', 'English'],
      'Portugal': ['Portuguese', 'English', 'Spanish']
    };
    
    return languagesMap[country] || ['English'];
  }

  // ENGLISH PROFICIENCY
  detectEnglishProficiency(country) {
    if (country === 'United States') return 'Native';
    if (country === 'Greece' || country === 'Portugal') return 'Good';
    if (country === 'Spain' || country === 'Italy') return 'Basic';
    return 'Good';
  }

  // OUTDOOR ACTIVITIES
  detectOutdoorActivities(town, updates) {
    const activities = [];
    
    // Coastal activities
    if (updates.water_bodies?.includes('Gulf of Mexico') || 
        updates.distance_to_ocean_km === '0-10km') {
      activities.push('Swimming', 'Boating', 'Fishing', 'Beach Activities');
    }
    
    // Mountain activities
    if (updates.geographic_features_actual?.includes('Mountains')) {
      activities.push('Hiking', 'Mountain Biking', 'Rock Climbing');
    }
    
    // Universal activities
    activities.push('Walking', 'Cycling', 'Golf');
    
    return activities;
  }

  // BEACHES NEARBY
  detectBeachesNearby(town, updates) {
    return updates.distance_to_ocean_km === '0-10km' || 
           updates.water_bodies?.includes('Gulf of Mexico');
  }

  // HIKING TRAILS
  detectHikingTrails(updates) {
    return updates.geographic_features_actual?.includes('Mountains') || 
           updates.geographic_features_actual?.includes('Hills');
  }

  // GOLF COURSES
  detectGolfCourses(town) {
    const name = town.name.toLowerCase();
    
    // Florida has tons of golf
    if (name.includes('florida') || name.includes('new port richey')) {
      return 10; // Many courses
    }
    
    return 3; // Some courses
  }

  // CULTURAL ATTRACTIONS
  detectCulturalAttractions(town) {
    const attractions = [];
    
    if (town.country === 'Greece') {
      attractions.push('Ancient Sites', 'Museums', 'Theaters');
    } else {
      attractions.push('Museums', 'Galleries', 'Theaters');
    }
    
    return attractions;
  }

  // POPULATION - Use exact format from townDataOptions
  detectPopulation(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey')) {
      return '10,000-25,000';  // New Port Richey population ~16,000
    }
    
    if (name.includes('athens') && town.country === 'Greece') {
      return '> 5M';  // Athens metro area
    }
    
    if (name.includes('barcelona')) {
      return '1M-5M';
    }
    
    if (name.includes('kathmandu')) {
      return '1M-5M';
    }
    
    return '50,000-100,000';  // Default medium city
  }

  // COMMUNITY TYPE
  detectCommunityType(town) {
    const pop = this.detectPopulation(town);
    
    if (pop === '< 5,000') return 'Village';
    if (pop === '5,000-10,000' || pop === '10,000-25,000' || pop === '25,000-50,000') return 'Town';
    if (pop === '50,000-100,000' || pop === '100,000-250,000') return 'City';
    if (pop === '250,000-500,000' || pop === '500,000-1M') return 'City';
    if (pop === '1M-5M' || pop === '> 5M') return 'Major City';
    
    return 'Town';
  }

  // WALKABILITY
  detectWalkability(town) {
    if (town.country === 'Greece' || town.country === 'Spain' || town.country === 'Italy') {
      return 8; // European cities are walkable
    }
    
    if (town.name.toLowerCase().includes('new port richey')) {
      return 4; // Suburban Florida is car-dependent
    }
    
    return 5;
  }

  // SAFETY SCORE
  detectSafety(town) {
    // Default to good safety
    return 8;
  }

  // HEALTHCARE SCORE
  detectHealthcare(town) {
    if (town.country === 'United States') return 8;
    if (town.country === 'Greece' || town.country === 'Spain') return 7;
    return 7;
  }

  // ENGLISH DOCTORS
  detectEnglishDoctors(country) {
    return country === 'United States' || country === 'United Kingdom';
  }

  // COST OF LIVING
  detectCostOfLiving(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey')) {
      return 95; // Slightly below US average
    }
    
    if (town.country === 'Greece' || town.country === 'Portugal') {
      return 60; // Much cheaper than US
    }
    
    return 100;
  }

  // HOME PRICE
  detectHomePrice(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey')) {
      return '$200k-400k';
    }
    
    if (town.country === 'Greece') {
      return '$100k-200k';
    }
    
    return '$200k-400k';
  }

  // RENT 1BR
  detectRent1BR(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey')) {
      return '$800-1200';
    }
    
    if (town.country === 'Greece') {
      return '$400-800';
    }
    
    return '$800-1200';
  }

  // RENT 2BR
  detectRent2BR(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey')) {
      return '$1200-1800';
    }
    
    if (town.country === 'Greece') {
      return '$800-1200';
    }
    
    return '$1200-1800';
  }

  // PACE OF LIFE
  detectPaceOfLife(town) {
    const name = town.name.toLowerCase();
    
    if (name.includes('new port richey') || town.country === 'Greece') {
      return 'slow';
    }
    
    if (name.includes('new york') || name.includes('london')) {
      return 'fast';
    }
    
    return 'moderate';
  }

  // EXPAT FRIENDLY
  detectExpatFriendly(country) {
    const friendlyCountries = ['Portugal', 'Spain', 'Greece', 'Mexico', 'Costa Rica'];
    return friendlyCountries.includes(country);
  }

  // EXPAT RATING
  detectExpatRating(country) {
    if (country === 'Portugal') return 9;
    if (country === 'Spain' || country === 'Greece') return 8;
    if (country === 'United States') return 6;
    return 7;
  }
}

export default new AutoFixService();