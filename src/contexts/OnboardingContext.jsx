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
  // Load persisted state from localStorage
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem('onboardingProgress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load onboarding progress:', err);
    }
    return {
      currentStep: 1,
      totalSteps: 10,
      completedSteps: [],
      responses: {}
    };
  };

  const [state, setState] = useState(loadPersistedState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('onboardingProgress', JSON.stringify(state));
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
      responses: {}
    };
    setState(initialState);
    localStorage.removeItem('onboardingProgress');
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