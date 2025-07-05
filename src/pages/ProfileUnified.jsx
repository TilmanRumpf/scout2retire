import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, signOut, updatePassword } from '../utils/authUtils';
import { getOnboardingProgress } from '../utils/onboardingUtils';
import { useTheme } from '../contexts/ThemeContext';
import UnifiedHeader from '../components/UnifiedHeader';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { User, Settings, Bell, Shield, Palette, Globe } from 'lucide-react';

// Debug function for retirement date issue
window.debugRetirementDate = async () => {
  console.log('=== DEBUGGING RETIREMENT DATE ===');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user');
    return;
  }
  
  console.log('User ID:', user.id);
  console.log('User Email:', user.email);
  
  // Get onboarding data
  const { data: onboarding, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error('Error fetching onboarding:', error);
    return;
  }
  
  console.log('Onboarding records found:', onboarding?.length || 0);
  
  if (onboarding && onboarding.length > 0) {
    const data = onboarding[0];
    console.log('Full onboarding data:', data);
    console.log('current_status:', data.current_status);
    console.log('retirement_timeline:', data.current_status?.retirement_timeline);
    
    if (data.current_status?.retirement_timeline) {
      const timeline = data.current_status.retirement_timeline;
      console.log('Timeline fields:', {
        target_year: timeline.target_year,
        target_month: timeline.target_month,
        target_day: timeline.target_day,
        status: timeline.status
      });
    }
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id);
    
  console.log('User profile:', profile?.[0]);
};

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
    showProfileToOthers: true,
    allowDataCollection: true
  });
  
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Set active tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['account', 'preferences', 'notifications', 'privacy'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load user data
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
      
      // Load onboarding data
      const { success, data } = await getOnboardingProgress(currentUser.id);
      
      if (success && data) {
        setOnboardingData(data);
        
        // Fallback: if onboarding data exists but profile doesn't have retirement date,
        // update the profile with the onboarding data
        if (data.current_status?.retirement_timeline && !userProfile?.retirement_date) {
          const timeline = data.current_status.retirement_timeline;
          if (timeline.target_year && timeline.target_month && timeline.target_day) {
            const retirementDate = new Date(timeline.target_year, timeline.target_month - 1, timeline.target_day);
            
            // Update the user's profile with the retirement date
            await supabase
              .from('users')
              .update({ 
                retirement_date: retirementDate.toISOString(),
                retirement_year_estimate: timeline.target_year
              })
              .eq('id', currentUser.id);
          }
        }
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
    } catch (err) {
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
    } catch (err) {
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
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      <UnifiedHeader 
        title="Profile & Settings"
        maxWidth="max-w-4xl"
        tabs={tabs.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
          isActive: activeTab === tab.id,
          onClick: () => handleTabChange(tab.id)
        }))}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className={uiConfig.components.label}>Full Name</label>
                      <p className={uiConfig.colors.body}>{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className={uiConfig.components.label}>Nationality</label>
                      <p className={uiConfig.colors.body}>
                        {(() => {
                          const citizenship = onboardingData?.current_status?.citizenship;
                          if (!citizenship?.primary_citizenship) return 'Not set';
                          
                          let nationalities = citizenship.primary_citizenship.toUpperCase();
                          if (citizenship.dual_citizenship && citizenship.secondary_citizenship) {
                            nationalities += ` / ${citizenship.secondary_citizenship.toUpperCase()}`;
                          }
                          return nationalities;
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className={uiConfig.components.label}>Retirement Date</label>
                      <p className={uiConfig.colors.body}>
                        {(() => {
                          // First check if we have retirement date in profile
                          if (profile?.retirement_date) {
                            return new Date(profile.retirement_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          }
                          
                          // Then check onboarding data
                          const timeline = onboardingData?.current_status?.retirement_timeline;
                          
                          if (!timeline) return 'Not set';
                          
                          if (timeline.status === 'already_retired') {
                            return 'Already retired';
                          }
                          
                          if (timeline.target_year && timeline.target_month && timeline.target_day) {
                            const date = new Date(timeline.target_year, timeline.target_month - 1, timeline.target_day);
                            return date.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          }
                          
                          return 'Not set';
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className={uiConfig.components.label}>Family Status</label>
                      <p className={uiConfig.colors.body}>
                        {(() => {
                          const status = onboardingData?.current_status?.family_situation?.status;
                          if (!status) return 'Not set';
                          
                          const statusMap = {
                            'solo': 'Solo',
                            'couple': 'Couple',
                            'family': 'Family'
                          };
                          
                          return statusMap[status] || status;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

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
                    Once you delete your account, there is no going back.
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
                    Privacy Settings
                  </h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      id="showProfileToOthers"
                      checked={privacySettings.showProfileToOthers}
                      onChange={handlePrivacyToggle}
                      label="Public Profile"
                      description="Allow other users to see your profile"
                    />
                    <ToggleSwitch
                      id="allowDataCollection"
                      checked={privacySettings.allowDataCollection}
                      onChange={handlePrivacyToggle}
                      label="Usage Analytics"
                      description="Help improve Scout2Retire with anonymous data"
                    />
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-4`}>
                    Data Export
                  </h3>
                  <p className={`${uiConfig.colors.body} text-sm mb-4`}>
                    Download all your data including preferences, favorites, and activity.
                  </p>
                  <button className={`${uiConfig.components.buttonSecondary} ${uiConfig.components.buttonSizes.default}`}>
                    Export My Data
                  </button>
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