// App.jsx - Complete Fixed File
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import supabase from './utils/supabaseClient';
import AuthenticatedLayout from './components/AuthenticatedLayout';

// Core Pages
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import MasterSchedule from "./pages/MasterSchedule";
import TownComparison from "./pages/TownComparison";
import TownDiscovery from "./pages/TownDiscovery";
import Chat from "./pages/Chat";
import Journal from "./pages/Journal";

// Onboarding Flow - FIXED: Changed OnboardingStatus to OnboardingProgress
import OnboardingProgress from "./pages/onboarding/OnboardingProgress";
import OnboardingClimate from "./pages/onboarding/OnboardingClimate";
import OnboardingCosts from "./pages/onboarding/OnboardingCosts";
import OnboardingCulture from "./pages/onboarding/OnboardingCulture";
import OnboardingCurrentStatus from "./pages/onboarding/OnboardingCurrentStatus";
import OnboardingHobbies from "./pages/onboarding/OnboardingHobbies";
import OnboardingRegion from "./pages/onboarding/OnboardingRegion";
import OnboardingReview from "./pages/onboarding/OnboardingReview";
import OnboardingAdministration from "./pages/onboarding/OnboardingAdministration"; // Added 09JUN25: New Administration step

// Onboarding wrapper components with navigation
const OnboardingWrapper = ({ children, nextPath, prevPath }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    console.log('Navigation to:', nextPath);
    if (nextPath) {
      navigate(nextPath);
    }
  };

  const handlePrevious = () => {
    console.log('Navigation to:', prevPath);
    if (prevPath) {
      navigate(prevPath);
    }
  };

  return React.cloneElement(children, {
    onNext: handleNext,
    onPrevious: handlePrevious,
    formData,
    setFormData
  });
};

// Protected Route component
const ProtectedRoute = ({ children, onboardingRequired = false }) => {
  const [user, setUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/welcome');
          return;
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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-green-600 font-semibold">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  // Redirect to onboarding if it's not completed and the route requires it
  if (onboardingRequired && onboardingCompleted === false) {
    return <Navigate to="/onboarding/status" replace />;
  }

  // Redirect to daily dashboard if onboarding is completed but user tries to access onboarding
  if (!onboardingRequired && onboardingCompleted === true && window.location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/daily" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding flow with navigation - Updated 09JUN25: Added Administration step */}
          <Route path="/onboarding/status" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/current-status" prevPath="/welcome">
                <OnboardingProgress />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/current-status" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/region" prevPath="/onboarding/status">
                <OnboardingCurrentStatus />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/region" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/climate" prevPath="/onboarding/current-status">
                <OnboardingRegion />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/climate" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/culture" prevPath="/onboarding/region">
                <OnboardingClimate />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/culture" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/hobbies" prevPath="/onboarding/climate">
                <OnboardingCulture />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/hobbies" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/administration" prevPath="/onboarding/culture">
                <OnboardingHobbies />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          {/* NEW: Administration route - Added 09JUN25 */}
          <Route path="/onboarding/administration" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/costs" prevPath="/onboarding/hobbies">
                <OnboardingAdministration />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/costs" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/onboarding/review" prevPath="/onboarding/administration">
                <OnboardingCosts />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />
          <Route path="/onboarding/review" element={
            <ProtectedRoute>
              <OnboardingWrapper nextPath="/daily" prevPath="/onboarding/costs">
                <OnboardingReview />
              </OnboardingWrapper>
            </ProtectedRoute>
          } />

          {/* Protected routes (require login AND completed onboarding) */}
          <Route path="/daily" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <TownDiscovery />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/compare" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <TownComparison />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Favorites />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <MasterSchedule />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Journal />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Chat />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/chat/:townId" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Chat />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute onboardingRequired={true}>
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;