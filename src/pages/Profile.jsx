import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../utils/authUtils';
import { fetchFavorites } from '../utils/townUtils';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    nationality: '',
    retirement_year_estimate: ''
  });
  
  const navigate = useNavigate();

  // Load user profile and favorite count
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { user: currentUser, profile: userProfile } = await getCurrentUser();
        if (!currentUser) {
          navigate('/welcome');
          return;
        }
        
        setUser(currentUser);
        setProfile(userProfile);
        
        // Initialize form data with profile data
        if (userProfile) {
          setFormData({
            full_name: userProfile.full_name || '',
            nationality: userProfile.nationality || '',
            retirement_year_estimate: userProfile.retirement_year_estimate || new Date().getFullYear() + 5
          });
        }
        
        // Get favorite count
        const { success, favorites } = await fetchFavorites(currentUser.id);
        if (success) {
          setFavoriteCount(favorites.length);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'retirement_year_estimate' ? parseInt(value, 10) : value
    }));
  };
  
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          nationality: formData.nationality,
          retirement_year_estimate: formData.retirement_year_estimate
        })
        .eq('id', user.id);
      
      if (error) {
        toast.error(`Failed to update profile: ${error.message}`);
        return;
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        full_name: formData.full_name,
        nationality: formData.nationality,
        retirement_year_estimate: formData.retirement_year_estimate
      }));
      
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const { success, error } = await signOut();
      
      if (!success) {
        toast.error(`Failed to log out: ${error.message}`);
        return;
      }
      
      navigate('/welcome');
    } catch (err) {
      console.error("Error signing out:", err);
      toast.error("Failed to log out");
    }
  };
  
  // Handle retaking onboarding
  const handleRetakeOnboarding = () => {
    navigate('/onboarding/status');
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="animate-pulse text-green-600 font-semibold">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Your Profile
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Profile section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editMode ? 'Edit Profile' : 'Profile Information'}
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-green-600 dark:text-green-400 text-sm hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nationality
                  </label>
                  <select
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">Select Nationality</option>
                    <option value="usa">United States</option>
                    <option value="canada">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="australia">Australia</option>
                    <option value="germany">Germany</option>
                    <option value="france">France</option>
                    <option value="spain">Spain</option>
                    <option value="italy">Italy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="retirement_year_estimate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Retirement Year
                  </label>
                  <input
                    id="retirement_year_estimate"
                    name="retirement_year_estimate"
                    type="number"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 50}
                    value={formData.retirement_year_estimate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
                  <p className="text-gray-800 dark:text-white">{profile?.full_name || 'Not provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="text-gray-800 dark:text-white">{user?.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</h3>
                  <p className="text-gray-800 dark:text-white">
                    {profile?.nationality 
                      ? profile.nationality.toUpperCase() 
                      : 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Retirement Year</h3>
                  <p className="text-gray-800 dark:text-white">
                    {profile?.retirement_year_estimate || 'Not provided'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Activity section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Activity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-white">Favorites</h3>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {favoriteCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Towns you've added to favorites
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 dark:text-white">Account Created</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString() 
                      : 'Unknown'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  When you joined Scout2Retire
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              Account Actions
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleRetakeOnboarding}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-left flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Retake Onboarding
              </button>
              
              <button
                onClick={() => navigate('/settings')}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-md transition-colors text-left flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                App Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-left flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm2 6a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1zm-4 0a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
    </div>
  );
}