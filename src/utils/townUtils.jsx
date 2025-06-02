import supabase from './supabaseClient';

// Town management
export const fetchTowns = async (filters = {}) => {
  try {
    let query = supabase
      .from('towns')
      .select('*');

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

    // Debug the fetched data
    console.log('Fetched towns:', data?.length || 0, 'towns');
    if (data && data.length > 0) {
      console.log('Sample town ID:', data[0].id, 'Type:', typeof data[0].id);
    }

    return { success: true, towns: data };
  } catch (error) {
    console.error("Unexpected error fetching towns:", error);
    return { success: false, error };
  }
};

export const toggleFavorite = async (userId, townId) => {
  try {
    // Enhanced debugging
    console.log('=== TOGGLE FAVORITE DEBUG ===');
    console.log('User ID:', userId, 'Type:', typeof userId);
    console.log('Town ID:', townId, 'Type:', typeof townId);
    console.log('Town ID length:', townId ? townId.length : 'null');
    console.log('Is valid UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(townId));
    
    // Only normalize town ID, NOT user ID
    const normalizedTownId = String(townId).toLowerCase().trim();
    const userIdString = String(userId).trim(); // Keep original case for user ID
    console.log('Normalized Town ID:', normalizedTownId);
    console.log('User ID (original case):', userIdString);
    
    // Check if town is already favorited - use maybeSingle() instead of single()
    console.log("Checking if town is already favorited...");
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userIdString)
      .eq('town_id', normalizedTownId)
      .maybeSingle(); // This won't throw an error if 0 rows are found

    if (checkError) {
      console.error("Error checking favorite status:", checkError);
      console.error("Error details:", checkError.details, checkError.hint);
      return { success: false, error: checkError };
    }

    console.log('Existing favorite:', existingFavorite);

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
      return { success: true, action: 'removed' };
    }

    // Otherwise, add as favorite
    console.log('Adding favorite...');
    const { error: addError } = await supabase
      .from('favorites')
      .insert([{
        user_id: userIdString,
        town_id: normalizedTownId,
        created_at: new Date().toISOString()
      }]);

    if (addError) {
      console.error("Error adding favorite:", addError);
      console.error("Insert error details:", addError.details, addError.hint);
      return { success: false, error: addError };
    }

    console.log('Favorite added successfully');
    return { success: true, action: 'added' };
  } catch (error) {
    console.error("Unexpected error toggling favorite:", error);
    return { success: false, error };
  }
};

export const fetchFavorites = async (userId) => {
  try {
    console.log('=== FETCH FAVORITES DEBUG ===');
    console.log('Fetching favorites for user:', userId);
    
    // DO NOT normalize user ID - keep it as is
    const userIdString = String(userId).trim();
    console.log('User ID (original case):', userIdString);
    
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

    console.log('Fetched favorites:', data?.length || 0, 'favorites');
    if (data && data.length > 0) {
      console.log('Favorite town IDs:', data.map(f => f.town_id));
      console.log('Sample favorite structure:', data[0]);
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
    console.log('=== GET TOWN OF THE DAY DEBUG ===');
    console.log("Getting town of the day for user:", userId);
    
    // DO NOT normalize user ID
    const userIdString = String(userId).trim();
    
    // First get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userIdString)
      .maybeSingle(); // Changed to maybeSingle() to handle no preferences case

    if (prefError) {
      console.error("Error fetching user preferences:", prefError);
      return { success: false, error: prefError };
    }

    console.log('User preferences found:', !!preferences);

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
    console.log("Excluding favorite town IDs:", favoriteTownIds);

    // Get a random town not in favorites
    let query = supabase
      .from('towns')
      .select('*');

    // Exclude favorited towns
    if (favoriteTownIds.length > 0) {
      query = query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
    }

    // Apply basic filtering based on preferences if available
    if (preferences && preferences.budget && preferences.budget.monthly_budget) {
      console.log('Applying budget filter:', preferences.budget.monthly_budget);
      query = query.lte('cost_index', preferences.budget.monthly_budget);
    }

    // Get towns and randomize
    const { data: towns, error: townError } = await query;

    if (townError) {
      console.error("Error fetching towns for daily selection:", townError);
      return { success: false, error: townError };
    }

    if (!towns || towns.length === 0) {
      console.log("No towns available for daily selection");
      return { success: false, error: { message: "No towns available" } };
    }

    // Randomly select one town
    const randomIndex = Math.floor(Math.random() * towns.length);
    const selectedTown = towns[randomIndex];

    console.log("Town of the day selected:", {
      id: selectedTown.id,
      name: selectedTown.name,
      country: selectedTown.country,
      cost: selectedTown.cost_index
    });

    return { success: true, town: selectedTown };
  } catch (error) {
    console.error("Unexpected error getting town of the day:", error);
    return { success: false, error };
  }
};