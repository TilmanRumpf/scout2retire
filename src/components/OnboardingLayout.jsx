import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import OnboardingProgressiveNav from './OnboardingProgressiveNav';
import { getOnboardingProgress } from '../utils/onboardingUtils';
import { getCurrentUser } from '../utils/authUtils';

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ completedSteps: {} });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
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
  
  // Load onboarding progress once
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const progressData = await getOnboardingProgress(user.id);
          setProgress(progressData);
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);
  
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
    if (nextPath) {
      startTransition(() => {
        navigate(nextPath);
      });
    }
  };
  
  const handlePrevious = () => {
    const prevPath = navigationPaths[currentStep]?.prev;
    if (prevPath) {
      startTransition(() => {
        navigate(prevPath);
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-scout-accent-600 dark:text-scout-accent-400 font-semibold">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Persistent Navigation - Never unmounts */}
      <OnboardingProgressiveNav 
        currentStep={currentStep} 
        completedSteps={progress.completedSteps} 
      />
      
      {/* Content Area with smooth transitions */}
      <main className="relative">
        <div 
          className={`transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}
          style={{ minHeight: 'calc(100vh - 76px)' }} // Header height
        >
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-scout-accent-600 dark:text-scout-accent-400">Loading...</div>
            </div>
          }>
            <Outlet context={{ 
              onNext: handleNext, 
              onPrevious: handlePrevious,
              progress,
              setProgress
            }} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}