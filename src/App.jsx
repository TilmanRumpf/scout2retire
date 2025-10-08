// App.jsx - Performance optimized
import React, { useState, useEffect, Suspense } from "react";
import { RouterProvider, createBrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import supabase from './utils/supabaseClient';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import UnifiedErrorBoundary from './components/UnifiedErrorBoundary';
import { checkAppVersion, setupAutoRefresh } from './utils/versionCheck';
import InstallPromptBanner from './components/InstallPromptBanner';
import SuspenseLoader from './components/SuspenseLoader';

// Core Pages - Lazy loaded for better performance
const Home = React.lazy(() => import("./pages/Home"));
const Daily = React.lazy(() => import("./pages/Daily"));
const Welcome = React.lazy(() => import("./pages/Welcome"));
const Login = React.lazy(() => import("./pages/Login"));
const SignupEnhanced = React.lazy(() => import("./pages/SignupEnhanced"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Favorites = React.lazy(() => import("./pages/Favorites"));
const ProfileUnified = React.lazy(() => import("./pages/ProfileUnified"));
const MasterSchedule = React.lazy(() => import("./pages/MasterSchedule"));
const TownComparison = React.lazy(() => import("./pages/TownComparison"));
const TownDiscovery = React.lazy(() => import("./pages/TownDiscovery"));
const Chat = React.lazy(() => import("./pages/Chat"));
const Journal = React.lazy(() => import("./pages/Journal"));
const TownsManager = React.lazy(() => import("./pages/admin/TownsManager"));
const PaywallManager = React.lazy(() => import("./pages/admin/PaywallManager"));
const HeaderMockup = React.lazy(() => import("./pages/HeaderMockup"));
const ScottyGuide = React.lazy(() => import("./components/ScottyGuide"));

// Onboarding Flow - Lazy loaded
const OnboardingProgress = React.lazy(() => import("./pages/onboarding/OnboardingProgress"));
const OnboardingClimate = React.lazy(() => import("./pages/onboarding/OnboardingClimate"));
const OnboardingCosts = React.lazy(() => import("./pages/onboarding/OnboardingCosts"));
const OnboardingCulture = React.lazy(() => import("./pages/onboarding/OnboardingCulture"));
const OnboardingCurrentStatus = React.lazy(() => import("./pages/onboarding/OnboardingCurrentStatus"));
const OnboardingHobbies = React.lazy(() => import("./pages/onboarding/OnboardingHobbies"));
const OnboardingRegion = React.lazy(() => import("./pages/onboarding/OnboardingRegion"));
const OnboardingReview = React.lazy(() => import("./pages/onboarding/OnboardingReview"));
const OnboardingAdministration = React.lazy(() => import("./pages/onboarding/OnboardingAdministration"));
const OnboardingComplete = React.lazy(() => import("./pages/onboarding/OnboardingComplete"));

// Import the new OnboardingLayout
import OnboardingLayout from './components/OnboardingLayout';

// Public Route component - redirects authenticated users to /daily
const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 200));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          session = retrySession;
        }
        
        if (session?.user) {
          // Check if user has a profile
          const { data: userData, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
            
          if (!error && userData) {
            // User is authenticated with profile - redirect to daily
            navigate('/daily', { replace: true });
            return;
          }
        }
        
        setUser(session?.user || null);
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Note: We don't redirect on SIGNED_IN event here because the Login component
    // needs to check onboarding status and decide where to redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only re-check auth on SIGNED_OUT to clear the loading state
      if (event === 'SIGNED_OUT') {
        setLoading(true);
        checkAuth();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return null;
  }

  return children;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        // First check if there's a stored session
        let { data: { session } } = await supabase.auth.getSession();
        
        // If no session, check if we're still loading from storage
        if (!session) {
          // Wait a bit longer for session to potentially be restored from storage
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check again
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            navigate('/welcome');
            return;
          }
          // Update session variable with the retry result
          session = retrySession;
        }
        setUser(session.user);
        // Get user profile to check onboarding status
        if (session.user) {
          // Check onboarding status from user_preferences (correct table)
          const { data: prefsData, error: prefsError } = await supabase
            .from('user_preferences')
            .select('onboarding_completed')
            .eq('user_id', session.user.id)
            .single();

          if (prefsError) {
            // If no preferences record, check users table as fallback
            const { data: userData, error } = await supabase
              .from('users')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error("Error fetching user data:", error);
              // CRITICAL FIX: If user has auth but no profile, redirect to signup
              // This prevents the Tobias bug where users can access the app without a profile
              toast.error('Profile not found. Please complete your registration.');
              navigate('/signup');
              return;
            } else {
              setOnboardingCompleted(userData.onboarding_completed);
            }
          } else {
            setOnboardingCompleted(prefsData.onboarding_completed);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/welcome');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return null; // Return nothing to prevent flash
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Note: Users can abandon onboarding at any time and navigate to other pages
  // This respects user choice to not share personal data
  // Only suggest onboarding, don't force it
  // Users who completed onboarding can still access their preferences to edit them

  return children;
};

