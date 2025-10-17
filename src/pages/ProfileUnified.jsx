import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, signOut, updatePassword } from '../utils/authUtils';
import { getOnboardingProgress } from '../utils/userpreferences/onboardingUtils';
import { useTheme } from '../contexts/useTheme';
import UnifiedHeader from '../components/UnifiedHeader';
import HeaderSpacer from '../components/HeaderSpacer';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';
import { User, Settings, Bell, Shield, Palette, MapPin } from 'lucide-react';
import { UsernameSelector } from '../components/UsernameSelector';
import AvatarUpload from '../components/AvatarUpload';

// Reusable toggle switch component
const ToggleSwitch = ({ id, checked, onChange, label, description, saveState }) => (
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
    <div className="flex items-center gap-2">
      {saveState === 'saving' && (
        <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
      )}
      {saveState === 'saved' && (
        <span className="text-xs text-green-600 dark:text-green-400">Saved ✓</span>
      )}
      <div className="relative inline-block w-11 h-6">
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
  </div>
);

export default function ProfileUnified() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showUsernameSelector, setShowUsernameSelector] = useState(false);
  
  // Form data for editing
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    hometown: ''
  });
  
  // Settings states
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    friend_requests: true
  });
  
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'friends',
    show_email: false,
    show_location: true
  });

  // Track saving states for visual feedback
  const [savingStates, setSavingStates] = useState({});

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();

  // Load user data
  useEffect(() => {
    async function loadUser() {
      try {
        const result = await getCurrentUser();
        
        if (!result || !result.user) {
          navigate('/welcome');
          return;
        }

        setUser(result.user);
        setProfile(result.profile);

        // Initialize edit form data
        setEditFormData({
          full_name: result.profile?.full_name || result.user.user_metadata?.full_name || '',
          hometown: result.profile?.hometown || ''
        });

        // Load notification and privacy settings from user_preferences
        const { data: prefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('notifications, privacy')
          .eq('user_id', result.user.id)
          .single();

        if (!prefsError && prefs) {
          if (prefs.notifications) {
            setNotifications(prefs.notifications);
          }
          if (prefs.privacy) {
            setPrivacy(prefs.privacy);
          }
        }

        // Load favorites count
        const { count } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', result.user.id);
        
        setFavoritesCount(count || 0);

        // Load onboarding progress
        const progressResult = await getOnboardingProgress(result.user.id);

        if (progressResult.success && progressResult.progress) {
          // The progress object already contains the calculated percentage
          const percentage = progressResult.progress.percentage || 0;
          setOnboardingProgress(percentage);
        } else {
          setOnboardingProgress(0);
        }
        
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editFormData.full_name,
          hometown: editFormData.hometown || null
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        full_name: editFormData.full_name,
        hometown: editFormData.hometown
      }));
      
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      full_name: profile?.full_name || '',
      hometown: profile?.hometown || ''
    });
    setIsEditingProfile(false);
  };

  const handleUsernameUpdate = async (newUsername) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          username: newUsername,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => ({ ...prev, username: newUsername }));
      setShowUsernameSelector(false);
      toast.success('Username updated successfully!');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    }
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
  };

  // Extract just the town/city name from a full address
  const getHometownDisplay = (hometown) => {
    if (!hometown) return 'Not set';
    
    // Split by comma and take the first part (usually the city)
    const parts = hometown.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }
    return hometown;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (changePasswordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      const { success, error } = await updatePassword(
        changePasswordData.currentPassword,
        changePasswordData.newPassword
      );
      
      if (!success) {
        toast.error(error?.message || 'Failed to update password');
        return;
      }
      
      toast.success('Password updated successfully');
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Verify password
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });

      if (signInError || !authUser) {
        toast.error('Invalid password');
        return;
      }

      console.log('🗑️ Starting account deletion for user:', user.id);

      // Step 1: Delete user data from database tables
      console.log('🗑️ Deleting user data from database...');
      const { data: deleteResult, error: deleteError } = await supabase.rpc('delete_user_account', {
        user_id_param: user.id
      });

      if (deleteError) {
        console.error('❌ Database deletion failed:', deleteError);
        throw deleteError;
      }

      console.log('✅ Database deletion result:', deleteResult);

      // Step 2: Delete auth user (this requires admin privileges)
      console.log('🗑️ Deleting auth user...');
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (authDeleteError) {
        console.error('❌ Auth user deletion failed:', authDeleteError);
        // Don't throw - database is already cleaned, just warn user
        toast.error('Account data deleted but auth user could not be removed. Please contact support.');
      } else {
        console.log('✅ Auth user deleted successfully');
      }

      // Step 3: Sign out and redirect
      await signOut();
      navigate('/welcome');
      toast.success('Account deleted successfully');
      
      console.log('✅ Account deletion completed');
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      toast.error(`Failed to delete account: ${error.message}`);
    } finally {
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const handleToggleNotification = async (key) => {
    const newValue = !notifications[key];
    const newNotifications = { ...notifications, [key]: newValue };

    // Update local state immediately for responsiveness
    setNotifications(newNotifications);

    // Show saving indicator
    setSavingStates(prev => ({ ...prev, [`notification_${key}`]: 'saving' }));

    // Save to database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ notifications: newNotifications })
        .eq('user_id', user.id);

      if (error) throw error;

      // Show saved indicator
      setSavingStates(prev => ({ ...prev, [`notification_${key}`]: 'saved' }));

      // Clear saved indicator after 2 seconds
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [`notification_${key}`]: null }));
      }, 2000);
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification setting');
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !newValue }));
      setSavingStates(prev => ({ ...prev, [`notification_${key}`]: null }));
    }
  };

  const handleTogglePrivacy = async (key) => {
    const newValue = !privacy[key];
    const newPrivacy = { ...privacy, [key]: newValue };

    // Update local state immediately
    setPrivacy(newPrivacy);

    // Show saving indicator
    setSavingStates(prev => ({ ...prev, [`privacy_${key}`]: 'saving' }));

    // Save to database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ privacy: newPrivacy })
        .eq('user_id', user.id);

      if (error) throw error;

      // Show saved indicator
      setSavingStates(prev => ({ ...prev, [`privacy_${key}`]: 'saved' }));

      // Clear saved indicator after 2 seconds
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [`privacy_${key}`]: null }));
      }, 2000);
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('Failed to update privacy setting');
      // Revert on error
      setPrivacy(prev => ({ ...prev, [key]: !newValue }));
      setSavingStates(prev => ({ ...prev, [`privacy_${key}`]: null }));
    }
  };

  const handlePrivacyVisibilityChange = async (newValue) => {
    const newPrivacy = { ...privacy, profile_visibility: newValue };

    // Update local state
    setPrivacy(newPrivacy);

    // Show saving indicator
    setSavingStates(prev => ({ ...prev, 'privacy_visibility': 'saving' }));

    // Save to database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ privacy: newPrivacy })
        .eq('user_id', user.id);

      if (error) throw error;

      // Show saved indicator
      setSavingStates(prev => ({ ...prev, 'privacy_visibility': 'saved' }));

      // Clear saved indicator after 2 seconds
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, 'privacy_visibility': null }));
      }, 2000);
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('Failed to update privacy setting');
      // Revert on error
      setPrivacy(prev => ({ ...prev, profile_visibility: privacy.profile_visibility }));
      setSavingStates(prev => ({ ...prev, 'privacy_visibility': null }));
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/welcome');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-[100svh] ${uiConfig.colors.page} flex items-center justify-center`}>
        <div className="text-scout-accent font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100svh] ${uiConfig.colors.page} pb-20 sm:pb-6`}>
      <UnifiedHeader title="Profile" showBack />
      
      {/* Spacer for fixed header */}
      <HeaderSpacer hasFilters={false} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab Navigation */}
        <div className={`flex gap-2 mb-6 border-b ${uiConfig.colors.borderLight}`}>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'account'
                ? `${uiConfig.colors.success} border-b-2 border-scout-accent`
                : `${uiConfig.colors.body} hover:${uiConfig.colors.hint}`
            }`}
          >
            <User size={16} className="inline mr-1.5" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'settings'
                ? `${uiConfig.colors.success} border-b-2 border-scout-accent`
                : `${uiConfig.colors.body} hover:${uiConfig.colors.hint}`
            }`}
          >
            <Settings size={16} className="inline mr-1.5" />
            Settings
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  Account Information
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className={`${uiConfig.font.size.sm} ${uiConfig.colors.success} hover:${uiConfig.colors.successDark} ${uiConfig.font.weight.medium}`}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Avatar */}
                <div className="flex-shrink-0">
                  <AvatarUpload
                    userId={user?.id}
                    currentAvatarUrl={profile?.avatar_url}
                    fullName={profile?.username || user?.email?.split('@')[0]}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                </div>

                {/* Right side - Info Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} block mb-1`}>
                      Email
                    </label>
                    <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
                      {user?.email || 'Not set'}
                    </p>
                  </div>

                  {/* Username */}
                  <div>
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} block mb-1`}>
                      Username
                    </label>
                    <div className="flex items-center gap-2">
                      <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
                        {profile?.username || 'Not set'}
                      </p>
                      <button
                        onClick={() => setShowUsernameSelector(true)}
                        className={`${uiConfig.font.size.sm} ${uiConfig.colors.success} hover:${uiConfig.colors.successDark}`}
                      >
                        {profile?.username ? 'Change' : 'Set Username'}
                      </button>
                    </div>
                  </div>

                  {/* Hometown */}
                  <div>
                    <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} block mb-1`}>
                      <MapPin size={14} className="inline mr-1" />
                      Hometown
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editFormData.hometown}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, hometown: e.target.value }))}
                        className={uiConfig.components.input}
                        placeholder="City, State/Country (optional)"
                      />
                    ) : (
                      <p className={`${uiConfig.font.size.base} ${uiConfig.colors.body}`}>
                        {getHometownDisplay(profile?.hometown)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditingProfile && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveProfile}
                    className={uiConfig.components.buttonPrimary}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={uiConfig.components.buttonSecondary}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Update Preferences Link */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                  Retirement Preferences
                </h3>
                <span className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.success} text-right`}>
                  {onboardingProgress}% Complete
                </span>
              </div>
              <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint} mb-4`}>
                Update your retirement timeline, location preferences, and other details
              </p>
              <button
                onClick={() => navigate('/onboarding/current-status')}
                className={uiConfig.components.buttonPrimary}
              >
                Update Preferences
              </button>
            </div>

            {/* Statistics */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4`}>
                Your Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>Favorites</p>
                  <p className={`${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
                    {favoritesCount}
                  </p>
                </div>
                <div>
                  <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.hint}`}>Member Since</p>
                  <p className={`${uiConfig.font.size.base} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notifications */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4 flex items-center`}>
                <Bell size={18} className="mr-2" />
                Notifications
              </h3>
              <div className="space-y-3">
                <ToggleSwitch
                  id="email_notifications"
                  checked={notifications.email_notifications}
                  onChange={handleToggleNotification}
                  label="Email Notifications"
                  description="Receive updates via email"
                  saveState={savingStates['notification_email_notifications']}
                />
                <ToggleSwitch
                  id="push_notifications"
                  checked={notifications.push_notifications}
                  onChange={handleToggleNotification}
                  label="Push Notifications"
                  description="Get instant alerts on your device"
                  saveState={savingStates['notification_push_notifications']}
                />
                <ToggleSwitch
                  id="weekly_digest"
                  checked={notifications.weekly_digest}
                  onChange={handleToggleNotification}
                  label="Weekly Digest"
                  description="Summary of new retirement destinations"
                  saveState={savingStates['notification_weekly_digest']}
                />
                <ToggleSwitch
                  id="friend_requests"
                  checked={notifications.friend_requests}
                  onChange={handleToggleNotification}
                  label="Friend Requests"
                  description="Alerts for new connection requests"
                  saveState={savingStates['notification_friend_requests']}
                />
              </div>
            </div>

            {/* Privacy */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4 flex items-center`}>
                <Shield size={18} className="mr-2" />
                Privacy
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} block mb-2`}>
                    Profile Visibility
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={privacy.profile_visibility}
                      onChange={(e) => handlePrivacyVisibilityChange(e.target.value)}
                      className={uiConfig.components.select}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                    {savingStates['privacy_visibility'] === 'saving' && (
                      <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
                    )}
                    {savingStates['privacy_visibility'] === 'saved' && (
                      <span className="text-xs text-green-600 dark:text-green-400">Saved ✓</span>
                    )}
                  </div>
                </div>
                <ToggleSwitch
                  id="show_email"
                  checked={privacy.show_email}
                  onChange={handleTogglePrivacy}
                  label="Show Email"
                  description="Display email on your profile"
                  saveState={savingStates['privacy_show_email']}
                />
                <ToggleSwitch
                  id="show_location"
                  checked={privacy.show_location}
                  onChange={handleTogglePrivacy}
                  label="Show Location"
                  description="Display your current location"
                  saveState={savingStates['privacy_show_location']}
                />
              </div>
            </div>

            {/* Appearance */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4 flex items-center`}>
                <Palette size={18} className="mr-2" />
                Appearance
              </h3>
              <div>
                <label className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} block mb-2`}>
                  Theme
                </label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={uiConfig.components.select}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            {/* Security */}
            <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6`}>
              <h3 className={`${uiConfig.font.size.base} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4`}>
                Security
              </h3>
              
              {/* Change Password */}
              <form onSubmit={handlePasswordChange} className="space-y-4 mb-6">
                <h4 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body}`}>
                  Change Password
                </h4>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={uiConfig.components.input}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={uiConfig.components.input}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={uiConfig.components.input}
                />
                <button
                  type="submit"
                  className={uiConfig.components.buttonPrimary}
                >
                  Update Password
                </button>
              </form>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className={`${uiConfig.components.buttonSecondary} w-full mb-4`}
              >
                Sign Out
              </button>

              {/* Delete Account */}
              <div className={`border-t ${uiConfig.colors.borderLight} pt-4`}>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`${uiConfig.font.size.sm} ${uiConfig.colors.error} hover:${uiConfig.colors.errorDark} ${uiConfig.font.weight.medium}`}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Username Selector Modal */}
      {showUsernameSelector && (
        <UsernameSelector
          currentUsername={profile?.username}
          onSelect={handleUsernameUpdate}
          onClose={() => setShowUsernameSelector(false)}
        />
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6 max-w-md w-full`}>
            <h3 className={`${uiConfig.font.size.lg} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading} mb-4`}>
              Delete Account
            </h3>
            <p className={`${uiConfig.font.size.sm} ${uiConfig.colors.body} mb-4`}>
              This action cannot be undone. Please enter your password to confirm.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={`${uiConfig.components.input} mb-4`}
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className={`${uiConfig.components.buttonPrimary} !bg-red-600 hover:!bg-red-700`}
              >
                Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
                className={uiConfig.components.buttonSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}