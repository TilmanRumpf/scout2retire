import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Create the Onboarding Context
const OnboardingContext = createContext({});

// Custom hook to use the Onboarding Context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Onboarding Provider Component
export const OnboardingProvider = ({ children }) => {
  // Load persisted state from sessionStorage (crash recovery only)
  const loadPersistedState = () => {
    try {
      const saved = sessionStorage.getItem('onboardingProgress');
      if (saved) {
        console.log('🔄 Recovered onboarding progress from session');
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load onboarding progress:', err);
    }
    return {
      currentStep: 1,
      totalSteps: 10,
      completedSteps: [],
      responses: {},
      savedToDatabase: false
    };
  };

  const [state, setState] = useState(loadPersistedState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist state to sessionStorage for crash recovery ONLY
  // Clear it once successfully saved to database
  useEffect(() => {
    try {
      if (!state.savedToDatabase) {
        // Only persist if not yet saved to database
        sessionStorage.setItem('onboardingProgress', JSON.stringify(state));
      } else {
        // Clear session storage once saved to database
        sessionStorage.removeItem('onboardingProgress');
      }
    } catch (err) {
      console.error('Failed to save onboarding progress:', err);
    }
  }, [state]);

  // Update current step
  const setCurrentStep = useCallback((step) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  // Mark step as completed
  const markStepCompleted = useCallback((step) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])]
    }));
  }, []);

  // Save response for a step
  const saveStepResponse = useCallback((step, data) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [step]: data
      }
    }));
    markStepCompleted(step);
  }, [markStepCompleted]);

  // Get response for a step
  const getStepResponse = useCallback((step) => {
    return state.responses[step] || null;
  }, [state.responses]);

  // Check if step is completed
  const isStepCompleted = useCallback((step) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);

  // Get overall progress percentage
  const getProgressPercentage = useCallback(() => {
    return Math.round((state.completedSteps.length / state.totalSteps) * 100);
  }, [state.completedSteps.length, state.totalSteps]);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    if (state.currentStep < state.totalSteps) {
      setCurrentStep(state.currentStep + 1);
      return true;
    }
    return false;
  }, [state.currentStep, state.totalSteps, setCurrentStep]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setCurrentStep(state.currentStep - 1);
      return true;
    }
    return false;
  }, [state.currentStep, setCurrentStep]);

  // Reset onboarding progress
  const resetProgress = useCallback(() => {
    const initialState = {
      currentStep: 1,
      totalSteps: 10,
      completedSteps: [],
      responses: {},
      savedToDatabase: false
    };
    setState(initialState);
    sessionStorage.removeItem('onboardingProgress');
  }, []);

  // Mark onboarding as saved to database (triggers sessionStorage cleanup)
  const markSavedToDatabase = useCallback(() => {
    setState(prev => ({
      ...prev,
      savedToDatabase: true
    }));
  }, []);

  // Get all responses for final submission
  const getAllResponses = useCallback(() => {
    return state.responses;
  }, [state.responses]);

  // Check if onboarding is complete
  const isOnboardingComplete = useCallback(() => {
    return state.completedSteps.length === state.totalSteps;
  }, [state.completedSteps.length, state.totalSteps]);

  // Memoized context value
  const value = useMemo(() => ({
    // State
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    completedSteps: state.completedSteps,
    responses: state.responses,
    loading,
    error,

    // Methods
    setCurrentStep,
    markStepCompleted,
    saveStepResponse,
    getStepResponse,
    isStepCompleted,
    markSavedToDatabase,
    getProgressPercentage,
    goToNextStep,
    goToPreviousStep,
    resetProgress,
    getAllResponses,
    isOnboardingComplete
  }), [
    state,
    loading,
    error,
    setCurrentStep,
    markStepCompleted,
    markSavedToDatabase,
    saveStepResponse,
    getStepResponse,
    isStepCompleted,
    getProgressPercentage,
    goToNextStep,
    goToPreviousStep,
    resetProgress,
    getAllResponses,
    isOnboardingComplete
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;