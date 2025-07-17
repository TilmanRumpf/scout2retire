import supabase from './supabaseClient';

/**
 * Fetches comprehensive user context for Scotty personalization
 * @param {string} userId - The user's ID
 * @returns {Object} Complete user context including profile and preferences
 */
export async function getUserContext(userId) {
  try {
    // Fetch user profile with all onboarding data
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user context:', error);
      return null;
    }

    // Fetch user's favorite towns with a simple query
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    
    if (favError) {
      console.log('Error fetching favorites:', favError);
      // Continue without favorites rather than failing completely
    }

    // Check if data has been migrated to new format
    // NOTE: In reality, most users are still in legacy JSON format
    const hasNewFormat = userProfile.primary_citizenship !== null;
    
    // If old format, fetch from onboarding_responses
    if (!hasNewFormat && userProfile.onboarding_completed) {
      console.log('User data in legacy format, fetching from onboarding_responses');
      const { data: onboardingData } = await supabase
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (onboardingData) {
        console.log('Found legacy onboarding data');
        // Merge JSON data into userProfile for backward compatibility
        return formatLegacyContext(userProfile, onboardingData, favorites);
      }
    }

    // Format the context for easy consumption
    const context = {
      // Personal Information
      personal: {
        name: userProfile.full_name,
        email: userProfile.email,
        hometown: userProfile.hometown,
        age_group: calculateAgeGroup(userProfile.retirement_year_estimate),
      },

      // Citizenship & Family
      citizenship: {
        primary: userProfile.primary_citizenship,
        has_dual: userProfile.dual_citizenship,
        secondary: userProfile.secondary_citizenship,
        is_eu_citizen: isEUCitizen(userProfile.primary_citizenship, userProfile.secondary_citizenship),
        is_us_citizen: isUSCitizen(userProfile.primary_citizenship, userProfile.secondary_citizenship),
      },

      family: {
        situation: userProfile.family_situation, // single/couple
        has_pets: userProfile.has_pets,
        partner_citizenship: userProfile.family_situation === 'couple' ? {
          primary: userProfile.partner_primary_citizenship,
          has_dual: userProfile.partner_dual_citizenship,
          secondary: userProfile.partner_secondary_citizenship,
        } : null,
      },

      // Retirement Timeline
      timeline: {
        status: userProfile.retirement_status, // planning/retiring_soon/already_retired
        target_date: userProfile.retirement_month && userProfile.retirement_day ? 
          new Date(userProfile.retirement_year_estimate, userProfile.retirement_month - 1, userProfile.retirement_day) : null,
        years_until: calculateYearsUntilRetirement(userProfile),
      },

      // Geographic Preferences
      geography: {
        regions: userProfile.preferred_regions || [],
        countries: userProfile.preferred_countries || [],
        provinces: userProfile.preferred_provinces || [],
        features: userProfile.geographic_features || [],
        vegetation: userProfile.vegetation_preferences || [],
      },

      // Climate Preferences
      climate: {
        summer_temp: userProfile.summer_temp_preference,
        winter_temp: userProfile.winter_temp_preference,
        humidity: userProfile.humidity_preference,
        sunshine: userProfile.sunshine_preference,
        precipitation: userProfile.precipitation_preference,
        seasonal: userProfile.seasonal_preference,
      },

      // Cultural & Lifestyle
      culture: {
        urban_rural: userProfile.lifestyle_urban_rural,
        pace: userProfile.lifestyle_pace,
        social_atmosphere: userProfile.lifestyle_social_atmosphere,
        political_lean: userProfile.lifestyle_political_lean,
        expat_community: userProfile.expat_community_importance,
        language_comfort: userProfile.language_comfort,
        languages_spoken: userProfile.languages_spoken || [],
        // Culture importance ratings
        nightlife: userProfile.culture_nightlife_importance,
        museums: userProfile.culture_museums_importance,
        events: userProfile.culture_cultural_events_importance,
        dining: userProfile.culture_dining_importance,
        outdoor: userProfile.culture_outdoor_importance,
        shopping: userProfile.culture_shopping_importance,
      },

      // Activities & Interests
      activities: {
        sports: userProfile.activities_sports,
        cultural: userProfile.activities_cultural,
        nature: userProfile.activities_nature,
        food: userProfile.activities_food,
        shopping: userProfile.activities_shopping,
        creative: userProfile.activities_creative,
        wellness: userProfile.activities_wellness,
        social: userProfile.activities_social,
        volunteer: userProfile.activities_volunteer,
      },

      interests: {
        local_cuisine: userProfile.interests_local_cuisine,
        history: userProfile.interests_history,
        beaches: userProfile.interests_beaches,
        mountains: userProfile.interests_mountains,
        city_life: userProfile.interests_city_life,
        rural_life: userProfile.interests_rural_life,
        arts: userProfile.interests_arts,
        music: userProfile.interests_music,
        gardening: userProfile.interests_gardening,
      },

      // Administrative Preferences
      administration: {
        healthcare_importance: userProfile.healthcare_importance,
        insurance_importance: userProfile.insurance_importance,
        healthcare_concerns: userProfile.healthcare_concerns || [],
        safety_importance: userProfile.safety_importance,
        infrastructure_importance: userProfile.infrastructure_importance,
        political_stability: userProfile.political_stability_importance,
        visa_preference: userProfile.visa_preference,
        stay_duration: userProfile.stay_duration,
        residency_path: userProfile.residency_path,
        tax_concern: userProfile.tax_concern,
        government_efficiency: userProfile.government_efficiency_concern,
      },

      // Financial Information
      budget: {
        total_monthly: userProfile.total_budget_usd,
        max_rent: userProfile.max_rent_usd,
        max_home_price: userProfile.max_home_price_usd,
        healthcare_budget: userProfile.healthcare_budget_usd,
        priorities: userProfile.financial_priorities || [],
      },

      // Lifestyle Priorities (1-5 ratings)
      lifestyle_priorities: {
        family: userProfile.lifestyle_importance_family,
        adventure: userProfile.lifestyle_importance_adventure,
        comfort: userProfile.lifestyle_importance_comfort,
        intellectual: userProfile.lifestyle_importance_intellectual,
        social: userProfile.lifestyle_importance_social,
        health: userProfile.lifestyle_importance_health,
      },

      // Travel
      travel: {
        frequency: userProfile.travel_frequency,
      },

      // Metadata
      onboarding_completed: userProfile.onboarding_completed,
      created_at: userProfile.created_at,

      // Favorite towns
      favorites: (favorites || []).map(fav => ({
        town_id: fav.town_id,
        town_name: fav.town_name,
        country: fav.town_country,
        notes: fav.notes,
        favorited_at: fav.favorited_at
      }))
    };

    return context;
  } catch (error) {
    console.error('Error in getUserContext:', error);
    return null;
  }
}

