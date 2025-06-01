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
    
    // Handle townIds filter differently - this is the key fix
    if (filters.townIds && filters.townIds.length > 0) {
      // Check if we're dealing with actual UUIDs or simple numeric IDs
      const isUuid = (id) => {
        return typeof id === 'string' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      };
      
      // If these are not UUIDs, we need to query by a different field
      const firstId = filters.townIds[0];
      
      if (isUuid(firstId)) {
        // If it's a UUID, use the in filter with the id field
        query = query.in('id', filters.townIds);
      } else {
        // If it's not a UUID (e.g. simple numeric ID), try to query by name or another field
        console.log("Not a UUID, using alternative query method");
        
        // Option 1: If you have a numeric ID column separate from the UUID
        // query = query.in('numeric_id', filters.townIds);
        
        // Option 2: Get all towns when ID format is invalid (temporary solution)
        query = query.limit(filters.townIds.length > 0 ? 10 : filters.limit || 10);
      }
    }

    // Add pagination
    if (filters.limit && !filters.townIds) {
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

    return { success: true, towns: data };
  } catch (error) {
    console.error("Unexpected error fetching towns:", error);
    return { success: false, error };
  }
};

export const toggleFavorite = async (userId, townId) => {
  try {
    // Check if town is already favorited
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('town_id', townId)
      .single();

    if (checkError && !checkError.message.includes('No rows found')) {
      console.error("Error checking favorite status:", checkError);
      return { success: false, error: checkError };
    }

    // If already favorited, remove it
    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('town_id', townId);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        return { success: false, error: deleteError };
      }

      return { success: true, action: 'removed' };
    }

    // Otherwise, add as favorite
    const { error: addError } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        town_id: townId,
        created_at: new Date().toISOString()
      }]);

    if (addError) {
      console.error("Error adding favorite:", addError);
      return { success: false, error: addError };
    }

    return { success: true, action: 'added' };
  } catch (error) {
    console.error("Unexpected error toggling favorite:", error);
    return { success: false, error };
  }
};

export const fetchFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        towns:town_id(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching favorites:", error);
      return { success: false, error };
    }

    return { success: true, favorites: data };
  } catch (error) {
    console.error("Unexpected error fetching favorites:", error);
    return { success: false, error };
  }
};

// Get town of the day based on user preferences
export const getTownOfTheDay = async (userId) => {
  try {
    // First get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError) {
      console.error("Error fetching user preferences:", prefError);
      return { success: false, error: prefError };
    }

    // Simple algorithm: get a random town that hasn't been liked yet
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('town_id')
      .eq('user_id', userId);

    if (favError) {
      console.error("Error fetching favorites:", favError);
      return { success: false, error: favError };
    }

    // Extract favorite town IDs
    const favoriteTownIds = favorites.map(fav => fav.town_id);

    // Get a random town not in favorites
    let query = supabase
      .from('towns')
      .select('*');

    if (favoriteTownIds.length > 0) {
      query = query.not('id', 'in', `(${favoriteTownIds.join(',')})`);
    }

    // Apply basic filtering based on preferences if available
    if (preferences) {
      if (preferences.budget && preferences.budget.monthly_budget) {
        query = query.lte('cost_index', preferences.budget.monthly_budget);
      }
      // More filters can be added based on preferences
    }

    // Get just one random town
    query = query.limit(1).order('id', { ascending: false });

    const { data: town, error: townError } = await query;

    if (townError) {
      console.error("Error fetching town of the day:", townError);
      return { success: false, error: townError };
    }

    return { success: true, town: town[0] };
  } catch (error) {
    console.error("Unexpected error getting town of the day:", error);
    return { success: false, error };
  }
};