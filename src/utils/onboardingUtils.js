// src/utils/onboardingUtils.js
// Updated to ensure data structure matches exactly what Supabase expects
import supabase from './supabaseClient';
import { clearPersonalizedCache } from './matchingAlgorithm';

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
    
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session when trying to save onboarding step');
      return { success: false, error: 'Not authenticated' };
    }
    
    // First check if user already has onboarding data - without using .single()
    const { data, error: fetchError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error("Error checking existing onboarding data:", fetchError);
      console.error("Error details:", {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code
      });
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
    
    // Clear personalized cache when preferences change
    clearPersonalizedCache(userId);
    
    return { success: true };
  } catch (error) {
    console.error(`Unexpected error saving ${step} data:`, error);
    return { success: false, error };
  }
};

export const completeOnboarding = async (userId) => {
  try {
    // First get the onboarding data to extract retirement info
    const { data: onboardingData } = await supabase
      .from('onboarding_responses')
      .select('current_status')
      .eq('user_id', userId)
      .single();
    
    // Prepare update data - only set onboarding completion flag
    const updateData = { onboarding_completed: true };
    
    // Use upsert to handle cases where user_preferences record doesn't exist yet
    console.log('Attempting to upsert user_preferences with data:', updateData);
    console.log('User ID:', userId);
    
    const { data: updatedUser, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...updateData
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error completing onboarding:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error };
    }
    
    console.log('Update response:', updatedUser);
    
    if (updatedUser && updatedUser.onboarding_completed === true) {
      console.log('✅ Successfully completed onboarding and updated profile');
      
      // Note: Matching will run on first app load instead of during onboarding completion
      // This avoids server-side environment issues during onboarding
      console.log('✅ Onboarding completed - matching will run when user visits app');
      
      return { success: true };
    } else {
      console.error('❌ Update appeared to succeed but onboarding_completed is still false');
      return { success: false, error: { message: 'Update did not set onboarding_completed to true' } };
    }
  } catch (error) {
    console.error("Unexpected error completing onboarding:", error);
    return { success: false, error };
  }
};

export const getOnboardingProgress = async (userId, skipAuthCheck = false) => {
  try {
    // Only check authentication if not explicitly skipped (for matching algorithm)
    if (!skipAuthCheck) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session when trying to get onboarding progress');
        return { success: false, error: 'Not authenticated' };
      }
    }
    
    console.log('Getting onboarding progress for user:', userId);
    
    // Remove .single() to avoid 406 error
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
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
    
    // If no data exists yet
    if (!data) {
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
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // If it's a 400 error, it might be a table or column issue
      if (error.code === '42P01') {
        console.error('Table onboarding_responses does not exist');
      } else if (error.code === '42703') {
        console.error('Column user_id does not exist');
      }
      
      return { success: false, error };
    }
    
    // Transform user_preferences data into section format for display
    const userData = {
      current_status: {
        retirement_timeline: {
          status: typeof data.retirement_status === 'object' 
            ? (data.retirement_status?.value || data.retirement_status?.status || 'Not specified')
            : (data.retirement_status || 'Not specified'),
          target_year: data.target_retirement_year,
          target_month: data.target_retirement_month,
          target_day: data.target_retirement_day,
          flexibility: data.timeline_flexibility
        },
        family_situation: {
          status: typeof data.family_status === 'object'
            ? (data.family_status?.value || data.family_status?.status || 'Not specified')
            : (data.family_status || 'Not specified')
        },
        citizenship: {
          primary_citizenship: data.primary_citizenship,
          secondary_citizenship: data.secondary_citizenship,
          dual_citizenship: !!data.secondary_citizenship
        },
        pet_owner: data.bringing_pets ? ['yes'] : ['no']
      },
      region_preferences: {
        regions: data.regions || [],
        countries: data.countries || [],
        provinces: data.provinces || [],
        geographic_features: data.geographic_features || [],
        vegetation_types: data.vegetation_types || []
      },
      climate_preferences: {
        summer_climate_preference: data.summer_climate_preference || [],
        winter_climate_preference: data.winter_climate_preference || [],
        humidity_level: data.humidity_level || [],
        sunshine: data.sunshine || [],
        precipitation: data.precipitation || [],
        seasonal_preference: data.seasonal_preference
      },
      culture_preferences: {
        expat_community_preference: data.expat_community_preference || [],
        language_comfort: data.language_comfort || {},
        cultural_importance: data.cultural_importance || {},
        lifestyle_preferences: data.lifestyle_preferences || {}
      },
      hobbies: {
        activities: data.activities || [],
        interests: data.interests || [],
        travel_frequency: data.travel_frequency,
        social_preference: data.lifestyle_preferences?.social_preference,
        lifestyle_importance: data.lifestyle_importance || {}
      },
      administration: {
        healthcare_quality: data.healthcare_quality || [],
        health_considerations: data.health_considerations || {},
        insurance_importance: data.insurance_importance || [],
        safety_importance: data.safety_importance || [],
        emergency_services: data.emergency_services || [],
        political_stability: data.political_stability || [],
        tax_preference: data.tax_preference || [],
        government_efficiency: data.government_efficiency || [],
        visa_preference: data.visa_preference || [],
        stay_duration: data.stay_duration || [],
        residency_path: data.residency_path || [],
        special_medical_needs: data.health_considerations?.ongoing_treatment
      },
      costs: {
        total_monthly_budget: data.total_monthly_budget,
        max_monthly_rent: data.max_monthly_rent,
        max_home_price: data.max_home_price,
        monthly_healthcare_budget: data.monthly_healthcare_budget,
        mobility: data.mobility || {}
      }
    };
    
    // Check which steps are completed
    const completedSteps = {};
    let completedCount = 0;
    
    steps.forEach(step => {
      const isCompleted = userData[step] !== null && userData[step] !== undefined;
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