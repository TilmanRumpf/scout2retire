import supabase from './supabaseClient';
import { logTownActivity } from './journalUtils';
import { getPersonalizedTowns } from './scoring'; // NEW: Added import

// SINGLE SOURCE OF TRUTH FOR TOWN COLUMNS - NEVER DUPLICATE!
// This caused the 3-hour climate scoring disaster when duplicated
const TOWN_SELECT_COLUMNS = `
  id, name, country, population, region, geo_region, regions,
  image_url_1, image_url_2, image_url_3,
  latitude, longitude, description,
  cost_of_living_usd, typical_monthly_living_cost, cost_index,
  healthcare_score, safety_score, healthcare_cost_monthly,
  avg_temp_summer, avg_temp_winter, climate, climate_description,
  summer_climate_actual, winter_climate_actual,
  sunshine_hours, sunshine_level_actual, annual_rainfall,
  humidity_average, humidity_level_actual, seasonal_variation_actual,
  precipitation_level_actual,
  air_quality_index, elevation_meters, distance_to_ocean_km,
  airport_distance, nearest_airport, english_proficiency_level,
  walkability, expat_community_size,
  geographic_features, geographic_features_actual, vegetation_type_actual,
  urban_rural_character, pace_of_life_actual,
  primary_language, cultural_events_rating, nightlife_rating,
  restaurants_rating, museums_rating, shopping_rating,
  cultural_landmark_1, social_atmosphere,
  outdoor_rating, outdoor_activities_rating, beaches_nearby,
  top_hobbies,
  golf_courses_count, hiking_trails_km, tennis_courts_count,
  marinas_count, ski_resorts_within_100km, dog_parks_count,
  farmers_markets, water_bodies, activities_available,
  hospital_count, nearest_major_hospital_km, english_speaking_doctors,
  visa_requirements, visa_on_arrival_countries, retirement_visa_available,
  digital_nomad_visa, crime_rate, natural_disaster_risk, internet_speed,
  rent_1bed, rent_2bed_usd, groceries_cost, meal_cost, utilities_cost,
  income_tax_rate_pct, sales_tax_rate_pct, property_tax_rate_pct,
  tax_haven_status, foreign_income_taxed
`;

// Town management
export const fetchTowns = async (filters = {}) => {
  
  try {
    // NEW: Check if personalization is requested
    if (filters.userId && filters.usePersonalization !== false) {
      
      try {
        const personalizedResult = await getPersonalizedTowns(filters.userId, {
          limit: filters.limit || 500,  // Show ALL towns with photos (not just 20!)
          offset: filters.offset || 0,
          townIds: filters.townIds  // FIXED: Pass townIds to personalization
        });
        
        if (personalizedResult.success) {
          return {
            success: true,
            towns: personalizedResult.towns,
            isPersonalized: true,
            userPreferences: personalizedResult.userPreferences
          };
        } else {
          // Fall through to original logic
        }
      } catch (personalizationError) {
        console.error('Personalization error, falling back:', personalizationError);
        // Fall through to original logic
      }
    }

    // Use the single source of truth - NO DUPLICATES!
    let query = supabase
      .from('towns')
      .select(TOWN_SELECT_COLUMNS);

    // Filter for towns with photos (quality control)
    query = query
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '')
      .not('image_url_1', 'ilike', 'NULL')  // Filter out 'NULL' string
      .not('image_url_1', 'eq', 'null');   // Filter out lowercase 'null' string

    // Apply filters if provided
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    
    if (filters.maxCost) {
      query = query.lte('cost_index', filters.maxCost);
    }
    
    if (filters.minHealthcare) {
      query = query.gte('healthcare_score', filters.minHealthcare);
    }

    // Handle specific town IDs if provided
    if (filters.townIds && Array.isArray(filters.townIds) && filters.townIds.length > 0) {
      // Normalize town IDs to ensure consistency
      const normalizedIds = filters.townIds.map(id => String(id).toLowerCase().trim());
      query = query.in('id', normalizedIds);
    }

    // Add pagination if specified
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching towns:", error);
      return { success: false, error };
    }

    // Data fetched successfully

    return { 
      success: true, 
      towns: data, 
      isPersonalized: false  // NEW: Flag to indicate this is not personalized
    };
  } catch (error) {
    console.error("Unexpected error fetching towns:", error);
    return { success: false, error };
  }
};

