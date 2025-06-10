import supabase from './supabaseClient';

// Onboarding helpers
export const saveOnboardingStep = async (userId, stepData, step) => {
try {
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
    [step]: stepData,
    submitted_at: new Date().toISOString()
  };
  
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
    return { success: false, error: response.error };
  }
  
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
  
  // Define the expected steps - Updated 09JUN25: Added administration step
  const steps = [
    'current_status',
    'region_preferences',
    'climate_preferences',
    'culture_preferences',
    'hobbies',
    'administration',  // NEW: Administration section for Health, Safety, Governance, Immigration
    'budget'
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