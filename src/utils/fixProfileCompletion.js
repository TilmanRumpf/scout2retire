// Utility to fix profile completion for users who completed onboarding but have incorrect flags
import supabase from './supabaseClient';
import { getOnboardingProgress, completeOnboarding } from './onboardingUtils';

export const fixProfileCompletion = async (userId) => {
  try {
    console.log('Checking profile completion for user:', userId);
    
    // Check onboarding progress
    const { success, progress } = await getOnboardingProgress(userId);
    
    if (!success) {
      console.error('Failed to get onboarding progress');
      return { success: false, error: 'Failed to get onboarding progress' };
    }
    
    console.log('Onboarding progress:', progress);
    
    // If onboarding is 100% complete but profile isn't marked as complete
    if (progress?.percentage === 100) {
      console.log('Onboarding is 100% complete, updating profile...');
      
      // Call completeOnboarding to update profile
      const result = await completeOnboarding(userId);
      
      if (result.success) {
        console.log('Successfully updated profile completion status');
        return { success: true, message: 'Profile updated successfully' };
      } else {
        console.error('Failed to update profile:', result.error);
        return { success: false, error: result.error };
      }
    } else {
      console.log('Onboarding is not complete:', progress?.percentage + '%');
      return { success: false, error: 'Onboarding not complete' };
    }
  } catch (error) {
    console.error('Error fixing profile completion:', error);
    return { success: false, error };
  }
};