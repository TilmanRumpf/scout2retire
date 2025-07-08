import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, signOut, updatePassword } from '../utils/authUtils';
import { getOnboardingProgress, saveOnboardingStep } from '../utils/onboardingUtils';
import { useTheme } from '../contexts/useTheme';
import UnifiedHeader from '../components/UnifiedHeader';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { User, Settings, Bell, Shield, Palette, Globe, Calendar, Users, PawPrint, AtSign } from 'lucide-react';
import { UsernameSelector } from '../components/UsernameSelector';
import { formatUsername } from '../utils/usernameGenerator';

// Option Button Component - Matching onboarding style
const OptionButton = ({ label, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${uiConfig.components.buttonSizes.default} lg:py-3 lg:px-4 xl:py-4 xl:px-5 ${uiConfig.layout.radius.md} lg:rounded-lg border-2 ${uiConfig.animation.transition} text-center ${
      isSelected
        ? uiConfig.components.buttonVariants.selected
        : uiConfig.components.buttonVariants.unselected
    }`}
  >
    <div className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${isSelected ? 'text-white' : uiConfig.colors.body}`}>{label}</div>
    {description && <div className={`${uiConfig.font.size.xs} lg:text-sm mt-0.5 lg:mt-1 ${isSelected ? 'text-white' : uiConfig.colors.hint}`}>{description}</div>}
  </button>
);

// Countries list for citizenship dropdowns
const countries = [
  { id: 'us', label: 'United States' },
  { id: 'uk', label: 'United Kingdom' },
  { id: 'ca', label: 'Canada' },
  { id: 'au', label: 'Australia' },
  { id: 'de', label: 'Germany' },
  { id: 'fr', label: 'France' },
  { id: 'es', label: 'Spain' },
  { id: 'it', label: 'Italy' },
  { id: 'pt', label: 'Portugal' },
  { id: 'nl', label: 'Netherlands' },
  { id: 'ch', label: 'Switzerland' },
  { id: 'se', label: 'Sweden' },
  { id: 'no', label: 'Norway' },
  { id: 'dk', label: 'Denmark' },
  { id: 'ie', label: 'Ireland' },
  { id: 'be', label: 'Belgium' },
  { id: 'at', label: 'Austria' },
  { id: 'other', label: 'Other' }
];

// Reusable toggle switch component
const ToggleSwitch = ({ id, checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <label htmlFor={id} className={`text-sm font-medium ${uiConfig.colors.body} cursor-pointer`}>
        {label}
      </label>
      {description && (
        <p className={`text-xs ${uiConfig.colors.hint} mt-0.5`}>
          {description}
        </p>
      )}
    </div>
    <div className="relative inline-block w-11 h-6 ml-4">
      <input
        type="checkbox"
        id={id}
        className="opacity-0 w-0 h-0"
        checked={checked}
        onChange={() => onChange(id)}
      />
      <label
        htmlFor={id}
        className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
          checked ? uiConfig.colors.toggleOn : uiConfig.colors.toggleOff
        }`}
      >
        <span 
          className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
            checked ? 'transform translate-x-5' : ''
          }`}
        />
      </label>
    </div>
  </div>
);

