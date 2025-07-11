// App.jsx - Performance optimized
import React, { useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import supabase from './utils/supabaseClient';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Core Pages
import Home from "./pages/Home";
import DailyRedesignV2 from "./pages/DailyRedesignV2";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import SignupEnhanced from "./pages/SignupEnhanced";
import ResetPassword from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";
import ProfileUnified from "./pages/ProfileUnified";
import MasterSchedule from "./pages/MasterSchedule";
import TownComparison from "./pages/TownComparison";
import TownDiscovery from "./pages/TownDiscovery";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";
import DataImport from "./pages/admin/DataImport";
import HeaderMockup from "./pages/HeaderMockup";
import TestOnboardingUpdate from "./pages/TestOnboardingUpdate";

// Onboarding Flow
import OnboardingProgress from "./pages/onboarding/OnboardingProgress";
import OnboardingClimate from "./pages/onboarding/OnboardingClimate";
import OnboardingCosts from "./pages/onboarding/OnboardingCosts";
import OnboardingCulture from "./pages/onboarding/OnboardingCulture";
import OnboardingCurrentStatus from "./pages/onboarding/OnboardingCurrentStatus";
import OnboardingHobbies from "./pages/onboarding/OnboardingHobbies";
import OnboardingRegion from "./pages/onboarding/OnboardingRegion";
import OnboardingReview from "./pages/onboarding/OnboardingReview";
import OnboardingAdministration from "./pages/onboarding/OnboardingAdministration";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

// Import the new OnboardingLayout
import OnboardingLayout from './components/OnboardingLayout';

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
        const { data: { session } } = await supabase.auth.getSession();
        
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
      <ErrorBoundary>
        <ThemeProvider>
          <>
            <Toaster position="top-center" />
            <Outlet />
          </>
        </ThemeProvider>
      </ErrorBoundary>
    ),
    children: [
      // Public routes
      { path: "welcome", element: <Welcome /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignupEnhanced /> },
      { path: "reset-password", element: <ResetPassword /> },
      
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
        element: <ProtectedRoute><AuthenticatedLayout><DailyRedesignV2 /></AuthenticatedLayout></ProtectedRoute>
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
        path: "profile",
        element: <ProtectedRoute><AuthenticatedLayout><ProfileUnified /></AuthenticatedLayout></ProtectedRoute>
      },
      { path: "settings", element: <Navigate to="/profile?tab=account" replace /> },
      
      // Admin routes
      {
        path: "admin/data-import",
        element: <ProtectedRoute><AuthenticatedLayout><DataImport /></AuthenticatedLayout></ProtectedRoute>
      },
      {
        path: "test-onboarding",
        element: <ProtectedRoute><AuthenticatedLayout><TestOnboardingUpdate /></AuthenticatedLayout></ProtectedRoute>
      },
      
      // Default redirect
      { index: true, element: <Navigate to="/welcome" replace /> },
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
  return <RouterProvider router={router} />;
}

export default App;