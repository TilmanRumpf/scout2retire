// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../utils/authUtils';  // Fixed: was ../../../utils/authUtils
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';  // Fixed path

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retakingOnboarding, setRetakingOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: currentUser, profile: userProfile } = await getCurrentUser();
      if (!currentUser) {
        navigate('/welcome');
        return;
      }
      setUser(currentUser);
      setProfile(userProfile);
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle retake onboarding - keeps existing data for editing
  const handleRetakeOnboarding = async () => {
    if (!user) return;
    
    setRetakingOnboarding(true);
    try {
      // Only reset onboarding_completed to false - keep all existing responses
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: false })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to restart onboarding');
        console.error('Error resetting onboarding:', error);
        return;
      }

      toast.success('Loading your preferences for review...');
      
      // Navigate to onboarding status page where they can see their progress
      navigate('/onboarding/status');
    } catch (err) {
      console.error('Error retaking onboarding:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setRetakingOnboarding(false);
    }
  };

  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      navigate('/welcome');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Your Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Profile Information
            </h2>
            <Link
              to="/settings"
              className="text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              Edit
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
              <p className="text-gray-800 dark:text-white">{profile?.full_name || 'Not set'}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-800 dark:text-white">{user?.email}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Nationality</label>
              <p className="text-gray-800 dark:text-white">
                {profile?.nationality ? profile.nationality.toUpperCase() : 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                Estimated Retirement Year
              </label>
              <p className="text-gray-800 dark:text-white">
                {profile?.retirement_year_estimate || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Activity
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {/* TODO: Add favorites count */}
                0
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Towns you've added to favorites
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When you joined Scout2Retire
              </p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Account Actions
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={handleRetakeOnboarding}
              disabled={retakingOnboarding}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {retakingOnboarding ? 'Loading...' : 'Update Preferences'}
            </button>
            
            <Link
              to="/settings"
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              App Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </main>

      <QuickNav />
    </div>
  );
}