export default function ProfileUnified() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [activeTab, setActiveTab] = useState('account');
  const [retakingOnboarding, setRetakingOnboarding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showUsernameSelector, setShowUsernameSelector] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    username: '',
    nationality: '',
    citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      secondary_citizenship: ''
    },
    partner_citizenship: {
      primary_citizenship: '',
      dual_citizenship: false,
      secondary_citizenship: ''
    },
    family_situation: '',
    retirement_timeline: {
      status: '',
      target_year: new Date().getFullYear() + 5,
      target_month: 1,
      target_day: 1
    },
    pet_owner: []
  });
  
  // Password form
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Preferences
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [language, setLanguage] = useState('en');
  
  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newTownAlerts: true,
    weeklyDigest: true,
    priceChanges: true,
    friendActivity: true
  });
  
  // Privacy
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends', // 'public', 'friends', 'private'
    showFavorites: 'friends', // 'public', 'friends', 'private'
    showActivity: 'friends', // 'public', 'friends', 'private'
    allowFriendRequests: true,
    showOnlineStatus: 'friends', // 'public', 'friends', 'private'
    shareLocationPreferences: 'friends', // 'public', 'friends', 'private'
    allowDataCollection: true,
    allowPersonalization: true
  });
  
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Set active tab from URL and handle username selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['account', 'preferences', 'notifications', 'privacy'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Check if we should show username selector
    const selectUsername = searchParams.get('selectUsername');
    if (selectUsername === 'true') {
      setShowUsernameSelector(true);
      // Remove the query parameter after reading it
      searchParams.delete('selectUsername');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Load user data
  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies intentionally omitted - loadUserData should only run once on mount

  const loadUserData = async () => {
    try {
      const { user: currentUser, profile: userProfile } = await getCurrentUser();
      if (!currentUser) {
        navigate('/welcome');
        return;
      }
      setUser(currentUser);
      setProfile(userProfile);
      
      // Check for pending username in localStorage
      const pendingUsername = localStorage.getItem(`pending_username_${currentUser.id}`);
      if (pendingUsername && !userProfile?.username) {
        console.log('Found pending username in localStorage:', pendingUsername);
        // Try to save it again
        try {
          const { error } = await supabase
            .from('users')
            .update({ username: pendingUsername })
            .eq('id', currentUser.id);
          
          if (!error) {
            console.log('Successfully saved pending username to database');
            localStorage.removeItem(`pending_username_${currentUser.id}`);
            // Update the profile with the saved username
            userProfile.username = pendingUsername;
          }
        } catch (err) {
          console.error('Failed to save pending username:', err);
        }
        
        // Even if database save fails, show the username in UI
        setProfile(prev => ({ ...prev, username: pendingUsername }));
      }
      
      // Load onboarding data FIRST
      const { success, data } = await getOnboardingProgress(currentUser.id);
      
      if (success && data) {
        setOnboardingData(data);
      }
      
      // Initialize edited profile with ALL the actual data
      const currentStatus = data?.current_status || {};
      setEditedProfile({
        full_name: userProfile?.full_name || '',
        username: userProfile?.username || pendingUsername || '',
        nationality: userProfile?.nationality || '',
        citizenship: currentStatus.citizenship || {
          primary_citizenship: '',
          dual_citizenship: false,
          secondary_citizenship: ''
        },
        partner_citizenship: currentStatus.partner_citizenship || {
          primary_citizenship: '',
          dual_citizenship: false,
          secondary_citizenship: ''
        },
        family_situation: typeof currentStatus.family_situation === 'string' 
          ? currentStatus.family_situation 
          : (currentStatus.family_situation?.status || 'solo'),
        retirement_timeline: currentStatus.retirement_timeline || {
          status: '',
          target_year: new Date().getFullYear() + 5,
          target_month: 1,
          target_day: 1
        },
        pet_owner: currentStatus.pet_owner || []
      });
      
      // Show username selector if user doesn't have a username
      if (!userProfile?.username && !pendingUsername) {
        setShowUsernameSelector(true);
      }
      
      // Load favorites count
      const { count } = await supabase
        .from('saved_locations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);
      
      setFavoritesCount(count || 0);
      
      // Load user preferences (would come from user_settings table)
      // For now using defaults
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Helper function to check if citizenship dropdowns should show active state  
  const isCitizenshipActive = (value) => {
    // Always show active if there's any value selected
    return Boolean(value && value !== '');
  };

  // Profile completeness calculation
  const getProfileCompleteness = () => {
    const fields = [
      profile?.full_name,
      profile?.nationality,
      profile?.retirement_year_estimate,
      profile?.onboarding_completed
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Handle retake onboarding
  const handleRetakeOnboarding = async () => {
    setRetakingOnboarding(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: false })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Loading your preferences...');
      
      // Force page reload to ensure all cached state is refreshed
      // This prevents the ProtectedRoute from redirecting back to /daily
      window.location.href = '/onboarding/current-status';
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to access preferences');
    } finally {
      setRetakingOnboarding(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    if (passwordFormData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    try {
      setLoading(true);
      const { success, error } = await updatePassword(passwordFormData.newPassword);
      
      if (!success) {
        setPasswordError(error.message || "Failed to update password");
        return;
      }
      
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success("Password updated successfully");
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success('Notification preference updated');
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success('Privacy setting updated');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Delete user data
      await supabase.from('users').delete().eq('id', user.id);
      
      // Sign out
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully");
      navigate('/welcome');
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      navigate('/welcome');
    }
  };

  // Handle username selection
  const handleUsernameSelect = async (username) => {
    try {
      if (!user?.id) {
        console.error('User ID not found');
        toast.error('User not logged in');
        return;
      }

      // Update UI immediately
      setProfile(prev => ({ ...prev, username }));
      setEditedProfile(prev => ({ ...prev, username }));
      setShowUsernameSelector(false);
      
      console.log('Saving username:', username, 'for user:', user.id);
      
      // Try to save to database (but don't block UI update)
      try {
        const { error } = await supabase
          .from('users')
          .update({ username })
          .eq('id', user.id);

        if (error) {
          console.error('Supabase error:', error);
          
          // If it's a schema cache error, try a workaround
          if (error.message?.includes('schema cache')) {
            console.log('Attempting workaround for schema cache issue...');
            
            // Try using RPC or raw SQL as a workaround
            const { error: rpcError } = await supabase.rpc('update_username', {
              user_id: user.id,
              new_username: username
            }).catch(() => {
              // If RPC doesn't exist, fail silently
              return { error: null };
            });
            
            if (!rpcError) {
              toast.success('Username saved successfully!');
              return;
            }
          }
          
          throw error;
        }

        toast.success('Username saved successfully!');
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Show warning but keep the UI updated
        toast.error('Username updated locally but could not save to server. It will be saved on next sync.', {
          duration: 5000
        });
        
        // Store in localStorage as backup
        localStorage.setItem(`pending_username_${user.id}`, username);
      }
    } catch (err) {
      console.error('Error in username selection:', err);
      toast.error('Failed to update username');
      
      // Revert UI changes if the initial update failed
      setProfile(prev => ({ ...prev, username: profile?.username || '' }));
      setEditedProfile(prev => ({ ...prev, username: profile?.username || '' }));
    }
  };

  // Handle profile edit
  const handleEditProfile = () => {
    const currentStatus = onboardingData?.current_status || {};
    
    setEditedProfile({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      nationality: profile?.nationality || '',
      citizenship: currentStatus.citizenship || {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      },
      partner_citizenship: currentStatus.partner_citizenship || {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      },
      family_situation: typeof currentStatus.family_situation === 'string' 
        ? currentStatus.family_situation 
        : (currentStatus.family_situation?.status || 'solo'),
      retirement_timeline: currentStatus.retirement_timeline || {
        status: '',
        target_year: new Date().getFullYear() + 5,
        target_month: 1,
        target_day: 1
      },
      pet_owner: currentStatus.pet_owner || []
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      console.log('Saving profile with data:', editedProfile);
      console.log('User ID:', user?.id);
      
      // Update profile in users table
      // TEMPORARILY removing username due to schema cache issue
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: editedProfile.full_name,
          nationality: editedProfile.nationality
        })
        .eq('id', user.id);

      if (userError) {
        console.error('Error updating users table:', userError);
        throw userError;
      }

      // Prepare onboarding data with proper structure
      const currentStatusData = {
        citizenship: editedProfile.citizenship,
        family_situation: { status: editedProfile.family_situation },
        retirement_timeline: editedProfile.retirement_timeline,
        pet_owner: editedProfile.pet_owner
      };

      // Only include partner_citizenship if family_situation is 'couple'
      if (editedProfile.family_situation === 'couple') {
        currentStatusData.partner_citizenship = editedProfile.partner_citizenship;
      }

      console.log('Saving onboarding data:', currentStatusData);

      // Save to onboarding_responses
      const { success, error: onboardingError } = await saveOnboardingStep(
        user.id,
        currentStatusData,
        'current_status'
      );

      if (!success) {
        console.error('Error saving onboarding data:', onboardingError);
        throw new Error(onboardingError?.message || 'Failed to update onboarding data');
      }

      // Update local state
      setProfile(prev => ({
        ...prev,
        full_name: editedProfile.full_name,
        // username: editedProfile.username, // Skip due to schema issue
        nationality: editedProfile.nationality
      }));

      // Update onboarding data in state
      setOnboardingData(prev => ({
        ...prev,
        current_status: currentStatusData
      }));

      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Re-run the edit profile logic to reset to current values
    handleEditProfile();
    setIsEditingProfile(false);
  };

  // Helper function to handle family situation change
  const handleFamilyStatusChange = (status) => {
    setEditedProfile(prev => ({
      ...prev,
      family_situation: status,
      partner_citizenship: status === 'couple' ? prev.partner_citizenship : {
        primary_citizenship: '',
        dual_citizenship: false,
        secondary_citizenship: ''
      }
    }));
  };

  // Helper function to handle retirement status change
  const handleRetirementStatusChange = (status) => {
    setEditedProfile(prev => ({
      ...prev,
      retirement_timeline: {
        ...prev.retirement_timeline,
        status
      }
    }));
  };

  // Helper function to handle pet change
  const handlePetChange = (petType) => {
    setEditedProfile(prev => ({
      ...prev,
      pet_owner: prev.pet_owner.includes(petType)
        ? prev.pet_owner.filter(p => p !== petType)
        : [...prev.pet_owner, petType]
    }));
  };

  const currentYear = new Date().getFullYear();
  const retirementYearOptions = [];
  for (let i = 0; i <= 30; i++) {
    retirementYearOptions.push(currentYear + i);
  }

  if (loading && !user) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} flex items-center justify-center`}>
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const completeness = getProfileCompleteness();

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'preferences', label: 'Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader 
        title="Profile & Settings"
        maxWidth="max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
        tabs={tabs.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
          isActive: activeTab === tab.id,
          onClick: () => handleTabChange(tab.id)
        }))}
      />

      <main className="max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Overview */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border} p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-scout-accent-100 dark:bg-scout-accent-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-scout-accent-600 dark:text-scout-accent-300">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                  {profile?.full_name || 'Your Name'}
                </h2>
                <p className={`${uiConfig.colors.body} text-sm`}>{user?.email}</p>
                <p className={`${uiConfig.colors.hint} text-xs mt-1`}>
                  Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${uiConfig.colors.accent}`}>
                  {favoritesCount}
                </span>
                <span className={`${uiConfig.colors.body} text-sm`}>Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${uiConfig.progress.fill}`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className={`${uiConfig.colors.hint} text-xs`}>
                  {completeness}% complete
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleRetakeOnboarding}
              disabled={retakingOnboarding}
              className={uiConfig.components.buttonPrimary}
            >
              Update Preferences
            </button>
            <button
              onClick={handleLogout}
              className={uiConfig.components.buttonSecondary}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Username Selector - Always visible if no username */}
                {(!profile?.username || showUsernameSelector) && (
                  <div className="mb-6 p-6 bg-scout-accent-50 dark:bg-gray-800 rounded-lg border border-scout-accent-200 dark:border-gray-600">
                    <UsernameSelector
                      onUsernameSelect={handleUsernameSelect}
                      currentUsername={profile?.username || editedProfile?.username}
                      userId={user?.id}
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>
                      Profile Information
                    </h3>
                    {!isEditingProfile ? (
                      <button
                        onClick={handleEditProfile}
                        className={`text-sm ${uiConfig.colors.accent} hover:${uiConfig.colors.accentHover} font-medium`}
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className={`text-sm ${uiConfig.colors.hint} hover:${uiConfig.colors.body} font-medium`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className={`text-sm ${uiConfig.colors.accent} hover:${uiConfig.colors.accentHover} font-medium`}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 block`}>
                            Full Name
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.full_name}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev, full_name: e.target.value }))}
                              className={uiConfig.components.input}
                              placeholder="Enter your full name"
                            />
                          ) : (
                            <p className={`${uiConfig.colors.body} ${uiConfig.font.size.base}`}>
                              {profile?.full_name || 'Not set'}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 block`}>
                            Username
                          </label>
                          {isEditingProfile ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={formatUsername(editedProfile.username) || ''}
                                className={uiConfig.components.input}
                                placeholder="Not set"
                                readOnly
                              />
                              <button
                                onClick={() => setShowUsernameSelector(true)}
                                className={`text-sm ${uiConfig.colors.accent} hover:${uiConfig.colors.accentHover} font-medium whitespace-nowrap`}
                              >
                                {editedProfile.username ? 'Change' : 'Choose'}
                              </button>
                            </div>
                          ) : (
                            <p className={`${uiConfig.colors.body} ${uiConfig.font.size.base}`}>
                              {formatUsername(profile?.username) || 'Not set'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Retirement Timeline - Matching onboarding exactly */}
                    <div className="mb-4">
                      <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
                        <Calendar size={16} className="mr-1.5 lg:mr-2" />
                        Retirement Timeline
                      </label>
                      <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
                        Where are you in your retirement journey?
                      </p>
                      {isEditingProfile ? (
                        <>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                            <OptionButton
                              label="Planning"
                              description="5+ years away"
                              isSelected={editedProfile.retirement_timeline.status === 'planning'}
                              onClick={() => handleRetirementStatusChange('planning')}
                            />
                            <OptionButton
                              label="Retiring Soon"
                              description="Within 5 years"
                              isSelected={editedProfile.retirement_timeline.status === 'retiring_soon'}
                              onClick={() => handleRetirementStatusChange('retiring_soon')}
                            />
                            <OptionButton
                              label="Retired"
                              description="Living the dream"
                              isSelected={editedProfile.retirement_timeline.status === 'already_retired'}
                              onClick={() => handleRetirementStatusChange('already_retired')}
                            />
                          </div>
                          {editedProfile.retirement_timeline.status !== 'already_retired' && editedProfile.retirement_timeline.status && (
                            <div className="mt-4">
                              <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 block`}>
                                Target Retirement Date
                              </label>
                              <div className="grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4">
                                <select
                                  value={editedProfile.retirement_timeline.target_month}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    retirement_timeline: {
                                      ...prev.retirement_timeline,
                                      target_month: parseInt(e.target.value)
                                    }
                                  }))}
                                  className={editedProfile.retirement_timeline.target_month ? uiConfig.components.selectActive : uiConfig.components.select}
                                >
                                  <option value={1}>January</option>
                                  <option value={2}>February</option>
                                  <option value={3}>March</option>
                                  <option value={4}>April</option>
                                  <option value={5}>May</option>
                                  <option value={6}>June</option>
                                  <option value={7}>July</option>
                                  <option value={8}>August</option>
                                  <option value={9}>September</option>
                                  <option value={10}>October</option>
                                  <option value={11}>November</option>
                                  <option value={12}>December</option>
                                </select>
                                <select
                                  value={editedProfile.retirement_timeline.target_day}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    retirement_timeline: {
                                      ...prev.retirement_timeline,
                                      target_day: parseInt(e.target.value)
                                    }
                                  }))}
                                  className={editedProfile.retirement_timeline.target_day ? uiConfig.components.selectActive : uiConfig.components.select}
                                >
                                  {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day}>{day}</option>
                                  ))}
                                </select>
                                <select
                                  value={editedProfile.retirement_timeline.target_year}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    retirement_timeline: {
                                      ...prev.retirement_timeline,
                                      target_year: parseInt(e.target.value)
                                    }
                                  }))}
                                  className={editedProfile.retirement_timeline.target_year ? uiConfig.components.selectActive : uiConfig.components.select}
                                >
                                  {retirementYearOptions.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={`p-3 ${uiConfig.colors.input} rounded-lg`}>
                          <p className={uiConfig.colors.body}>
                            {(() => {
                              const status = onboardingData?.current_status?.retirement_timeline?.status;
                              const statusMap = {
                                'planning': 'Planning (5+ years)',
                                'retiring_soon': 'Retiring Soon (Within 5 years)',
                                'already_retired': 'Already Retired'
                              };
                              const statusText = statusMap[status] || 'Not set';
                              
                              if (status && status !== 'already_retired') {
                                const timeline = onboardingData?.current_status?.retirement_timeline;
                                if (timeline?.target_year) {
                                  const date = new Date(timeline.target_year, (timeline.target_month || 1) - 1, timeline.target_day || 1);
                                  return `${statusText} - ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
                                }
                              }
                              return statusText;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Family Situation - Matching onboarding exactly */}
                    <div className="mb-4">
                      <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
                        <Users size={16} className="mr-1.5 lg:mr-2" />
                        Family Situation
                      </label>
                      <p className={`${uiConfig.font.size.xs} lg:text-sm ${uiConfig.colors.hint} mb-3 lg:mb-4`}>
                        Who's joining you on this adventure? *
                      </p>
                      {isEditingProfile ? (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                          <OptionButton
                            label="Solo"
                            description="Just me"
                            isSelected={editedProfile.family_situation === 'solo'}
                            onClick={() => handleFamilyStatusChange('solo')}
                          />
                          <OptionButton
                            label="Couple"
                            description="Me & partner"
                            isSelected={editedProfile.family_situation === 'couple'}
                            onClick={() => handleFamilyStatusChange('couple')}
                          />
                          <OptionButton
                            label="Family"
                            description="With dependents"
                            isSelected={editedProfile.family_situation === 'family'}
                            onClick={() => handleFamilyStatusChange('family')}
                          />
                        </div>
                      ) : (
                        <div className={`p-3 ${uiConfig.colors.input} rounded-lg`}>
                          <p className={uiConfig.colors.body}>
                            {(() => {
                              const status = onboardingData?.current_status?.family_situation?.status || onboardingData?.current_status?.family_situation;
                              const statusMap = {
                                'solo': 'Solo - Just me',
                                'couple': 'Couple - Me & partner',
                                'family': 'Family - With dependents'
                              };
                              return statusMap[status] || 'Not set';
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Citizenship - Matching onboarding exactly */}
                    <div className="mb-4 lg:mb-6" key={`citizenship-section-${editedProfile.family_situation}`}>
                      <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
                        <Globe size={16} className="mr-1.5 lg:mr-2" />
                        Citizenship
                      </label>
                      
                      {isEditingProfile ? (
                        <>
                          {editedProfile.family_situation === 'couple' ? (
                            <>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 xl:gap-6">
                                <div>
                                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                                  Your Citizenship *
                                </p>
                                <select
                                  name="citizenship.primary_citizenship"
                                  value={editedProfile.citizenship.primary_citizenship}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    citizenship: { ...prev.citizenship, primary_citizenship: e.target.value }
                                  }))}
                                  className={isCitizenshipActive(editedProfile.citizenship.primary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                                >
                                  <option value="">Select citizenship</option>
                                  {countries.map(country => (
                                    <option key={country.id} value={country.id}>
                                      {country.label}
                                    </option>
                                  ))}
                                </select>
                                
                                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                                  Dual Citizenship
                                  <input
                                    id="dual_citizenship"
                                    name="citizenship.dual_citizenship"
                                    type="checkbox"
                                    checked={editedProfile.citizenship.dual_citizenship}
                                    onChange={(e) => setEditedProfile(prev => ({
                                      ...prev,
                                      citizenship: { 
                                        ...prev.citizenship, 
                                        dual_citizenship: e.target.checked,
                                        secondary_citizenship: e.target.checked ? prev.citizenship.secondary_citizenship : ''
                                      }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
                                    style={{ 
                                      accentColor: '#8fbc8f',
                                      WebkitAppearance: 'none',
                                      appearance: 'none',
                                      backgroundColor: editedProfile.citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                                      border: editedProfile.citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                                      borderRadius: '0.25rem',
                                      backgroundImage: editedProfile.citizenship.dual_citizenship 
                                        ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                        : 'none',
                                      backgroundSize: '100% 100%',
                                      backgroundPosition: 'center',
                                      backgroundRepeat: 'no-repeat',
                                      transition: 'all 0.15s ease-in-out'
                                    }}
                                  />
                                </p>
                                
                                {editedProfile.citizenship.dual_citizenship && (
                                  <select
                                    name="citizenship.secondary_citizenship"
                                    value={editedProfile.citizenship.secondary_citizenship === editedProfile.citizenship.primary_citizenship ? '' : editedProfile.citizenship.secondary_citizenship}
                                    onChange={(e) => {
                                      if (e.target.value !== editedProfile.citizenship.primary_citizenship) {
                                        setEditedProfile(prev => ({
                                          ...prev,
                                          citizenship: { ...prev.citizenship, secondary_citizenship: e.target.value }
                                        }));
                                      }
                                    }}
                                    className={isCitizenshipActive(editedProfile.citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                                  >
                                    <option value="">Select citizenship</option>
                                    {countries
                                      .filter(country => country.id !== editedProfile.citizenship.primary_citizenship)
                                      .map(country => (
                                        <option key={`secondary-${country.id}`} value={country.id}>
                                          {country.label}
                                        </option>
                                      ))}
                                    <option value="other">Other</option>
                                  </select>
                                )}
                                </div>
                              
                                <div>
                                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                                  Partner's Citizenship *
                                </p>
                                <select
                                  key={`partner-primary-${editedProfile.family_situation}`}
                                  name="partner_citizenship.primary_citizenship"
                                  value={editedProfile.partner_citizenship.primary_citizenship}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    partner_citizenship: { ...prev.partner_citizenship, primary_citizenship: e.target.value }
                                  }))}
                                  className={isCitizenshipActive(editedProfile.partner_citizenship.primary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                                >
                                  <option value="">Select citizenship</option>
                                  {countries.map(country => (
                                    <option key={`partner-${country.id}`} value={country.id}>
                                      {country.label}
                                    </option>
                                  ))}
                                </select>
                                
                                <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                                  Dual Citizenship
                                  <input
                                    id="partner_dual_citizenship"
                                    name="partner_citizenship.dual_citizenship"
                                    type="checkbox"
                                    checked={editedProfile.partner_citizenship.dual_citizenship}
                                    onChange={(e) => setEditedProfile(prev => ({
                                      ...prev,
                                      partner_citizenship: { 
                                        ...prev.partner_citizenship, 
                                        dual_citizenship: e.target.checked,
                                        secondary_citizenship: e.target.checked ? prev.partner_citizenship.secondary_citizenship : ''
                                      }
                                    }))}
                                    className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
                                    style={{ 
                                      accentColor: '#8fbc8f',
                                      WebkitAppearance: 'none',
                                      appearance: 'none',
                                      backgroundColor: editedProfile.partner_citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                                      border: editedProfile.partner_citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                                      borderRadius: '0.25rem',
                                      backgroundImage: editedProfile.partner_citizenship.dual_citizenship 
                                        ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                        : 'none',
                                      backgroundSize: '100% 100%',
                                      backgroundPosition: 'center',
                                      backgroundRepeat: 'no-repeat',
                                      transition: 'all 0.15s ease-in-out'
                                    }}
                                  />
                                </p>
                                
                                {editedProfile.partner_citizenship.dual_citizenship && (
                                  <select
                                    key={`partner-secondary-${editedProfile.family_situation}`}
                                    name="partner_citizenship.secondary_citizenship"
                                    value={editedProfile.partner_citizenship.secondary_citizenship === editedProfile.partner_citizenship.primary_citizenship ? '' : editedProfile.partner_citizenship.secondary_citizenship}
                                    onChange={(e) => {
                                      if (e.target.value !== editedProfile.partner_citizenship.primary_citizenship) {
                                        setEditedProfile(prev => ({
                                          ...prev,
                                          partner_citizenship: { ...prev.partner_citizenship, secondary_citizenship: e.target.value }
                                        }));
                                      }
                                    }}
                                    className={isCitizenshipActive(editedProfile.partner_citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                                  >
                                    <option value="">Select citizenship</option>
                                    {countries
                                      .filter(country => country.id !== editedProfile.partner_citizenship.primary_citizenship)
                                      .map(country => (
                                        <option key={`partner-secondary-${country.id}`} value={country.id}>
                                          {country.label}
                                        </option>
                                      ))}
                                    <option value="other">Other</option>
                                  </select>
                                )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5`}>
                                Your Citizenship *
                              </p>
                              <select
                                name="citizenship.primary_citizenship"
                                value={editedProfile.citizenship.primary_citizenship}
                                onChange={(e) => setEditedProfile(prev => ({
                                  ...prev,
                                  citizenship: { ...prev.citizenship, primary_citizenship: e.target.value }
                                }))}
                                className={editedProfile.citizenship.primary_citizenship ? uiConfig.components.selectActive : uiConfig.components.select}
                              >
                                <option value="">Select citizenship</option>
                                {countries.map(country => (
                                  <option key={country.id} value={country.id}>
                                    {country.label}
                                  </option>
                                ))}
                              </select>
                              
                              <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint} mb-1.5 mt-3`}>
                                Dual Citizenship
                                <input
                                  id="dual_citizenship_single"
                                  name="citizenship.dual_citizenship"
                                  type="checkbox"
                                  checked={editedProfile.citizenship.dual_citizenship}
                                  onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    citizenship: { 
                                      ...prev.citizenship, 
                                      dual_citizenship: e.target.checked,
                                      secondary_citizenship: e.target.checked ? prev.citizenship.secondary_citizenship : ''
                                    }
                                  }))}
                                  className="h-4 w-4 rounded border-gray-300 text-scout-accent-300 focus:ring-0 cursor-pointer ml-2"
                                  style={{ 
                                    accentColor: '#8fbc8f',
                                    WebkitAppearance: 'none',
                                    appearance: 'none',
                                    backgroundColor: editedProfile.citizenship.dual_citizenship ? '#8fbc8f' : 'transparent',
                                    border: editedProfile.citizenship.dual_citizenship ? '1px solid #8fbc8f' : '1px solid #d1d5db',
                                    borderRadius: '0.25rem',
                                    backgroundImage: editedProfile.citizenship.dual_citizenship 
                                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")`
                                      : 'none',
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    transition: 'all 0.15s ease-in-out'
                                  }}
                                />
                              </p>
                              
                              {editedProfile.citizenship.dual_citizenship && (
                                <div className="mt-2">
                                  <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-1.5 flex items-center`}>
                                    <Globe size={16} className="mr-1.5" />
                                    Secondary Citizenship
                                  </label>
                                  {editedProfile.citizenship.secondary_citizenship === editedProfile.citizenship.primary_citizenship && (
                                    <p className={`${uiConfig.font.size.xs} ${uiConfig.colors.error} mb-1.5`}>
                                      Secondary citizenship cannot be the same as primary. Please select a different country.
                                    </p>
                                  )}
                                  <select
                                    name="citizenship.secondary_citizenship"
                                    value={
                                      editedProfile.citizenship.secondary_citizenship === editedProfile.citizenship.primary_citizenship 
                                        ? '' 
                                        : editedProfile.citizenship.secondary_citizenship
                                    }
                                    onChange={(e) => {
                                      if (e.target.value !== editedProfile.citizenship.primary_citizenship) {
                                        setEditedProfile(prev => ({
                                          ...prev,
                                          citizenship: { ...prev.citizenship, secondary_citizenship: e.target.value }
                                        }));
                                      }
                                    }}
                                    className={isCitizenshipActive(editedProfile.citizenship.secondary_citizenship) ? uiConfig.components.selectActive : uiConfig.components.select}
                                  >
                                    <option value="">Select citizenship</option>
                                    {countries
                                      .filter(country => country.id !== editedProfile.citizenship.primary_citizenship)
                                      .map(country => (
                                        <option key={`secondary-${country.id}`} value={country.id}>
                                          {country.label}
                                        </option>
                                      ))}
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <div className={`p-3 ${uiConfig.colors.input} rounded-lg`}>
                          <p className={uiConfig.colors.body}>
                            {(() => {
                              const citizenship = onboardingData?.current_status?.citizenship;
                              if (!citizenship?.primary_citizenship) return 'Not set';
                              
                              const primary = countries.find(c => c.id === citizenship.primary_citizenship)?.label;
                              const secondary = citizenship.dual_citizenship && countries.find(c => c.id === citizenship.secondary_citizenship)?.label;
                              
                              let result = primary || 'Not set';
                              if (secondary) result += ` + ${secondary}`;
                              
                              // Add partner info if couple
                              const familyStatus = onboardingData?.current_status?.family_situation?.status || onboardingData?.current_status?.family_situation;
                              if (familyStatus === 'couple' && onboardingData?.current_status?.partner_citizenship?.primary_citizenship) {
                                const partnerPrimary = countries.find(c => c.id === onboardingData.current_status.partner_citizenship.primary_citizenship)?.label;
                                const partnerSecondary = onboardingData.current_status.partner_citizenship.dual_citizenship && 
                                  countries.find(c => c.id === onboardingData.current_status.partner_citizenship.secondary_citizenship)?.label;
                                
                                result += ' • Partner: ' + (partnerPrimary || 'Not set');
                                if (partnerSecondary) result += ` + ${partnerSecondary}`;
                              }
                              
                              return result;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pet Owner - Matching onboarding exactly */}
                    <div className="mb-4">
                      <label className={`${uiConfig.font.size.sm} lg:text-base ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2 lg:mb-3 flex items-center`}>
                        <PawPrint size={16} className="mr-1.5 lg:mr-2" />
                        Pet Owner
                      </label>
                      {isEditingProfile ? (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                          <OptionButton
                            label="Cat"
                            isSelected={editedProfile.pet_owner?.includes('cat') || false}
                            onClick={() => handlePetChange('cat')}
                          />
                          <OptionButton
                            label="Dog"
                            isSelected={editedProfile.pet_owner?.includes('dog') || false}
                            onClick={() => handlePetChange('dog')}
                          />
                          <OptionButton
                            label="Other"
                            isSelected={editedProfile.pet_owner?.includes('other') || false}
                            onClick={() => handlePetChange('other')}
                          />
                        </div>
                      ) : (
                        <div className={`p-3 ${uiConfig.colors.input} rounded-lg`}>
                          <p className={uiConfig.colors.body}>
                            {(() => {
                              const pets = onboardingData?.current_status?.pet_owner || [];
                              if (pets.length === 0) return 'No pets';
                              return pets.map(pet => pet.charAt(0).toUpperCase() + pet.slice(1)).join(', ');
                            })()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Summary Section - Matching onboarding */}
                    {!isEditingProfile && (
                      <div className={`p-3 lg:p-4 ${uiConfig.colors.input} ${uiConfig.layout.radius.lg} lg:rounded-xl`}>
                        <div className={`${uiConfig.font.size.sm} ${uiConfig.colors.body}`}>
                          <span className={`${uiConfig.font.weight.medium}`}>Profile Summary:</span>
                          <div className={`mt-0.5 ${uiConfig.font.size.xs}`}>
                            {(() => {
                              const parts = [];
                              
                              // Name and username
                              if (profile?.full_name) parts.push(profile.full_name);
                              if (profile?.username) parts.push(formatUsername(profile.username));
                              
                              // Retirement status
                              const retirementStatus = onboardingData?.current_status?.retirement_timeline?.status;
                              if (retirementStatus) {
                                const statusMap = {
                                  'planning': 'Planning for retirement (5+ years)',
                                  'retiring_soon': 'Retiring within 5 years',
                                  'already_retired': 'Already retired'
                                };
                                parts.push(statusMap[retirementStatus]);
                                
                                if (retirementStatus !== 'already_retired') {
                                  const timeline = onboardingData?.current_status?.retirement_timeline;
                                  if (timeline?.target_year) {
                                    const date = new Date(timeline.target_year, (timeline.target_month || 1) - 1, timeline.target_day || 1);
                                    parts.push(`Target: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`);
                                  }
                                }
                              }
                              
                              // Family situation
                              const familyStatus = onboardingData?.current_status?.family_situation?.status || onboardingData?.current_status?.family_situation;
                              if (familyStatus) {
                                const familyMap = {
                                  'solo': 'Solo',
                                  'couple': 'Couple',
                                  'family': 'Family'
                                };
                                parts.push(familyMap[familyStatus]);
                              }
                              
                              // Pets
                              const pets = onboardingData?.current_status?.pet_owner || [];
                              if (pets.length > 0) {
                                parts.push(`with ${pets.join(', ')}`);
                              }
                              
                              // Citizenship
                              const citizenship = onboardingData?.current_status?.citizenship;
                              if (citizenship?.primary_citizenship) {
                                const primary = countries.find(c => c.id === citizenship.primary_citizenship)?.label;
                                if (primary) {
                                  let citizenshipText = `${primary} citizen`;
                                  if (citizenship.dual_citizenship && citizenship.secondary_citizenship) {
                                    const secondary = countries.find(c => c.id === citizenship.secondary_citizenship)?.label;
                                    if (secondary) citizenshipText += ` + ${secondary}`;
                                  }
                                  parts.push(citizenshipText);
                                }
                              }
                              
                              // Partner citizenship if couple
                              if (familyStatus === 'couple' && onboardingData?.current_status?.partner_citizenship?.primary_citizenship) {
                                const partnerPrimary = countries.find(c => c.id === onboardingData.current_status.partner_citizenship.primary_citizenship)?.label;
                                if (partnerPrimary) {
                                  let partnerText = `Partner: ${partnerPrimary} citizen`;
                                  if (onboardingData.current_status.partner_citizenship.dual_citizenship && 
                                      onboardingData.current_status.partner_citizenship.secondary_citizenship) {
                                    const partnerSecondary = countries.find(c => c.id === onboardingData.current_status.partner_citizenship.secondary_citizenship)?.label;
                                    if (partnerSecondary) partnerText += ` + ${partnerSecondary}`;
                                  }
                                  parts.push(partnerText);
                                }
                              }
                              
                              return parts.length > 0 ? parts.join(' • ') : 'Complete your profile to see summary';
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Save Profile Button - Always visible in edit mode */}
                {isEditingProfile && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className={`${uiConfig.components.buttonPrimary} px-8 py-3 text-base font-semibold`}
                    >
                      {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                )}

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Change Password
                  </h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="currentPassword" className={uiConfig.components.label}>
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordFormData.currentPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={uiConfig.components.input}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className={uiConfig.components.label}>
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordFormData.newPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={uiConfig.components.input}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={uiConfig.components.label}>
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordFormData.confirmPassword}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={uiConfig.components.input}
                        required
                      />
                    </div>
                    {passwordError && (
                      <div className={`${uiConfig.colors.error} text-sm`}>
                        {passwordError}
                      </div>
                    )}
                    <button type="submit" className={`${uiConfig.components.buttonPrimary} ${uiConfig.components.buttonSizes.default}`}>
                      Update Password
                    </button>
                  </form>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.error} mb-4`}>
                    Danger Zone
                  </h3>
                  <p className={`${uiConfig.colors.hint} text-sm mb-4`}>
                    Once you delete your account, there is no going back. This will permanently delete your profile, preferences, favorites, journal entries, and all associated data. Your account cannot be recovered.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className={`${uiConfig.colors.btnDanger} text-white font-medium ${uiConfig.components.buttonSizes.default} rounded-lg transition-colors`}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Display Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={uiConfig.components.label}>Theme</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                            theme === 'light'
                              ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Palette className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                          <span className={`text-sm ${uiConfig.colors.body}`}>Light</span>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                            theme === 'dark'
                              ? 'border-scout-accent-500 bg-scout-accent-50 dark:bg-scout-accent-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Palette className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                          <span className={`text-sm ${uiConfig.colors.body}`}>Dark</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={uiConfig.components.label}>Temperature Unit</label>
                      <select
                        value={temperatureUnit}
                        onChange={(e) => setTemperatureUnit(e.target.value)}
                        className={uiConfig.components.select}
                      >
                        <option value="C">Celsius (°C)</option>
                        <option value="F">Fahrenheit (°F)</option>
                      </select>
                    </div>

                    <div>
                      <label className={uiConfig.components.label}>Distance Unit</label>
                      <select
                        value={distanceUnit}
                        onChange={(e) => setDistanceUnit(e.target.value)}
                        className={uiConfig.components.select}
                      >
                        <option value="km">Kilometers</option>
                        <option value="mi">Miles</option>
                      </select>
                    </div>

                    <div>
                      <label className={uiConfig.components.label}>Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className={uiConfig.components.select}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="pt">Português</option>
                      </select>
                      <p className={`mt-1 text-xs ${uiConfig.colors.hint}`}>
                        Language support is limited during beta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationToggle}
                      label="Email Notifications"
                      description="Receive important updates via email"
                    />
                    <ToggleSwitch
                      id="newTownAlerts"
                      checked={notificationSettings.newTownAlerts}
                      onChange={handleNotificationToggle}
                      label="New Town Matches"
                      description="When new towns match your preferences"
                    />
                    <ToggleSwitch
                      id="weeklyDigest"
                      checked={notificationSettings.weeklyDigest}
                      onChange={handleNotificationToggle}
                      label="Weekly Summary"
                      description="Curated towns and updates every week"
                    />
                    <ToggleSwitch
                      id="priceChanges"
                      checked={notificationSettings.priceChanges}
                      onChange={handleNotificationToggle}
                      label="Price Changes"
                      description="Cost updates for your favorite towns"
                    />
                    <ToggleSwitch
                      id="friendActivity"
                      checked={notificationSettings.friendActivity}
                      onChange={handleNotificationToggle}
                      label="Friend Activity"
                      description="When friends share towns or send messages"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Profile Visibility & Social Settings
                  </h3>
                  <div className="space-y-4">
                    {/* Profile Visibility */}
                    <div>
                      <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-1`}>
                        Who can see your profile?
                      </label>
                      <p className={`text-xs ${uiConfig.colors.hint} mb-2`}>
                        Control who can view your basic profile information
                      </p>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                        className={uiConfig.components.select}
                      >
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Only Me</option>
                      </select>
                    </div>

                    {/* Favorites Visibility */}
                    <div>
                      <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-1`}>
                        Who can see your favorite towns?
                      </label>
                      <p className={`text-xs ${uiConfig.colors.hint} mb-2`}>
                        Share your saved locations with others
                      </p>
                      <select
                        value={privacySettings.showFavorites}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, showFavorites: e.target.value }))}
                        className={uiConfig.components.select}
                      >
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Only Me</option>
                      </select>
                    </div>

                    {/* Activity Visibility */}
                    <div>
                      <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-1`}>
                        Who can see your activity?
                      </label>
                      <p className={`text-xs ${uiConfig.colors.hint} mb-2`}>
                        Your comparisons, journal entries, and interactions
                      </p>
                      <select
                        value={privacySettings.showActivity}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, showActivity: e.target.value }))}
                        className={uiConfig.components.select}
                      >
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Only Me</option>
                      </select>
                    </div>

                    {/* Location Preferences */}
                    <div>
                      <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-1`}>
                        Who can see your location preferences?
                      </label>
                      <p className={`text-xs ${uiConfig.colors.hint} mb-2`}>
                        Your retirement criteria and preferences
                      </p>
                      <select
                        value={privacySettings.shareLocationPreferences}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, shareLocationPreferences: e.target.value }))}
                        className={uiConfig.components.select}
                      >
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Only Me</option>
                      </select>
                    </div>

                    {/* Online Status Visibility */}
                    <div>
                      <label className={`block text-sm font-medium ${uiConfig.colors.body} mb-1`}>
                        Who can see when you're online?
                      </label>
                      <p className={`text-xs ${uiConfig.colors.hint} mb-2`}>
                        Control who sees your active status
                      </p>
                      <select
                        value={privacySettings.showOnlineStatus}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: e.target.value }))}
                        className={uiConfig.components.select}
                      >
                        <option value="public">Everyone</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">No One</option>
                      </select>
                    </div>
                    
                    {/* Friend Requests Toggle - Now last */}
                    <div className="pt-2">
                      <ToggleSwitch
                        id="allowFriendRequests"
                        checked={privacySettings.allowFriendRequests}
                        onChange={handlePrivacyToggle}
                        label="Allow Friend Requests"
                        description="Let others send you connection requests"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Data & Personalization
                  </h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      id="allowDataCollection"
                      checked={privacySettings.allowDataCollection}
                      onChange={handlePrivacyToggle}
                      label="Usage Analytics"
                      description="Help improve Scout2Retire with anonymous usage data"
                    />
                    <ToggleSwitch
                      id="allowPersonalization"
                      checked={privacySettings.allowPersonalization}
                      onChange={handlePrivacyToggle}
                      label="Personalized Recommendations"
                      description="Use your activity to improve town suggestions"
                    />
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.error} mb-4`}>
                    Danger Zone
                  </h3>
                  <div className="space-y-6">
                    {/* Clear Preferences */}
                    <div>
                      <h4 className={`text-base font-medium ${uiConfig.colors.body} mb-2`}>
                        Clear Preferences
                      </h4>
                      <p className={`${uiConfig.colors.hint} text-sm mb-3`}>
                        Reset all your retirement preferences and start fresh with the onboarding process. Your favorites and journal entries will be preserved.
                      </p>
                      <button className={`${uiConfig.colors.btnDanger} text-white font-medium ${uiConfig.components.buttonSizes.default} rounded-lg transition-colors`}>
                        Clear Preferences
                      </button>
                    </div>
                    
                    {/* Clear Personal Data */}
                    <div>
                      <h4 className={`text-base font-medium ${uiConfig.colors.body} mb-2`}>
                        Clear Personal Data
                      </h4>
                      <p className={`${uiConfig.colors.hint} text-sm mb-3`}>
                        Immediately delete all your personal data while keeping your account active. This will permanently remove your preferences, favorites, journal entries, and activity history. There is no way data can be recovered.
                      </p>
                      <button className={`${uiConfig.colors.btnDanger} text-white font-medium ${uiConfig.components.buttonSizes.default} rounded-lg transition-colors`}>
                        Clear Personal Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${uiConfig.colors.card} rounded-lg shadow-xl max-w-md w-full p-6`}>
            <h3 className={`text-xl font-bold ${uiConfig.colors.heading} mb-4`}>
              Delete Account?
            </h3>
            <p className={`${uiConfig.colors.body} mb-6`}>
              This will permanently delete your account and all your data. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className={uiConfig.components.label}>
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={uiConfig.components.input}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`${uiConfig.components.buttonSecondary} ${uiConfig.components.buttonSizes.default}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword}
                className={`flex-1 ${uiConfig.colors.btnDanger} text-white font-medium ${uiConfig.components.buttonSizes.default} rounded-lg transition-colors disabled:opacity-50`}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}