// Helper functions
function calculateAgeGroup(retirementYear) {
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = retirementYear - currentYear;
  
  if (yearsToRetirement <= 0) return '65+';
  if (yearsToRetirement <= 5) return '60-65';
  if (yearsToRetirement <= 10) return '55-60';
  return '50-55';
}

function calculateYearsUntilRetirement(profile) {
  if (profile.retirement_status === 'already_retired') return 0;
  
  const currentYear = new Date().getFullYear();
  return Math.max(0, profile.retirement_year_estimate - currentYear);
}

function isEUCitizen(primary, secondary) {
  const euCountries = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'be', 'at', 'se', 'dk', 'ie'];
  return euCountries.includes(primary) || (secondary && euCountries.includes(secondary));
}

function isUSCitizen(primary, secondary) {
  return primary === 'us' || secondary === 'us';
}

/**
 * Formats legacy JSON onboarding data into the new context structure
 * @param {Object} userProfile - Basic user profile
 * @param {Object} onboardingData - JSON onboarding responses
 * @param {Array} favorites - User's favorite towns
 * @returns {Object} Formatted context
 */
function formatLegacyContext(userProfile, onboardingData, favorites = []) {
  const { current_status, region, climate, culture, hobbies, administration, budget } = onboardingData;
  
  // Debug logging
  console.log('Legacy context - current_status:', current_status);
  console.log('Legacy context - family_situation:', current_status?.family_situation);
  console.log('Legacy context - partner_citizenship:', current_status?.partner_citizenship);
  
  return {
    personal: {
      name: userProfile.full_name,
      email: userProfile.email,
      hometown: userProfile.hometown,
      age_group: calculateAgeGroup(userProfile.retirement_year_estimate),
    },

    citizenship: {
      primary: current_status?.citizenship?.primary_citizenship || userProfile.nationality,
      has_dual: current_status?.citizenship?.dual_citizenship || false,
      secondary: current_status?.citizenship?.secondary_citizenship,
      is_eu_citizen: isEUCitizen(
        current_status?.citizenship?.primary_citizenship || userProfile.nationality,
        current_status?.citizenship?.secondary_citizenship
      ),
      is_us_citizen: isUSCitizen(
        current_status?.citizenship?.primary_citizenship || userProfile.nationality,
        current_status?.citizenship?.secondary_citizenship
      ),
    },

    family: {
      situation: current_status?.family_situation?.status || (typeof current_status?.family_situation === 'string' ? current_status.family_situation : 'single'),
      has_pets: current_status?.pet_owner?.length > 0 || current_status?.has_pets || false,
      partner_citizenship: current_status?.family_situation?.status === 'couple' && current_status?.partner_citizenship ? {
        primary: current_status.partner_citizenship.primary_citizenship,
        has_dual: current_status.partner_citizenship.dual_citizenship || false,
        secondary: current_status.partner_citizenship.secondary_citizenship,
      } : null,
    },

    timeline: {
      status: current_status?.retirement_timeline?.status || current_status?.retirement_status || 'planning',
      target_date: current_status?.retirement_timeline?.target_month ? 
        new Date(current_status.retirement_timeline.target_year, current_status.retirement_timeline.target_month - 1, current_status.retirement_timeline.target_day || 1) : null,
      years_until: current_status?.retirement_timeline?.target_year ? 
        Math.max(0, current_status.retirement_timeline.target_year - new Date().getFullYear()) : 
        calculateYearsUntilRetirement(userProfile),
    },

    geography: {
      regions: region?.regions || [],
      countries: region?.countries || [],
      provinces: region?.provinces || [],
      features: region?.geographic_features || [],
      vegetation: region?.vegetation_types || [],
    },

    climate: {
      summer_temp: climate?.summer_temp,
      winter_temp: climate?.winter_temp,
      humidity: climate?.humidity_level,
      sunshine: climate?.sunshine_level,
      precipitation: climate?.precipitation_level,
      seasonal: climate?.seasonal_preference,
    },

    culture: {
      urban_rural: culture?.lifestyle?.urban_rural,
      pace: culture?.lifestyle?.pace,
      social_atmosphere: culture?.lifestyle?.social_atmosphere,
      political_lean: culture?.lifestyle?.political_lean,
      expat_community: culture?.expat_community,
      language_comfort: culture?.language_comfort,
      languages_spoken: culture?.languages || [],
      nightlife: culture?.cultural_importance?.nightlife,
      museums: culture?.cultural_importance?.museums,
      events: culture?.cultural_importance?.cultural_events,
      dining: culture?.cultural_importance?.dining,
      outdoor: culture?.cultural_importance?.outdoor,
      shopping: culture?.cultural_importance?.shopping,
    },

    activities: {
      sports: hobbies?.activities?.includes('sports'),
      cultural: hobbies?.activities?.includes('cultural'),
      nature: hobbies?.activities?.includes('nature'),
      food: hobbies?.activities?.includes('food'),
      shopping: hobbies?.activities?.includes('shopping'),
      creative: hobbies?.activities?.includes('creative'),
      wellness: hobbies?.activities?.includes('wellness'),
      social: hobbies?.activities?.includes('social'),
      volunteer: hobbies?.activities?.includes('volunteer'),
    },

    interests: {
      local_cuisine: hobbies?.interests?.includes('local_cuisine'),
      history: hobbies?.interests?.includes('history'),
      beaches: hobbies?.interests?.includes('beaches'),
      mountains: hobbies?.interests?.includes('mountains'),
      city_life: hobbies?.interests?.includes('city_life'),
      rural_life: hobbies?.interests?.includes('rural_life'),
      arts: hobbies?.interests?.includes('arts'),
      music: hobbies?.interests?.includes('music'),
      gardening: hobbies?.interests?.includes('gardening'),
    },

    administration: {
      healthcare_importance: administration?.healthcare_quality?.[0],
      insurance_importance: administration?.insurance_importance?.[0],
      healthcare_concerns: administration?.health_considerations ? 
        Object.values(administration.health_considerations).filter(v => v) : [],
      safety_importance: administration?.safety_importance?.[0],
      infrastructure_importance: administration?.infrastructure?.[0],
      political_stability: administration?.political_stability?.[0],
      visa_preference: administration?.visa_preference?.[0],
      stay_duration: administration?.stay_duration?.[0],
      residency_path: administration?.residency_path?.[0],
      tax_concern: administration?.tax_preference?.[0],
      government_efficiency: administration?.government_efficiency?.[0],
    },

    budget: {
      total_monthly: budget?.total_budget,
      max_rent: budget?.rent_budget,
      max_home_price: budget?.home_price,
      healthcare_budget: budget?.healthcare_budget,
      priorities: budget?.financial_priorities || [],
    },

    lifestyle_priorities: {
      family: hobbies?.lifestyle_importance?.family,
      adventure: hobbies?.lifestyle_importance?.adventure,
      comfort: hobbies?.lifestyle_importance?.comfort,
      intellectual: hobbies?.lifestyle_importance?.intellectual,
      social: hobbies?.lifestyle_importance?.social,
      health: hobbies?.lifestyle_importance?.health,
    },

    travel: {
      frequency: hobbies?.travel_frequency,
    },

    onboarding_completed: userProfile.onboarding_completed,
    created_at: userProfile.created_at,

    // Favorite towns
    favorites: (favorites || []).map(fav => ({
      town_id: fav.town_id,
      town_name: fav.town_name,
      country: fav.town_country,
      notes: fav.notes,
      favorited_at: fav.favorited_at
    }))
  };
}

