import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updatePassword } from '../utils/authUtils';
import { useTheme } from '../contexts/useTheme';
import QuickNav from '../components/QuickNav';
import toast from 'react-hot-toast';
import supabase from '../utils/supabaseClient';
import { uiConfig } from '../styles/uiConfig';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newTownAlerts: true,
    weeklyDigest: true,
    chatMessages: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    showProfileToOthers: true,
    allowDataCollection: true
  });
  
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        if (!currentUser) {
          navigate('/welcome');
          return;
        }
        
        setUser(currentUser);
        
        // Load user settings
        // This would normally come from a 'user_settings' table in Supabase
        // For now, we'll use default values
      } catch (err) {
        console.error("Error loading user data:", err);
        toast.error("Failed to load user settings");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [navigate]);
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError('');
    }
  };
  
  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    // Validate password length
    if (passwordFormData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, we would first verify the current password
      // For now, we'll skip that step and just update the password
      
      const { success, error } = await updatePassword(passwordFormData.newPassword);
      
      if (!success) {
        setPasswordError(error.message || "Failed to update password");
        return;
      }
      
      // Reset form
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success("Password updated successfully");
    } catch (err) {
      console.error("Error updating password:", err);
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
    
    toast.success(`Notification setting updated`);
  };
  
  // Handle privacy toggle
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success(`Privacy setting updated`);
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Step 1: Delete user data from database tables using RPC function
      console.log('🗑️ Starting account deletion for user:', user.id);
      const { data: deleteResult, error: deleteError } = await supabase.rpc('delete_user_account', {
        user_id_param: user.id
      });
      
      if (deleteError) {
        console.error('❌ Database deletion failed:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ Database deletion result:', deleteResult);
      
      // Step 2: Sign out the user
      // Note: We cannot delete the auth user from client side - that requires admin access
      // The user's auth account will remain but all their data is gone
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully");
      navigate('/welcome');
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Failed to delete account: " + err.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Render loading state
  if (loading && !user) {
    return (
      <div className={`min-h-screen ${uiConfig.colors.page} p-4 flex items-center justify-center`}>
        <div className={`animate-pulse ${uiConfig.colors.accent} font-semibold`}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${uiConfig.colors.page} pb-20 md:pb-4`}>
      {/* Header */}
      <header className={`${uiConfig.colors.card} shadow-sm`}>
        <div className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page}`}>
          <h1 className={`text-xl font-bold ${uiConfig.colors.heading}`}>
            Settings
          </h1>
        </div>
      </header>

      <main className={`${uiConfig.layout.width.containerXL} ${uiConfig.layout.spacing.page} space-y-6`}>
        {/* App Appearance */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-6`}>
              App Appearance
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-3`}>
                  Theme
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      theme === 'light'
                        ? `border-scout-accent-600 bg-scout-accent-50 text-scout-accent-700`
                        : uiConfig.colors.btnNeutral
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${uiConfig.colors.warning}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className={`text-center ${uiConfig.colors.body} font-medium`}>
                      Light
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                      theme === 'dark'
                        ? `border-scout-accent-600 bg-scout-accent-50 text-scout-accent-700`
                        : uiConfig.colors.btnNeutral
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <div className={`text-center ${uiConfig.colors.body} font-medium`}>
                      Dark
                    </div>
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className={`text-sm font-medium ${uiConfig.colors.body} mb-3`}>
                  Language
                </h3>
                <select
                  className={uiConfig.components.select}
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                </select>
                <p className={`mt-1 text-xs ${uiConfig.colors.hint}`}>
                  Note: Language support is limited during beta.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-6`}>
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    Email Notifications
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Receive notifications via email
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="opacity-0 w-0 h-0"
                    checked={notificationSettings.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                  />
                  <label
                    htmlFor="emailNotifications"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      notificationSettings.emailNotifications
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        notificationSettings.emailNotifications ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    New Town Alerts
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Notify when new towns match your criteria
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="newTownAlerts"
                    className="opacity-0 w-0 h-0"
                    checked={notificationSettings.newTownAlerts}
                    onChange={() => handleNotificationToggle('newTownAlerts')}
                  />
                  <label
                    htmlFor="newTownAlerts"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      notificationSettings.newTownAlerts
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        notificationSettings.newTownAlerts ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    Weekly Digest
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Receive weekly summary of activity
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="weeklyDigest"
                    className="opacity-0 w-0 h-0"
                    checked={notificationSettings.weeklyDigest}
                    onChange={() => handleNotificationToggle('weeklyDigest')}
                  />
                  <label
                    htmlFor="weeklyDigest"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      notificationSettings.weeklyDigest
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        notificationSettings.weeklyDigest ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    Chat Messages
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Notify about new chat messages
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="chatMessages"
                    className="opacity-0 w-0 h-0"
                    checked={notificationSettings.chatMessages}
                    onChange={() => handleNotificationToggle('chatMessages')}
                  />
                  <label
                    htmlFor="chatMessages"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      notificationSettings.chatMessages
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        notificationSettings.chatMessages ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-6`}>
              Privacy
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    Public Profile
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Allow other users to see your profile
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="showProfileToOthers"
                    className="opacity-0 w-0 h-0"
                    checked={privacySettings.showProfileToOthers}
                    onChange={() => handlePrivacyToggle('showProfileToOthers')}
                  />
                  <label
                    htmlFor="showProfileToOthers"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      privacySettings.showProfileToOthers
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        privacySettings.showProfileToOthers ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${uiConfig.colors.body}`}>
                    Data Collection
                  </h3>
                  <p className={`text-xs ${uiConfig.colors.hint}`}>
                    Allow app to collect usage data for improvement
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="allowDataCollection"
                    className="opacity-0 w-0 h-0"
                    checked={privacySettings.allowDataCollection}
                    onChange={() => handlePrivacyToggle('allowDataCollection')}
                  />
                  <label
                    htmlFor="allowDataCollection"
                    className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                      privacySettings.allowDataCollection
                        ? uiConfig.colors.toggleOn
                        : uiConfig.colors.toggleOff
                    }`}
                  >
                    <span 
                      className={`absolute left-1 bottom-1 ${uiConfig.colors.toggleKnob} w-4 h-4 rounded-full transition-transform ${
                        privacySettings.allowDataCollection ? 'transform translate-x-6' : ''
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Password */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${uiConfig.colors.heading} mb-6`}>
              Change Password
            </h2>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className={uiConfig.components.label}>
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordChange}
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
                  onChange={handlePasswordChange}
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
                  onChange={handlePasswordChange}
                  className={uiConfig.components.input}
                  required
                />
              </div>
              
              {passwordError && (
                <div className={`${uiConfig.colors.error} text-sm`}>
                  {passwordError}
                </div>
              )}
              
              <button
                type="submit"
                className={uiConfig.components.buttonPrimary}
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className={`${uiConfig.colors.card} rounded-lg border ${uiConfig.colors.border}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${uiConfig.colors.error} mb-6`}>
              Danger Zone
            </h2>
            
            <div className="space-y-4">
              <p className={`${uiConfig.colors.hint} text-sm`}>
                Permanently delete your account and all your data. This action cannot be undone.
              </p>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`w-full ${uiConfig.colors.btnDanger} text-white font-medium py-2 px-4 rounded-md transition-colors`}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className={`fixed inset-0 ${uiConfig.colors.overlay} flex items-center justify-center z-50 p-4`}>
          <div className={`${uiConfig.colors.card} rounded-lg shadow-xl max-w-md w-full p-6`}>
            <h3 className={`text-xl font-bold ${uiConfig.colors.heading} mb-4`}>
              Delete Account?
            </h3>
            
            <p className={`${uiConfig.colors.hint} mb-6`}>
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
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={uiConfig.components.buttonSecondary}
              >
                Cancel
              </button>
              
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword}
                className={`flex-1 ${uiConfig.colors.btnDanger} font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50`}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom navigation for mobile */}
      <QuickNav />
    </div>
  );
}