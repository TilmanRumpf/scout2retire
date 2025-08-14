import supabase from './supabaseClient';

// Fetch all hobbies from database
export async function getAllHobbies() {
  try {
    const { data, error } = await supabase
      .from('hobbies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Group hobbies by category
    const grouped = {
      activities: data.filter(h => h.category === 'activity'),
      interests: data.filter(h => h.category === 'interest'),
      custom: data.filter(h => h.category === 'custom')
    };
    
    return { success: true, data: grouped };
  } catch (error) {
    console.error('Error fetching hobbies:', error);
    return { success: false, error };
  }
}

// Save user's hobby selections
export async function saveUserHobbies(userId, hobbyIds) {
  try {
    // First, delete existing user hobbies
    const { error: deleteError } = await supabase
      .from('user_hobbies')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new selections
    if (hobbyIds.length > 0) {
      const userHobbies = hobbyIds.map(hobbyId => ({
        user_id: userId,
        hobby_id: hobbyId
      }));
      
      const { error: insertError } = await supabase
        .from('user_hobbies')
        .insert(userHobbies);
      
      if (insertError) throw insertError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving user hobbies:', error);
    return { success: false, error };
  }
}

// Get user's selected hobbies
export async function getUserHobbies(userId) {
  try {
    const { data, error } = await supabase
      .from('user_hobbies')
      .select('hobby:hobbies(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const hobbies = data.map(item => item.hobby);
    
    return { success: true, data: hobbies };
  } catch (error) {
    console.error('Error fetching user hobbies:', error);
    return { success: false, error };
  }
}

// Get hobbies by IDs (for backward compatibility)
export async function getHobbiesByNames(names) {
  try {
    const { data, error } = await supabase
      .from('hobbies')
      .select('*')
      .in('name', names);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching hobbies by names:', error);
    return { success: false, error };
  }
}

// Map old activity/interest IDs to hobby names
export const activityMapping = {
  'walking': 'Walking',
  'swimming': 'Swimming',
  'cycling': 'Cycling',
  'golf': 'Golf',
  'tennis': 'Tennis',
  'water_sports': 'Water Sports',
  'winter_sports': 'Winter Sports',
  'fishing': 'Fishing',
  'gardening': 'Gardening'
};

export const interestMapping = {
  'arts': 'Arts & Crafts',
  'music': 'Music',
  'theater': 'Theater',
  'reading': 'Reading',
  'cooking': 'Cooking',
  'wine': 'Wine',
  'history': 'History',
  'photography': 'Photography',
  'volunteering': 'Volunteering'
};