export const toggleFavorite = async (userId, townId, townName = null, townCountry = null) => {
  try {
    // Only normalize town ID, NOT user ID
    const normalizedTownId = String(townId).toLowerCase().trim();
    const userIdString = String(userId).trim(); // Keep original case for user ID
    
    // Check if town is already favorited - use maybeSingle() instead of single()
    console.log("Checking if town is already favorited...");
    console.log("User ID:", userIdString);
    console.log("Town ID:", normalizedTownId);
    
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userIdString)
      .eq('town_id', normalizedTownId)
      .maybeSingle(); // This won't throw an error if 0 rows are found

    if (checkError) {
      console.error("Error checking favorite status:", checkError);
      console.error("Error details:", checkError.details, checkError.hint);
      console.error("User ID causing error:", userIdString);
      
      // If it's a foreign key error, provide helpful message
      if (checkError.message?.includes('foreign key constraint')) {
        return { 
          success: false, 
          error: { 
            ...checkError, 
            message: "Database configuration error. Please contact support." 
          } 
        };
      }
      return { success: false, error: checkError };
    }

    console.log('Existing favorite:', existingFavorite);

    // If we don't have town name/country, fetch it for journal logging
    if (!townName || !townCountry) {
      const { data: townData, error: townError } = await supabase
        .from('towns')
        .select('name, country')
        .eq('id', normalizedTownId)
        .maybeSingle();

      if (!townError && townData) {
        townName = townData.name;
        townCountry = townData.country;
        console.log('Fetched town details for journal:', townName, townCountry);
      }
    }

    // If already favorited, remove it
    if (existingFavorite) {
      console.log('Removing favorite...');
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userIdString)
        .eq('town_id', normalizedTownId);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        console.error("Delete error details:", deleteError.details, deleteError.hint);
        return { success: false, error: deleteError };
      }

      console.log('Favorite removed successfully');

      // Mark the town's chat thread as read (to clear any unread badges)
      try {
        const { data: townThread } = await supabase
          .from('chat_threads')
          .select('id')
          .eq('town_id', normalizedTownId)
          .maybeSingle();

        if (townThread) {
          await supabase.rpc('mark_thread_read', { p_thread_id: townThread.id });
          console.log('Marked town thread as read on unfavorite');
        }
      } catch (markReadError) {
        console.error('Error marking thread as read on unfavorite:', markReadError);
        // Don't fail the unfavorite action if this fails
      }

      // Log the unlike activity to journal
      if (townName && townCountry) {
        console.log('Logging unlike activity to journal...');
        await logTownActivity(userIdString, normalizedTownId, 'unliked', townName, townCountry);
      }

      return { success: true, action: 'removed' };
    }

    // Otherwise, add as favorite
    // Make sure we have town name and country for the insert
    if (!townName || !townCountry) {
      const { data: townData, error: townError } = await supabase
        .from('towns')
        .select('name, country')
        .eq('id', normalizedTownId)
        .single();

      if (townError || !townData) {
        console.error("Error fetching town details:", townError);
        return { success: false, error: { message: "Could not fetch town details" } };
      }
      
      townName = townData.name;
      townCountry = townData.country;
    }
    
    const { error: addError } = await supabase
      .from('favorites')
      .insert([{
        user_id: userIdString,
        town_id: normalizedTownId,
        town_name: townName,
        town_country: townCountry,
        created_at: new Date().toISOString()
      }]);

    if (addError) {
      console.error("Error adding favorite:", addError);
      console.error("Insert error details:", addError.details, addError.hint);
      console.error("Insert data:", { userIdString, normalizedTownId, townName, townCountry });
      
      // If it's a foreign key error, provide helpful message
      if (addError.message?.includes('foreign key constraint')) {
        return { 
          success: false, 
          error: { 
            ...addError, 
            message: "Database configuration error. Please run the fix_favorites_issue_now.sql script in Supabase." 
          } 
        };
      }
      return { success: false, error: addError };
    }
    
    // Log the like activity to journal
    if (townName && townCountry) {
      await logTownActivity(userIdString, normalizedTownId, 'liked', townName, townCountry);
    }
    
    return { success: true, action: 'added' };
  } catch (error) {
    console.error("Unexpected error toggling favorite:", error);
    return { success: false, error };
  }
};

