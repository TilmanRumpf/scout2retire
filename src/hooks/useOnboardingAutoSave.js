import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCurrentUser } from '../utils/authUtils';
import { saveOnboardingStep } from '../utils/userpreferences/onboardingUtils';

/**
 * Hook to enable auto-save functionality for onboarding pages
 * @param {Object} formData - The form data to save
 * @param {string} stepName - The name of the onboarding step (e.g., 'climate_preferences')
 */
export function useOnboardingAutoSave(formData, stepName) {
  const context = useOutletContext() || {};
  const { setSaveCallback } = context;

  // Auto-save function
  const autoSave = async () => {
    try {
      const userResult = await getCurrentUser();
      if (!userResult.user) return false;
      
      const { success } = await saveOnboardingStep(
        userResult.user.id,
        formData,
        stepName
      );
      
      return success;
    } catch (err) {
      console.error(`Auto-save error for ${stepName}:`, err);
      return false;
    }
  };

  // Register auto-save callback with the layout
  useEffect(() => {
    if (setSaveCallback) {
      setSaveCallback(autoSave);
    }
    // Cleanup on unmount
    return () => {
      if (setSaveCallback) {
        setSaveCallback(null);
      }
    };
  }, [formData, setSaveCallback, stepName]);

  return autoSave;
}