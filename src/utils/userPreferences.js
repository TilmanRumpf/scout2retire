import supabase from './supabaseClient';

/**
 * Saves user preferences from onboarding to the new structured table
 * This replaces the messy onboarding_responses approach
 */
export const saveUserPreferences = async (userId, stepName, stepData) => {
  console.log(`Saving ${stepName} for user ${userId}`);
  
  try {
    // Check if user already has preferences record
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existing) {
      // Update existing record
      result = await supabase
        .from('user_preferences')
        .update({
          ...stepData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();
    } else {
      // Create new record
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...stepData
        })
        .select();
    }
    
    if (result.error) {
      console.error('Error saving preferences:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data[0] };
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};

/**
 * Retrieves user preferences
 */
export const getUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching preferences:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};