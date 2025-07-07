// App.jsx - Performance optimized
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import supabase from './utils/supabaseClient';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Core Pages
import Home from "./pages/Home";
import DailyRedesignV2 from "./pages/DailyRedesignV2";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
          // Use a shorter delay to minimize flash while still allowing session restoration
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Check again
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            navigate('/welcome');
            return;
          }
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

  // Redirect to daily dashboard if onboarding is completed but user tries to access onboarding
  if (onboardingCompleted === true && window.location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/daily" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Toaster position="top-center" />
          <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding flow with persistent layout */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingLayout />
            </ProtectedRoute>
          }>
            <Route path="progress" element={<OnboardingProgress />} />
            <Route path="current-status" element={<OnboardingCurrentStatus />} />
            <Route path="region" element={<OnboardingRegion />} />
            <Route path="climate" element={<OnboardingClimate />} />
            <Route path="culture" element={<OnboardingCulture />} />
            <Route path="hobbies" element={<OnboardingHobbies />} />
            <Route path="administration" element={<OnboardingAdministration />} />
            <Route path="costs" element={<OnboardingCosts />} />
            <Route path="review" element={<OnboardingReview />} />
            <Route path="complete" element={<OnboardingComplete />} />
            <Route index element={<Navigate to="progress" replace />} />
          </Route>

          {/* Protected routes (require login AND completed onboarding) */}
          <Route path="/daily" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <DailyRedesignV2 />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <TownDiscovery />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/compare" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <TownComparison />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <Favorites />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <MasterSchedule />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <Journal />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/mockup" element={
            <ProtectedRoute>
              <HeaderMockup />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <Chat />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/chat/:townId" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <Chat />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute >
              <AuthenticatedLayout>
                <ProfileUnified />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={<Navigate to="/profile?tab=account" replace />} />

          {/* Admin routes */}
          <Route path="/admin/data-import" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DataImport />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;