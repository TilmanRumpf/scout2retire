import React, { useState, useEffect, useTransition, Suspense, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import UnifiedHeader from './UnifiedHeader';
import HeaderSpacer from './HeaderSpacer';
import SwipeableOnboardingContent from './SwipeableOnboardingContent';
import SimpleSwipeTest from './SimpleSwipeTest';
import { MapPin, Globe, CloudSun, Users, SmilePlus, HousePlus, DollarSign } from 'lucide-react';
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
  
  // Define all onboarding steps for UnifiedHeader
  const steps = [
    { key: 'current_status', label: 'Status', path: '/onboarding/current-status', icon: MapPin },
    { key: 'region_preferences', label: 'Region', path: '/onboarding/region', icon: Globe },
    { key: 'climate_preferences', label: 'Climate', path: '/onboarding/climate', icon: CloudSun },
    { key: 'culture_preferences', label: 'Culture', path: '/onboarding/culture', icon: Users },
    { key: 'hobbies', label: 'Hobbies', path: '/onboarding/hobbies', icon: SmilePlus },
    { key: 'administration', label: 'Admin', path: '/onboarding/administration', icon: HousePlus },
    { key: 'costs', label: 'Costs', path: '/onboarding/costs', icon: DollarSign }
  ];
  
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
  
  // Check if we're on a swipeable step
  const isSwipeableStep = ['current_status', 'region_preferences', 'climate_preferences', 
                           'culture_preferences', 'hobbies', 'administration', 'costs'].includes(currentStep);
  
  // DEBUG: Log key values
  console.log('[ONBOARDING] Current step:', currentStep);
  console.log('[ONBOARDING] Current path:', location.pathname);
  console.log('[ONBOARDING] Is swipeable step:', isSwipeableStep);
  console.log('[ONBOARDING] Window width:', typeof window !== 'undefined' ? window.innerWidth : 'N/A');
  
  // Add CSS class for swipeable pages to override global overscroll behavior
  useEffect(() => {
    if (isSwipeableStep) {
      document.body.classList.add('onboarding-swipeable');
      // Temporarily override overscroll behavior for better swipe detection
      document.body.style.overscrollBehavior = 'auto';
    } else {
      document.body.classList.remove('onboarding-swipeable');
      document.body.style.overscrollBehavior = 'contain';
    }
    
    return () => {
      document.body.classList.remove('onboarding-swipeable');
      document.body.style.overscrollBehavior = 'contain';
    };
  }, [isSwipeableStep]);
  
  if (loading) {
    return null; // Return nothing during initial load to prevent flash
  }
  
  // Get title based on current step
  const getTitle = () => {
    if (currentStep === 'progress') return 'Your Onboarding Progress';
    if (currentStep === 'review') return 'Review Your Preferences';
    if (currentStep === 'complete') return 'Welcome to Scout2Retire!';
    return 'Onboarding';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Header - Single source of truth */}
      <UnifiedHeader 
        title={getTitle()}
        steps={currentStep !== 'progress' && currentStep !== 'review' && currentStep !== 'complete' ? steps : []}
        currentStep={currentStep}
        completedSteps={progress.completedSteps}
        onStepNavigate={async (path) => {
          // Call the save function if available
          if (saveCallbackRef.current) {
            await saveCallbackRef.current();
          }
          navigate(path);
        }}
      />
      
      {/* Header spacer for proper content positioning */}
      <HeaderSpacer hasFilters={false} />
      
      {/* SIMPLE SWIPE TEST - Raw Touch Events */}
      {isSwipeableStep && (
        <div 
          className="fixed top-20 left-4 z-50 bg-green-500 p-4 rounded shadow-lg text-white"
          style={{ width: '200px', height: '100px' }}
          onTouchStart={(e) => {
            console.log('🟢 TOUCH START:', e.touches.length, 'touches');
            alert('Touch started!');
          }}
          onTouchMove={(e) => {
            console.log('🔵 TOUCH MOVE:', e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={(e) => {
            console.log('🔴 TOUCH END');
            alert('Touch ended!');
          }}
        >
          <div className="text-center text-sm font-bold">
            SWIPE TEST ZONE
            <br />
            Touch here to test
          </div>
        </div>
      )}

      {/* DEBUG BUTTON - TEMPORARY TESTING */}
      {isSwipeableStep && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 p-2 rounded shadow-lg">
          <div className="text-white text-xs mb-2 text-center">
            Width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}
            <br />
            Step: {currentStep}
            <br />
            Swipeable: {isSwipeableStep ? 'YES' : 'NO'}
          </div>
          <button 
            onClick={handleNext} 
            className="bg-white text-red-500 px-3 py-1 rounded text-sm font-bold mr-2"
          >
            DEBUG NEXT
          </button>
          <button 
            onClick={handlePrevious} 
            className="bg-white text-red-500 px-3 py-1 rounded text-sm font-bold"
          >
            DEBUG PREV
          </button>
        </div>
      )}

      {/* SIMPLE SWIPE TEST COMPONENT */}
      {isSwipeableStep && <SimpleSwipeTest />}
      
      {/* Content Area with smooth transitions and swipe support */}
      <main className="relative min-h-screen">
        {console.log('[ONBOARDING] Rendering content area, isSwipeableStep:', isSwipeableStep)}
        {isSwipeableStep ? (
          <SwipeableOnboardingContent onNext={handleNext} onPrevious={handlePrevious}>
            <div 
              ref={outletRef} 
              className="transition-opacity duration-150 ease-in-out min-h-screen"
              style={{
                minHeight: 'calc(100vh - 100px)', // Account for header space
                touchAction: 'pan-y', // Allow vertical scrolling within content
              }}
            >
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
          </SwipeableOnboardingContent>
        ) : (
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
        )}
      </main>
    </div>
  );
}