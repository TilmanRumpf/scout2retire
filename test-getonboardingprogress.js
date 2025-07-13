import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDYzNDUsImV4cCI6MjA2NDI4MjM0NX0.52Jn2n8sRH5TniQ1LqvOw68YOgpRLdK8FL5_ZV2SPe4'
);

// Simulate the exact function call from the algorithm
export const getOnboardingProgress = async (userId) => {
  try {
    // First check if user is authenticated (skipping this for test)
    
    console.log('Getting onboarding progress for user:', userId);
    
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
    
    console.log('Found onboarding data:', userData);
    
    return {
      success: true,
      data: userData,
      progress: {
        completedSteps: {},
        completedCount: 7,
        totalSteps: 7,
        percentage: 100
      }
    };
    
  } catch (error) {
    console.error("Unexpected error getting onboarding progress:", error);
    return { success: false, error };
  }
};

async function testGetOnboardingProgress() {
  console.log('🔍 TESTING getOnboardingProgress FUNCTION\n');
  
  const result = await getOnboardingProgress('83d285b2-b21b-4d13-a1a1-6d51b6733d52');
  
  console.log('\nRESULT:');
  console.log('Success:', result.success);
  console.log('Data:', JSON.stringify(result.data, null, 2));
  console.log('Progress:', result.progress);
}

testGetOnboardingProgress();