// Create the router configuration with v7 future flags enabled
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UnifiedErrorBoundary variant="full">
        <ThemeProvider>
          <>
            <Toaster position="top-center" />
            <InstallPromptBanner />
            <Outlet />
          </>
        </ThemeProvider>
      </UnifiedErrorBoundary>
    ),
    children: [
      // Public routes - redirect to /daily if authenticated
      { path: "welcome", element: <PublicRoute><Welcome /></PublicRoute> },
      { path: "login", element: <PublicRoute><Login /></PublicRoute> },
      { path: "signup", element: <PublicRoute><SignupEnhanced /></PublicRoute> },
      { path: "reset-password", element: <PublicRoute><ResetPassword /></PublicRoute> },
      
      // Onboarding flow with persistent layout
      {
        path: "onboarding",
        element: <ProtectedRoute><OnboardingLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="progress" replace /> },
          { path: "progress", element: <OnboardingProgress /> },
          { path: "current-status", element: <OnboardingCurrentStatus /> },
          { path: "region", element: <OnboardingRegion /> },
          { path: "climate", element: <OnboardingClimate /> },
          { path: "culture", element: <OnboardingCulture /> },
          { path: "hobbies", element: <OnboardingHobbies /> },
          { path: "administration", element: <OnboardingAdministration /> },
          { path: "costs", element: <OnboardingCosts /> },
          { path: "review", element: <OnboardingReview /> },
          { path: "complete", element: <OnboardingComplete /> },
        ]
      },
      
      // Protected routes (require login AND completed onboarding)
      {
        path: "daily",
        element: <ProtectedRoute><AuthenticatedLayout><Daily /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "home",
        element: <ProtectedRoute><AuthenticatedLayout><Home /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "discover",
        element: <ProtectedRoute><AuthenticatedLayout><TownDiscovery /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "compare",
        element: <ProtectedRoute><AuthenticatedLayout><TownComparison /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "favorites",
        element: <ProtectedRoute><AuthenticatedLayout><Favorites /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "schedule",
        element: <ProtectedRoute><AuthenticatedLayout><MasterSchedule /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "journal",
        element: <ProtectedRoute><AuthenticatedLayout><Journal /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "scotty",
        element: <ProtectedRoute><AuthenticatedLayout><ScottyGuide /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "mockup",
        element: <ProtectedRoute><HeaderMockup /></ProtectedRoute>
      },
      {
        path: "chat",
        element: <ProtectedRoute><AuthenticatedLayout><Chat /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "chat/:townId",
        element: <ProtectedRoute><AuthenticatedLayout><Chat /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "chat/group/:groupId",
        element: <ProtectedRoute><AuthenticatedLayout><Chat /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute><AuthenticatedLayout><ProfileUnified /></AuthenticatedLayout></ProtectedRoute>
      },
      { path: "settings", element: <Navigate to="/profile?tab=account" replace /> },
      
      // Admin routes
      {
        path: "admin/towns-manager",
        element: <ProtectedRoute><AuthenticatedLayout><TownsManager /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "admin/paywall",
        element: <ProtectedRoute><AuthenticatedLayout><PaywallManager /></AuthenticatedLayout></ProtectedRoute>
      },
      
      // Default redirect - check auth and redirect accordingly
      { 
        index: true, 
        element: <PublicRoute><Navigate to="/daily" replace /></PublicRoute> 
      },
      { path: "*", element: <Navigate to="/welcome" replace /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

function App() {
  return (
    <UnifiedErrorBoundary variant="full">
      <AuthProvider>
        <Suspense fallback={<SuspenseLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </UnifiedErrorBoundary>
  );
}

export default App;