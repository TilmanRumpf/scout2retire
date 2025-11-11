import supabase from '../supabaseClient';
import { updatePreferenceHash } from '../preferenceUtils';

/**
 * Saves user preferences from onboarding to the new structured table
 * This replaces the messy onboarding_responses approach
 */
export const saveUserPreferences = async (userId, stepName, stepData) => {
  console.log(`Saving ${stepName} for user ${userId}`);
  console.log('Step data received:', stepData);
  
  // Check current auth session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', session ? `User: ${session.user.id}` : 'No session');
  console.log('Session matches userId?', session?.user?.id === userId);
  if (sessionError) {
    console.error('Session error:', sessionError);
  }
  
  try {
    // Check if user already has preferences record
    const { data: existingRecords, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId);
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing preferences:', checkError);
      return { success: false, error: checkError };
    }
    
    const existing = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
    console.log('Found existing record?', !!existing, 'for user:', userId);
    
    // For costs step, ensure mobility is properly formatted as JSON
    let dataToSave = { ...stepData };
    if (stepName === 'costs' && stepData.mobility) {
      // Ensure mobility is saved with proper array structure
      dataToSave.mobility = {
        local: Array.isArray(stepData.mobility.local) ? stepData.mobility.local : [],
        regional: Array.isArray(stepData.mobility.regional) ? stepData.mobility.regional : [],
        international: Array.isArray(stepData.mobility.international) ? stepData.mobility.international : []
      };
      console.log('Mobility data being saved to user_preferences:', dataToSave.mobility);
    }
    
    // For region_preferences step, ensure mobility is properly formatted as JSON
    if (stepName === 'region_preferences' && stepData.mobility) {
      // Ensure mobility is saved with proper array structure
      dataToSave.mobility = {
        local: Array.isArray(stepData.mobility.local) ? stepData.mobility.local : [],
        regional: Array.isArray(stepData.mobility.regional) ? stepData.mobility.regional : [],
        international: Array.isArray(stepData.mobility.international) ? stepData.mobility.international : []
      };
      console.log('Region page: Mobility data being saved to user_preferences:', dataToSave.mobility);
    }
    
    // For hobbies step, ensure arrays are properly formatted
    if (stepName === 'hobbies') {
      console.log('Hobbies step - ensuring arrays are properly formatted');
      dataToSave = {
        activities: Array.isArray(stepData.activities) ? stepData.activities : [],
        interests: Array.isArray(stepData.interests) ? stepData.interests : [],
        custom_physical: Array.isArray(stepData.custom_physical) ? stepData.custom_physical : [],
        custom_hobbies: Array.isArray(stepData.custom_hobbies) ? stepData.custom_hobbies : [],
        // CRITICAL: Save compound button IDs for UI reconstruction
        custom_activities: Array.isArray(stepData.custom_activities) ? stepData.custom_activities : [],
        travel_frequency: stepData.travel_frequency || null
      };
      console.log('Hobbies data being saved:', dataToSave);
      console.log('Compound buttons (custom_activities):', dataToSave.custom_activities);
    }
    
    let result;
    
    if (existing) {
      // Update existing record - only update the specific fields for this step
      const updateData = {
        ...dataToSave,
        updated_at: new Date().toISOString()
      };
      console.log('Updating user_preferences with:', updateData);
      console.log('For user ID:', userId);
      console.log('Existing record ID:', existing.id);
      
      // First, try the update (may not return data due to RLS)
      const updateResult = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', userId);
      
      console.log('Update query executed');
      console.log('Update error (if any):', updateResult?.error);
      
      // Check for errors first
      if (updateResult.error) {
        console.error('Update failed with error:', updateResult.error);
        result = updateResult;
      } else {
        // Since RLS might block returning data, manually verify the update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (verifyError) {
          console.error('Could not verify update:', verifyError);
          result = { data: null, error: verifyError };
        } else {
          console.log('✅ Update verified - data was saved');
          console.log('Verified activities:', verifyData.activities);
          result = { data: [verifyData], error: null };
        }
      }
    } else {
      // Create new record
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...dataToSave
        })
        .select();
    }
    
    if (result.error) {
      console.error('Error saving preferences:', result.error);
      return { success: false, error: result.error };
    }
    
    if (!result.data || result.data.length === 0) {
      console.error('No data returned from update/insert - likely a permissions issue or the update didn\'t match any rows');
      return { success: false, error: 'Update failed - no rows affected' };
    }

    console.log('Successfully saved preferences, returned data:', result.data[0]);

    // Update preference hash for cache invalidation
    // This ensures cached scores are automatically invalidated when preferences change
    try {
      const savedData = result.data[0];
      const hashResult = await updatePreferenceHash(userId, savedData);
      if (hashResult.success) {
        console.log(`✅ Preference hash updated: ${hashResult.hash} for step: ${stepName}`);
      } else {
        console.warn(`⚠️  Could not update preference hash (non-critical):`, hashResult.error);
      }
    } catch (hashError) {
      // Non-critical error - don't fail the save
      console.warn('⚠️  Preference hash update failed (non-critical):', hashError);
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