/**
 * Formats user context into a concise string for AI prompts
 * @param {Object} context - User context from getUserContext
 * @returns {string} Formatted context string
 */
export function formatContextForPrompt(context) {
  if (!context) return '';

  const parts = [];

  // Personal info
  parts.push(`User: ${context.personal.name || 'User'}`);
  
  // Citizenship
  if (context.citizenship.has_dual) {
    parts.push(`Citizenship: ${context.citizenship.primary} and ${context.citizenship.secondary}`);
  } else {
    parts.push(`Citizenship: ${context.citizenship.primary}`);
  }

  // Family situation
  if (context.family.situation === 'couple') {
    parts.push(`Family: Couple`);
    if (context.family.partner_citizenship) {
      if (context.family.partner_citizenship.has_dual) {
        parts.push(`Partner citizenship: ${context.family.partner_citizenship.primary} and ${context.family.partner_citizenship.secondary}`);
      } else {
        parts.push(`Partner citizenship: ${context.family.partner_citizenship.primary}`);
      }
    }
  } else {
    parts.push(`Family: Single`);
  }

  if (context.family.has_pets) {
    parts.push(`Has pets: Yes`);
  }

  // Timeline
  parts.push(`Retirement status: ${context.timeline.status}`);
  if (context.timeline.years_until > 0) {
    parts.push(`Years to retirement: ${context.timeline.years_until}`);
  }

  // Budget
  if (context.budget.total_monthly) {
    parts.push(`Monthly budget: $${context.budget.total_monthly.toLocaleString()}`);
  }

  // Geographic preferences
  if (context.geography.countries.length > 0) {
    parts.push(`Preferred countries: ${context.geography.countries.join(', ')}`);
  }

  // Climate
  if (context.climate.summer_temp) {
    parts.push(`Climate preference: ${context.climate.summer_temp} summers, ${context.climate.winter_temp} winters`);
  }

  // Healthcare
  if (context.administration.healthcare_concerns.length > 0) {
    parts.push(`Healthcare concerns: ${context.administration.healthcare_concerns.join(', ')}`);
  }

  // Languages
  if (context.culture.languages_spoken.length > 0) {
    parts.push(`Languages: ${context.culture.languages_spoken.join(', ')}`);
  }

  // Favorite towns
  if (context.favorites && context.favorites.length > 0) {
    const favoriteTowns = context.favorites.slice(0, 3).map(f => `${f.town_name}, ${f.country}`).join('; ');
    parts.push(`Favorite towns: ${favoriteTowns}${context.favorites.length > 3 ? ` and ${context.favorites.length - 3} more` : ''}`);
  }

  return parts.join('\\n');
}