import supabase from './supabaseClient';
import { logTownActivity } from './journalUtils';
import { getPersonalizedTowns } from './matchingAlgorithm'; // NEW: Added import

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

    // EXISTING: Your original logic unchanged
    // SELECT only needed columns for performance
    const selectColumns = `
      id, name, state_name, state_code, country, population,
      image_url_1, image_url_2, image_url_3, image_url_4,
      latitude, longitude, description, townHighlights
    `;
    let query = supabase
      .from('towns')
      .select(selectColumns);

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

// Get town of the day based on user preferences
export const getTownOfTheDay = async (userId) => {
  try {
    
    // DO NOT normalize user ID
    const userIdString = String(userId).trim();
    
    // First get user preferences using the proper utility
    const { getOnboardingProgress } = await import('./onboardingUtils');
    const { success: onboardingSuccess, data: preferences } = await getOnboardingProgress(userId);
    
    if (!onboardingSuccess || !preferences) {
      console.log("No onboarding preferences found for daily town");
      // Continue without preferences - town will be selected without personalization
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

    // Extract favorite town IDs
    const favoriteTownIds = favorites ? favorites.map(fav => fav.town_id) : [];

    // Get a random town not in favorites
    // SELECT only needed columns for performance
    const selectColumnsRandom = `
      id, name, state_name, state_code, country, population,
      image_url_1, image_url_2, image_url_3, image_url_4,
      latitude, longitude, description, townHighlights
    `;
    let query = supabase
      .from('towns')
      .select(selectColumnsRandom);

    // Filter for towns with photos (quality control) - CRITICAL SAFETY FEATURE
    query = query
      .not('image_url_1', 'is', null)
      .not('image_url_1', 'eq', '')
      .not('image_url_1', 'ilike', 'NULL')  // Filter out 'NULL' string
      .not('image_url_1', 'eq', 'null');   // Filter out lowercase 'null' string

    // Exclude favorited towns
    if (favoriteTownIds.length > 0) {
      query = query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
    }

    // Apply basic filtering based on preferences if available
    if (preferences && preferences.budget && preferences.budget.monthly_budget) {
      query = query.lte('cost_index', preferences.budget.monthly_budget);
    }

    // Get towns and randomize
    const { data: towns, error: townError } = await query;

    if (townError) {
      console.error("Error fetching towns for daily selection:", townError);
      return { success: false, error: townError };
    }

    if (!towns || towns.length === 0) {
      return { success: false, error: { message: "No towns available" } };
    }

    // Randomly select one town
    const randomIndex = Math.floor(Math.random() * towns.length);
    let selectedTown = towns[randomIndex];

    // If we have preferences, enhance the town with match scores
    if (preferences) {
      try {
        // Use unified scoring function
        const { scoreTown } = await import('./unifiedScoring');
        
        // Score the town using unified function
        selectedTown = await scoreTown(selectedTown, preferences);
        
        console.log("Enhanced daily town with scores:", {
          name: selectedTown.name,
          matchScore: selectedTown.matchScore,
          categoryScores: selectedTown.categoryScores
        });
      } catch (error) {
        console.error("Error calculating match scores for daily town:", error);
        // Continue without scores if calculation fails
      }
    }

    return { success: true, town: selectedTown };
  } catch (error) {
    console.error("Unexpected error getting town of the day:", error);
    return { success: false, error };
  }
};

// Log town view activity
export const logTownView = async (userId, townId, townName, townCountry) => {
  try {
    const userIdString = String(userId).trim();
    const normalizedTownId = String(townId).toLowerCase().trim();
    
    await logTownActivity(userIdString, normalizedTownId, 'viewed', townName, townCountry);
  } catch (error) {
    console.error("Error logging town view:", error);
    // Don't return error as this is non-critical
  }
};