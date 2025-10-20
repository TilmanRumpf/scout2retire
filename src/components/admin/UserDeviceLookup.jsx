/**
 * User Device Lookup - Troubleshooting Tool
 *
 * Allows admins to search for users and see their device information
 * for troubleshooting purposes.
 */

import { useState } from 'react';
import { Search, Smartphone, Monitor, Globe, MapPin, Clock, User } from 'lucide-react';
import supabase from '../../utils/supabaseClient';

const UserDeviceLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Search for users by email (case insensitive)
      const { data, error} = await supabase
        .from('users')
        .select(`
          id,
          email,
          last_device_type,
          last_platform,
          last_platform_version,
          last_browser,
          last_browser_version,
          last_user_agent,
          last_login_at,
          last_active_at,
          last_country_name,
          last_region,
          last_city,
          last_timezone,
          total_sessions,
          engagement_tier,
          last_device_manufacturer,
          last_device_model,
          last_device_model_confidence,
          last_screen_resolution,
          last_viewport_size,
          last_pixel_ratio,
          last_orientation,
          last_touch_support,
          last_connection_type
        `)
        .ilike('email', `%${searchTerm}%`)
        .order('last_login_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTierBadge = (tier) => {
    const colors = {
      power_user: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      low: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[tier] || colors.inactive}`}>
        {tier?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="mb-8">
      <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-gray-100">
          <Search className="w-6 h-6 mr-2 text-scout-accent-500" />
          User Device Lookup (Troubleshooting)
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-scout-accent-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-scout-accent-600 hover:bg-scout-accent-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No users found matching "{searchTerm}"
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Found {users.length} user{users.length !== 1 ? 's' : ''}
                </div>
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-scout-accent-400 dark:hover:border-scout-accent-600 transition-colors"
                  >
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {user.total_sessions || 0} sessions
                          </div>
                        </div>
                      </div>
                      {getTierBadge(user.engagement_tier)}
                    </div>

                    {/* ENHANCED Device Info - Organized Sections */}
                    <div className="space-y-4">
                      {/* Section 1: Device Hardware */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                          🖥️ Device Hardware
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <InfoItem
                            label="Exact Device"
                            value={user.last_device_model ?
                              `${user.last_device_manufacturer || ''} ${user.last_device_model}` :
                              user.last_device_type || 'Unknown'}
                            confidence={user.last_device_model_confidence}
                          />
                          <InfoItem
                            label="Device Type"
                            value={(user.last_device_type || 'Unknown').charAt(0).toUpperCase() + (user.last_device_type || 'Unknown').slice(1)}
                            icon={getDeviceIcon(user.last_device_type)}
                          />
                          <InfoItem
                            label="Touch Support"
                            value={user.last_touch_support === true ? '✅ Yes' : user.last_touch_support === false ? '❌ No' : 'Unknown'}
                          />
                        </div>
                      </div>

                      {/* Section 2: Software */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                          💻 Software
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <InfoItem
                            label="Operating System"
                            value={user.last_platform_version ?
                              `${user.last_platform} ${user.last_platform_version}` :
                              user.last_platform || 'Unknown'}
                          />
                          <InfoItem
                            label="Browser"
                            value={user.last_browser_version ?
                              `${user.last_browser} ${user.last_browser_version}` :
                              user.last_browser || 'Unknown'}
                          />
                          <InfoItem
                            label="Connection Type"
                            value={(user.last_connection_type || 'Unknown').toUpperCase()}
                          />
                        </div>
                      </div>

                      {/* Section 3: Display & Resolution */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                          📺 Display & Resolution
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <InfoItem
                            label="Screen Resolution"
                            value={user.last_screen_resolution || 'Unknown'}
                            highlight={true}
                          />
                          <InfoItem
                            label="Viewport Size"
                            value={user.last_viewport_size || 'Unknown'}
                            highlight={true}
                          />
                          <InfoItem
                            label="Pixel Ratio (DPR)"
                            value={user.last_pixel_ratio ? `${user.last_pixel_ratio}x ${user.last_pixel_ratio >= 2 ? '(Retina)' : ''}` : 'Unknown'}
                            highlight={user.last_pixel_ratio >= 2}
                          />
                          <InfoItem
                            label="Orientation"
                            value={(user.last_orientation || 'Unknown').charAt(0).toUpperCase() + (user.last_orientation || 'Unknown').slice(1)}
                          />
                        </div>
                      </div>

                      {/* Section 4: Location & Time */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                          🌍 Location & Time
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <InfoItem
                            label="Location"
                            value={user.last_city && user.last_region
                              ? `${user.last_city}, ${user.last_region}`
                              : user.last_country_name || 'Unknown'}
                            icon={<MapPin className="w-4 h-4 text-gray-500" />}
                          />
                          <InfoItem
                            label="Timezone"
                            value={user.last_timezone || 'Unknown'}
                          />
                          <InfoItem
                            label="Last Login"
                            value={formatDate(user.last_login_at)}
                            icon={<Clock className="w-4 h-4 text-gray-500" />}
                          />
                        </div>
                      </div>
                    </div>

                    {/* User Agent (collapsed by default, show on demand) */}
                    {user.last_user_agent && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-scout-accent-600 dark:text-scout-accent-400 hover:underline">
                          Show User Agent
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                          {user.last_user_agent}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for displaying device info items
const InfoItem = ({ label, value, icon, confidence, highlight }) => (
  <div className={`p-2 rounded ${highlight ? 'bg-scout-accent-50 dark:bg-scout-accent-900/20' : ''}`}>
    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-0.5">
      {icon}
      <span>{label}</span>
      {confidence && (
        <span className={`ml-1 px-1 py-0.5 rounded text-[10px] ${
          confidence === 'exact' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
          confidence === 'group' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {confidence}
        </span>
      )}
    </div>
    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
      {value}
    </div>
  </div>
);

export default UserDeviceLookup;