export const fetchFavorites = async (userId, component = 'unknown') => {
  // Log API call for tracking
  
  try {
    // DO NOT normalize user ID - keep it as is
    const userIdString = String(userId).trim();
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        towns:town_id(*)
      `)
      .eq('user_id', userIdString);

    if (error) {
      console.error("Error fetching favorites:", error);
      console.error("Error details:", error.details, error.hint);
      return { success: false, error };
    }


    return { success: true, favorites: data || [] };
  } catch (error) {
    console.error("Unexpected error fetching favorites:", error);
    return { success: false, error };
  }
};

// Define geographic neighbor relationships for smart daily town selection
const COUNTRY_NEIGHBORS = {
  'Spain': ['Portugal', 'France', 'Italy', 'Morocco', 'Malta'],
  'Portugal': ['Spain', 'France', 'Morocco'],
  'France': ['Spain', 'Italy', 'Switzerland', 'Belgium', 'Germany', 'United Kingdom', 'Monaco'],
  'Italy': ['France', 'Switzerland', 'Austria', 'Slovenia', 'Croatia', 'Greece', 'Malta'],
  'Greece': ['Italy', 'Turkey', 'Bulgaria', 'Albania', 'Cyprus'],
  'Netherlands': ['Belgium', 'Germany', 'United Kingdom', 'Denmark'],
  'Germany': ['Netherlands', 'Belgium', 'France', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Denmark'],
  'United States': ['Canada', 'Mexico'],
  'Canada': ['United States'],
  'Mexico': ['United States', 'Guatemala', 'Belize'],
  'United Kingdom': ['Ireland', 'France', 'Netherlands', 'Belgium'],
  'Ireland': ['United Kingdom'],
  'Belgium': ['Netherlands', 'Germany', 'France', 'Luxembourg'],
  'Switzerland': ['France', 'Italy', 'Austria', 'Germany'],
  'Austria': ['Germany', 'Switzerland', 'Italy', 'Slovenia', 'Czech Republic', 'Hungary'],
  'Australia': ['New Zealand'],
  'New Zealand': ['Australia']
};

// Define regional groups for expanded neighbor matching
const REGION_GROUPS = {
  'Mediterranean': ['Spain', 'France', 'Italy', 'Greece', 'Croatia', 'Turkey', 'Cyprus', 'Malta', 'Portugal', 'Morocco', 'Tunisia', 'Egypt'],
  'Nordic': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
  'Central Europe': ['Germany', 'Austria', 'Switzerland', 'Czech Republic', 'Poland', 'Hungary', 'Slovakia'],
  'Balkans': ['Croatia', 'Slovenia', 'Serbia', 'Albania', 'Greece', 'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Bulgaria'],
  'Iberian': ['Spain', 'Portugal'],
  'British Isles': ['United Kingdom', 'Ireland'],
  'Benelux': ['Netherlands', 'Belgium', 'Luxembourg'],
  'Caribbean': ['Barbados', 'Jamaica', 'Bahamas', 'Trinidad and Tobago', 'Dominican Republic'],
  'South America': ['Argentina', 'Chile', 'Uruguay', 'Brazil', 'Peru', 'Colombia', 'Ecuador', 'Bolivia', 'Paraguay', 'Venezuela']
};

// Define continent mappings for fallback
const CONTINENT_MAPPING = {
  'Europe': ['Spain', 'France', 'Italy', 'Greece', 'Portugal', 'Germany', 'Netherlands', 'Belgium', 'United Kingdom', 'Ireland', 'Switzerland', 'Austria', 'Poland', 'Czech Republic', 'Hungary', 'Croatia', 'Slovenia', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Malta', 'Cyprus', 'Bulgaria', 'Romania', 'Serbia', 'Albania', 'Montenegro', 'North Macedonia', 'Bosnia and Herzegovina', 'Slovakia', 'Latvia', 'Estonia', 'Lithuania', 'Monaco', 'Luxembourg'],
  'North America': ['United States', 'Canada', 'Mexico'],
  'South America': ['Argentina', 'Brazil', 'Chile', 'Peru', 'Colombia', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Venezuela'],
  'Asia': ['Japan', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'India', 'China', 'South Korea'],
  'Oceania': ['Australia', 'New Zealand', 'Fiji'],
  'Africa': ['Morocco', 'Tunisia', 'Egypt', 'South Africa', 'Kenya']
};

// Get town of the day with SMART geographic relevance
export const getTownOfTheDay = async (userId) => {
  try {
    // DO NOT normalize user ID
    const userIdString = String(userId).trim();
    
    // First get user preferences using the proper utility
    const { getOnboardingProgress } = await import('./userpreferences/onboardingUtils');
    const { success: onboardingSuccess, data: preferences } = await getOnboardingProgress(userId);
    
    if (!onboardingSuccess || !preferences) {
      console.log("No onboarding preferences found for daily town");
    }

    // Get existing favorites to exclude them
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('town_id')
      .eq('user_id', userIdString);

    if (favError) {
      console.error("Error fetching favorites for exclusion:", favError);
      return { success: false, error: favError };
    }

    const favoriteTownIds = favorites ? favorites.map(fav => fav.town_id) : [];

    // Extract user's geographic preferences
    const userCountries = preferences?.region_preferences?.countries || preferences?.region?.countries || [];
    const userRegions = preferences?.region_preferences?.regions || preferences?.region?.regions || [];
    
    // Build neighbor countries list based on user preferences
    let neighborCountries = new Set();
    
    // Add direct neighbors of selected countries
    userCountries.forEach(country => {
      const neighbors = COUNTRY_NEIGHBORS[country] || [];
      neighbors.forEach(n => neighborCountries.add(n));
    });
    
    // Add countries from same regional groups
    userRegions.forEach(region => {
      // Check if user selected a known region group
      Object.keys(REGION_GROUPS).forEach(groupName => {
        if (region.toLowerCase().includes(groupName.toLowerCase()) || groupName.toLowerCase().includes(region.toLowerCase())) {
          REGION_GROUPS[groupName].forEach(c => neighborCountries.add(c));
        }
      });
    });
    
    // Special handling for Mediterranean - include ALL Spanish towns if Mediterranean selected
    if (userRegions.some(r => r.toLowerCase().includes('mediterranean'))) {
      neighborCountries.add('Spain');
      neighborCountries.add('Portugal'); // Portugal is culturally similar to Mediterranean
    }
    
    // Build continent list for user's countries
    let userContinents = new Set();
    userCountries.forEach(country => {
      Object.entries(CONTINENT_MAPPING).forEach(([continent, countries]) => {
        if (countries.includes(country)) {
          userContinents.add(continent);
        }
      });
    });
    
    // Use the single source of truth - NO MORE DUPLICATES!
    
    // TIER 1: Exact match - user's selected countries
    if (userCountries.length > 0) {
      let tier1Query = supabase
        .from('towns')
        .select(TOWN_SELECT_COLUMNS)
        .in('country', userCountries)
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '');
      
      if (favoriteTownIds.length > 0) {
        tier1Query = tier1Query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
      }
      
      const { data: tier1Towns } = await tier1Query;
      
      if (tier1Towns && tier1Towns.length > 0) {
        console.log(`Daily town: Found ${tier1Towns.length} towns in Tier 1 (exact country match)`);
        const randomIndex = Math.floor(Math.random() * tier1Towns.length);
        let selectedTown = tier1Towns[randomIndex];
        
        // Enhance with scores and return
        if (preferences) {
          try {
            const { scoreTown } = await import('./scoring/unifiedScoring');
            selectedTown = await scoreTown(selectedTown, preferences);
          } catch (error) {
            console.error("Error calculating match scores:", error);
          }
        }
        return { success: true, town: selectedTown };
      }
    }
    
    // TIER 2: Neighbor countries
    if (neighborCountries.size > 0) {
      let tier2Query = supabase
        .from('towns')
        .select(TOWN_SELECT_COLUMNS)
        .in('country', Array.from(neighborCountries))
        .not('image_url_1', 'is', null)
        .not('image_url_1', 'eq', '');
      
      if (favoriteTownIds.length > 0) {
        tier2Query = tier2Query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
      }
      
      const { data: tier2Towns } = await tier2Query;
      
      if (tier2Towns && tier2Towns.length > 0) {
        console.log(`Daily town: Found ${tier2Towns.length} towns in Tier 2 (neighbor countries)`);
        const randomIndex = Math.floor(Math.random() * tier2Towns.length);
        let selectedTown = tier2Towns[randomIndex];
        
        // Enhance with scores and return
        if (preferences) {
          try {
            const { scoreTown } = await import('./scoring/unifiedScoring');
            selectedTown = await scoreTown(selectedTown, preferences);
          } catch (error) {
            console.error("Error calculating match scores:", error);
          }
        }
        return { success: true, town: selectedTown };
      }
    }
    
    // TIER 3: Same continent
    if (userContinents.size > 0) {
      // Get all countries in user's continents
      let continentCountries = new Set();
      userContinents.forEach(continent => {
        const countries = CONTINENT_MAPPING[continent] || [];
        countries.forEach(c => continentCountries.add(c));
      });
      
      if (continentCountries.size > 0) {
        let tier3Query = supabase
          .from('towns')
          .select(TOWN_SELECT_COLUMNS)
          .in('country', Array.from(continentCountries))
          .not('image_url_1', 'is', null)
          .not('image_url_1', 'eq', '');
        
        if (favoriteTownIds.length > 0) {
          tier3Query = tier3Query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
        }
        
        const { data: tier3Towns } = await tier3Query;
        
        if (tier3Towns && tier3Towns.length > 0) {
          console.log(`Daily town: Found ${tier3Towns.length} towns in Tier 3 (same continent)`);
          const randomIndex = Math.floor(Math.random() * tier3Towns.length);
          let selectedTown = tier3Towns[randomIndex];
          
          // Enhance with scores and return
          if (preferences) {
            try {
              const { scoreTown } = await import('./scoring/unifiedScoring');
              selectedTown = await scoreTown(selectedTown, preferences);
            } catch (error) {
              console.error("Error calculating match scores:", error);
            }
          }
          return { success: true, town: selectedTown };
        }
      }
    }
    
    // TIER 4: Random fallback (any town)
    console.log("Daily town: No geographic matches, falling back to random selection");
    let tier4Query = supabase
      .from('towns')
      .select(TOWN_SELECT_COLUMNS)
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '');
    
    if (favoriteTownIds.length > 0) {
      tier4Query = tier4Query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
    }
    
    const { data: allTowns, error: townError } = await tier4Query;
    
    if (townError) {
      console.error("Error fetching towns for daily selection:", townError);
      return { success: false, error: townError };
    }
    
    if (!allTowns || allTowns.length === 0) {
      return { success: false, error: { message: "No towns available" } };
    }
    
    const randomIndex = Math.floor(Math.random() * allTowns.length);
    let selectedTown = allTowns[randomIndex];
    
    // Enhance with scores and return
    if (preferences) {
      try {
        const { scoreTown } = await import('./scoring/unifiedScoring');
        selectedTown = await scoreTown(selectedTown, preferences);
      } catch (error) {
        console.error("Error calculating match scores:", error);
      }
    }
    
    return { success: true, town: selectedTown };
  } catch (error) {
    console.error("Unexpected error getting town of the day:", error);
    return { success: false, error };
  }
};

// Log town view activity
const logTownView = async (userId, townId, townName, townCountry) => {
  try {
    const userIdString = String(userId).trim();
    const normalizedTownId = String(townId).toLowerCase().trim();
    
    await logTownActivity(userIdString, normalizedTownId, 'viewed', townName, townCountry);
  } catch (error) {
    console.error("Error logging town view:", error);
    // Don't return error as this is non-critical
  }
};