// src/utils/onboardingUtils.js
// Updated to ensure data structure matches exactly what Supabase expects
import supabase from './supabaseClient';

// Transformation function to ensure data matches Supabase format
const transformAdministrationData = (data) => {
  // Create a clean copy with exact structure Supabase expects
  return {
    healthcare_quality: Array.isArray(data.healthcare_quality) ? data.healthcare_quality : [],
    health_considerations: data.health_considerations || {
      healthcare_access: '',
      ongoing_treatment: '',
      environmental_health: ''
    },
    insurance_importance: Array.isArray(data.insurance_importance) ? data.insurance_importance : [],
    safety_importance: Array.isArray(data.safety_importance) ? data.safety_importance : [],
    emergency_services: Array.isArray(data.emergency_services) ? data.emergency_services : [],
    political_stability: Array.isArray(data.political_stability) ? data.political_stability : [],
    tax_preference: Array.isArray(data.tax_preference) ? data.tax_preference : [],
    government_efficiency: Array.isArray(data.government_efficiency) ? data.government_efficiency : [],
    visa_preference: Array.isArray(data.visa_preference) ? data.visa_preference : [],
    stay_duration: Array.isArray(data.stay_duration) ? data.stay_duration : [],
    residency_path: Array.isArray(data.residency_path) ? data.residency_path : []
  };
};

// Onboarding helpers
export const saveOnboardingStep = async (userId, stepData, step) => {
  try {
    console.log(`Saving ${step} step for user ${userId}`);
    console.log('Raw data received:', stepData);
    
    // Transform administration data if needed
    let dataToSave = stepData;
    if (step === 'administration') {
      dataToSave = transformAdministrationData(stepData);
      console.log('Transformed administration data:', dataToSave);
    }
    
    // First check if user already has onboarding data - without using .single()
    const { data, error: fetchError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error("Error checking existing onboarding data:", fetchError);
      return { success: false, error: fetchError };
    }
    
    // Check if there's existing data in the array
    const existingData = data && data.length > 0 ? data[0] : null;
    
    // Prepare the data with the specific step updated
    const newData = {
      user_id: userId,
      ...existingData, // Keep existing data if any
      [step]: dataToSave, // Use transformed data
      submitted_at: new Date().toISOString()
    };
    
    console.log('Final data being sent to Supabase:', JSON.stringify(newData, null, 2));
    
    let response;
    // Insert or update based on whether data exists
    if (existingData) {
      response = await supabase
        .from('onboarding_responses')
        .update(newData)
        .eq('user_id', userId);
    } else {
      response = await supabase
        .from('onboarding_responses')
        .insert([newData]);
    }
    
    if (response.error) {
      console.error(`Error saving ${step} data:`, response.error);
      console.error('Error details:', response.error.details);
      console.error('Error hint:', response.error.hint);
      return { success: false, error: response.error };
    }
    
    console.log(`Successfully saved ${step} data`);
    return { success: true };
  } catch (error) {
    console.error(`Unexpected error saving ${step} data:`, error);
    return { success: false, error };
  }
};

export const completeOnboarding = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId);
    
    if (error) {
      console.error("Error completing onboarding:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error completing onboarding:", error);
    return { success: false, error };
  }
};

export const getOnboardingProgress = async (userId) => {
  try {
    // Remove .single() to avoid 406 error
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
    
    // Define the expected steps - Updated 19JUN25: Using 'costs' to match database
    const steps = [
      'current_status',
      'region_preferences',
      'climate_preferences',
      'culture_preferences',
      'hobbies',
      'administration',
      'costs'  // Changed from 'budget' to 'costs'
    ];
    
    // If no data exists yet or data is empty array
    if (!data || data.length === 0) {
      const completedSteps = {};
      steps.forEach(step => {
        completedSteps[step] = false;
      });
      
      return {
        success: true,
        progress: {
          completedSteps,
          completedCount: 0,
          totalSteps: steps.length,
          percentage: 0
        },
        data: null
      };
    }
    
    // If there was an error
    if (error) {
      console.error("Error fetching onboarding progress:", error);
      return { success: false, error };
    }
    
    // Use first row from the result array
    const userData = data[0];
    
    // Check which steps are completed
    const completedSteps = {};
    let completedCount = 0;
    
    steps.forEach(step => {
      const isCompleted = userData && userData[step] !== null && userData[step] !== undefined;
      completedSteps[step] = isCompleted;
      if (isCompleted) completedCount++;
    });
    
    return {
      success: true,
      progress: {
        completedSteps,
        completedCount,
        totalSteps: steps.length,
        percentage: Math.round((completedCount / steps.length) * 100)
      },
      data: userData
    };
  } catch (error) {
    console.error("Unexpected error getting onboarding progress:", error);
    return { success: false, error };
  }
};

// Helper to get the next incomplete step
export const getNextIncompleteStep = async (userId) => {
  try {
    const { success, progress } = await getOnboardingProgress(userId);
    
    if (!success) return null;
    
    const stepOrder = [
      { key: 'current_status', path: '/onboarding/current-status' },
      { key: 'region_preferences', path: '/onboarding/region' },
      { key: 'climate_preferences', path: '/onboarding/climate' },
      { key: 'culture_preferences', path: '/onboarding/culture' },
      { key: 'hobbies', path: '/onboarding/hobbies' },
      { key: 'administration', path: '/onboarding/administration' },
      { key: 'costs', path: '/onboarding/costs' }  // Changed from 'budget' to 'costs'
    ];
    
    for (const step of stepOrder) {
      if (!progress.completedSteps[step.key]) {
        return step;
      }
    }
    
    // All steps complete, go to review
    return { key: 'review', path: '/onboarding/review' };
  } catch (error) {
    console.error("Error getting next incomplete step:", error);
    return null;
  }
};

// Helper to check if user can access a specific step
export const canAccessStep = async (userId, stepKey) => {
  try {
    const { success, progress } = await getOnboardingProgress(userId);
    
    if (!success) return false;
    
    // User can always access completed steps
    if (progress.completedSteps[stepKey]) return true;
    
    // For future steps, check if all previous steps are complete
    const stepOrder = [
      'current_status',
      'region_preferences',
      'climate_preferences',
      'culture_preferences',
      'hobbies',
      'administration',
      'costs'  // Changed from 'budget' to 'costs'
    ];
    
    const currentStepIndex = stepOrder.indexOf(stepKey);
    if (currentStepIndex === -1) return false;
    
    // Check if all previous steps are complete
    for (let i = 0; i < currentStepIndex; i++) {
      if (!progress.completedSteps[stepOrder[i]]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error checking step access:", error);
    return false;
  }
};

// Helper to clear all onboarding data (useful for testing)
export const clearOnboardingData = async (userId) => {
  try {
    const { error } = await supabase
      .from('onboarding_responses')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error clearing onboarding data:", error);
      return { success: false, error };
    }
    
    // Also reset onboarding_completed flag
    const { error: updateError } = await supabase
      .from('users')
      .update({ onboarding_completed: false })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error resetting onboarding flag:", updateError);
      return { success: false, error: updateError };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error clearing onboarding data:", error);
    return { success: false, error };
  }
};