import React, { useState, useEffect, useTransition, Suspense, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import OnboardingProgressiveNav from './OnboardingProgressiveNav';
import { getOnboardingProgress } from '../utils/onboardingUtils';
import { getCurrentUser } from '../utils/authUtils';

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ completedSteps: {} });
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const outletRef = useRef(null);
  const saveCallbackRef = useRef(null);
  
  // Extract current step from pathname
  const pathSegments = location.pathname.split('/');
  const currentStepPath = pathSegments[pathSegments.length - 1];
  
  // Map path to step key
  const stepMapping = {
    'progress': 'progress',
    'current-status': 'current_status',
    'region': 'region_preferences',
    'climate': 'climate_preferences',
    'culture': 'culture_preferences',
    'hobbies': 'hobbies',
    'administration': 'administration',
    'costs': 'costs',
    'review': 'review',
    'complete': 'complete'
  };
  
  const currentStep = stepMapping[currentStepPath] || 'progress';
  
  // Load onboarding progress on location change
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const userResult = await getCurrentUser();
        if (userResult && userResult.user) {
          const progressData = await getOnboardingProgress(userResult.user.id);
          if (progressData.success) {
            setProgress(progressData.progress || { completedSteps: {} });
          }
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [location.pathname]); // Reload progress when location changes
  
  // Navigation functions for child components
  const navigationPaths = {
    'progress': { next: '/onboarding/current-status', prev: null },
    'current_status': { next: '/onboarding/region', prev: '/onboarding/progress' },
    'region_preferences': { next: '/onboarding/climate', prev: '/onboarding/current-status' },
    'climate_preferences': { next: '/onboarding/culture', prev: '/onboarding/region' },
    'culture_preferences': { next: '/onboarding/hobbies', prev: '/onboarding/climate' },
    'hobbies': { next: '/onboarding/administration', prev: '/onboarding/culture' },
    'administration': { next: '/onboarding/costs', prev: '/onboarding/hobbies' },
    'costs': { next: '/onboarding/review', prev: '/onboarding/administration' },
    'review': { next: '/onboarding/complete', prev: '/onboarding/costs' },
    'complete': { next: null, prev: '/onboarding/review' }
  };
  
  const handleNext = () => {
    const nextPath = navigationPaths[currentStep]?.next;
    if (nextPath && !isTransitioning) {
      setIsTransitioning(true);
      // Add fade-out class
      if (outletRef.current) {
        outletRef.current.classList.add('opacity-0');
      }
      
      setTimeout(() => {
        startTransition(() => {
          navigate(nextPath);
          // Reset transition state after navigation
          setTimeout(() => {
            setIsTransitioning(false);
            if (outletRef.current) {
              outletRef.current.classList.remove('opacity-0');
            }
          }, 50);
        });
      }, 150); // Wait for fade-out
    }
  };
  
  const handlePrevious = () => {
    const prevPath = navigationPaths[currentStep]?.prev;
    if (prevPath && !isTransitioning) {
      setIsTransitioning(true);
      // Add fade-out class
      if (outletRef.current) {
        outletRef.current.classList.add('opacity-0');
      }
      
      setTimeout(() => {
        startTransition(() => {
          navigate(prevPath);
          // Reset transition state after navigation
          setTimeout(() => {
            setIsTransitioning(false);
            if (outletRef.current) {
              outletRef.current.classList.remove('opacity-0');
            }
          }, 50);
        });
      }, 150); // Wait for fade-out
    }
  };
  
  if (loading) {
    return null; // Return nothing during initial load to prevent flash
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Persistent Navigation - Never unmounts */}
      <OnboardingProgressiveNav 
        currentStep={currentStep} 
        completedSteps={progress.completedSteps}
        onNavigate={async (path) => {
          // Call the save function if available
          if (saveCallbackRef.current) {
            await saveCallbackRef.current();
          }
          navigate(path);
        }}
      />
      
      {/* Content Area with smooth transitions */}
      <main className="relative">
        <div ref={outletRef} className="transition-opacity duration-150 ease-in-out">
          <Suspense fallback={null}>
            <Outlet context={{ 
              onNext: handleNext, 
              onPrevious: handlePrevious,
              progress,
              setProgress,
              refreshProgress: async () => {
                const user = await getCurrentUser();
                if (user) {
                  const progressData = await getOnboardingProgress(user.id);
                  if (progressData.success) {
                    setProgress(progressData.progress || { completedSteps: {} });
                  }
                }
              },
              setSaveCallback: (callback) => {
                saveCallbackRef.current = callback;
              }
            }} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}