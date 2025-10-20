/**
 * User Analytics Dashboard
 *
 * Comprehensive analytics dashboard showing device usage, sessions,
 * engagement, behavior, cohorts, and online hours.
 */

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Zap,
  Eye,
  MousePointer,
  RefreshCw,
  Globe,
  MapPin
} from 'lucide-react';
import supabase from '../../utils/supabaseClient';
import UserDeviceLookup from './UserDeviceLookup';

const UserAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    deviceMetrics: {},
    sessionMetrics: {},
    engagementMetrics: {},
    behaviorMetrics: {},
    cohortMetrics: {},
    onlineHours: {},
    geographicMetrics: {}
  });

  useEffect(() => {
    loadAllAnalytics();
  }, [timeRange]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    await Promise.all([
      loadDeviceMetrics(),
      loadSessionMetrics(),
      loadEngagementMetrics(),
      loadBehaviorMetrics(),
      loadCohortMetrics(),
      loadOnlineHours(),
      loadGeographicMetrics()
    ]);
    setLoading(false);
  };

  const loadDeviceMetrics = async () => {
    try {
      const { data: deviceData } = await supabase
        .from('users')
        .select('last_device_type')
        .not('last_device_type', 'is', null);

      const { data: platformData } = await supabase
        .from('users')
        .select('last_platform')
        .not('last_platform', 'is', null);

      const { data: browserData } = await supabase
        .from('users')
        .select('last_browser')
        .not('last_browser', 'is', null);

      setAnalytics(prev => ({
        ...prev,
        deviceMetrics: {
          deviceDistribution: countDistribution(deviceData || [], 'last_device_type'),
          platformDistribution: countDistribution(platformData || [], 'last_platform'),
          browserDistribution: countDistribution(browserData || [], 'last_browser'),
          totalUsers: deviceData?.length || 0
        }
      }));
    } catch (err) {
      console.error('Error loading device metrics:', err);
    }
  };

  const loadSessionMetrics = async () => {
    try {
      const dateFilter = getDateFilter(timeRange);

      const { count: dauCount } = await supabase
        .from('user_engagement_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('is_dau', true)
        .eq('metric_date', new Date().toISOString().split('T')[0]);

      const { count: mauCount } = await supabase
        .from('user_engagement_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('is_mau', true)
        .eq('metric_date', new Date().toISOString().split('T')[0]);

      const { data: avgDurationData } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .gte('started_at', dateFilter)
        .not('duration_seconds', 'is', null);

      const avgDuration = avgDurationData?.length > 0
        ? Math.round(avgDurationData.reduce((sum, s) => sum + s.duration_seconds, 0) / avgDurationData.length)
        : 0;

      const { count: sessionCount } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', dateFilter);

      const stickinessRatio = mauCount > 0 ? ((dauCount / mauCount) * 100).toFixed(1) : 0;

      setAnalytics(prev => ({
        ...prev,
        sessionMetrics: {
          dau: dauCount || 0,
          mau: mauCount || 0,
          stickinessRatio,
          avgSessionDuration: avgDuration,
          totalSessions: sessionCount || 0
        }
      }));
    } catch (err) {
      console.error('Error loading session metrics:', err);
    }
  };

  const loadEngagementMetrics = async () => {
    try {
      const { data: tierData } = await supabase
        .from('users')
        .select('engagement_tier');

      const tierCounts = countDistribution(tierData || [], 'engagement_tier');

      const { data: onlineData } = await supabase
        .from('users')
        .select('total_time_seconds')
        .not('total_time_seconds', 'is', null);

      const avgOnlineHours = onlineData?.length > 0
        ? (onlineData.reduce((sum, u) => sum + u.total_time_seconds, 0) / onlineData.length / 3600).toFixed(1)
        : 0;

      const powerUserCount = (tierCounts.high || 0) + (tierCounts.power_user || 0);

      setAnalytics(prev => ({
        ...prev,
        engagementMetrics: {
          tierDistribution: tierCounts,
          avgOnlineHours,
          powerUsers: powerUserCount,
          totalUsers: tierData?.length || 0
        }
      }));
    } catch (err) {
      console.error('Error loading engagement metrics:', err);
    }
  };

  const loadBehaviorMetrics = async () => {
    try {
      const dateFilter = getDateFilter(timeRange);

      const { data: eventsData } = await supabase
        .from('user_behavior_events')
        .select('event_name, event_type')
        .gte('occurred_at', dateFilter)
        .limit(1000);

      const eventCounts = {};
      (eventsData || []).forEach(event => {
        eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      const eventTypeCounts = countDistribution(eventsData || [], 'event_type');

      setAnalytics(prev => ({
        ...prev,
        behaviorMetrics: {
          topEvents,
          eventTypeDistribution: eventTypeCounts,
          totalEvents: eventsData?.length || 0
        }
      }));
    } catch (err) {
      console.error('Error loading behavior metrics:', err);
    }
  };

  const loadCohortMetrics = async () => {
    try {
      const { data: cohortData } = await supabase
        .from('user_cohorts')
        .select('cohort_identifier')
        .eq('cohort_type', 'acquisition_month');

      const cohortCounts = countDistribution(cohortData || [], 'cohort_identifier');

      setAnalytics(prev => ({
        ...prev,
        cohortMetrics: {
          cohortDistribution: cohortCounts
        }
      }));
    } catch (err) {
      console.error('Error loading cohort metrics:', err);
    }
  };

  const loadOnlineHours = async () => {
    try {
      const dateFilter = getDateFilter(timeRange);

      const { data: timeData } = await supabase
        .from('user_sessions')
        .select('duration_seconds, user_id')
        .gte('started_at', dateFilter)
        .not('duration_seconds', 'is', null);

      const totalSeconds = (timeData || []).reduce((sum, s) => sum + s.duration_seconds, 0);
      const totalHours = (totalSeconds / 3600).toFixed(1);

      const uniqueUsers = new Set((timeData || []).map(s => s.user_id)).size;
      const avgHoursPerUser = uniqueUsers > 0 ? (totalSeconds / uniqueUsers / 3600).toFixed(1) : 0;

      setAnalytics(prev => ({
        ...prev,
        onlineHours: {
          totalHours,
          avgHoursPerUser
        }
      }));
    } catch (err) {
      console.error('Error loading online hours:', err);
    }
  };

  const loadGeographicMetrics = async () => {
    try {
      // Get country distribution
      const { data: countryData } = await supabase
        .from('users')
        .select('last_country_code, last_country_name')
        .not('last_country_code', 'is', null);

      const countryCounts = {};
      (countryData || []).forEach(user => {
        const key = user.last_country_code;
        if (!countryCounts[key]) {
          countryCounts[key] = {
            code: user.last_country_code,
            name: user.last_country_name,
            count: 0
          };
        }
        countryCounts[key].count++;
      });

      const topCountries = Object.values(countryCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get region distribution
      const { data: regionData } = await supabase
        .from('users')
        .select('last_region, last_country_name')
        .not('last_region', 'is', null);

      const regionCounts = {};
      (regionData || []).forEach(user => {
        const key = `${user.last_region}, ${user.last_country_name}`;
        regionCounts[key] = (regionCounts[key] || 0) + 1;
      });

      const topRegions = Object.entries(regionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([location, count]) => ({ location, count }));

      // Get city distribution
      const { data: cityData } = await supabase
        .from('users')
        .select('last_city, last_region, last_country_name')
        .not('last_city', 'is', null);

      const cityCounts = {};
      (cityData || []).forEach(user => {
        const key = `${user.last_city}, ${user.last_region}`;
        cityCounts[key] = (cityCounts[key] || 0) + 1;
      });

      const topCities = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([location, count]) => ({ location, count }));

      setAnalytics(prev => ({
        ...prev,
        geographicMetrics: {
          topCountries,
          topRegions,
          topCities,
          totalWithLocation: countryData?.length || 0
        }
      }));
    } catch (err) {
      console.error('Error loading geographic metrics:', err);
    }
  };

  const countDistribution = (data, field) => {
    return data.reduce((acc, item) => {
      const value = item[field] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  };

  const getDateFilter = (range) => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return '2000-01-01T00:00:00Z';
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getPercentage = (count, total) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-scout-accent-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into user behavior and engagement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-scout-accent-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* User Device Lookup - Troubleshooting Tool */}
      <UserDeviceLookup />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Daily Active Users"
          value={analytics.sessionMetrics.dau || 0}
          subtitle="Today"
          color="text-green-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Monthly Active Users"
          value={analytics.sessionMetrics.mau || 0}
          subtitle={`Stickiness: ${analytics.sessionMetrics.stickinessRatio}%`}
          color="text-blue-600"
        />
        <MetricCard
          icon={Clock}
          label="Avg Session Duration"
          value={formatDuration(analytics.sessionMetrics.avgSessionDuration || 0)}
          subtitle={`${analytics.sessionMetrics.totalSessions || 0} sessions`}
          color="text-amber-600"
        />
        <MetricCard
          icon={Activity}
          label="Total Online Hours"
          value={`${analytics.onlineHours.totalHours || 0}h`}
          subtitle={`${analytics.onlineHours.avgHoursPerUser || 0}h per user`}
          color="text-purple-600"
        />
      </div>

      {/* Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DistributionCard
          title="Device Type"
          icon={Smartphone}
          data={analytics.deviceMetrics.deviceDistribution}
          total={analytics.deviceMetrics.totalUsers}
        />
        <DistributionCard
          title="Platform"
          icon={Target}
          data={analytics.deviceMetrics.platformDistribution}
          total={analytics.deviceMetrics.totalUsers}
        />
        <DistributionCard
          title="Browser"
          icon={Eye}
          data={analytics.deviceMetrics.browserDistribution}
          total={analytics.deviceMetrics.totalUsers}
        />
      </div>

      {/* Engagement Tiers */}
      <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          <Zap className="inline w-5 h-5 mr-2" />
          Engagement Tiers
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analytics.engagementMetrics.tierDistribution || {}).map(([tier, count]) => (
            <div key={tier} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className={`text-2xl font-bold ${getTierColorClass(tier)}`}>
                {count}
              </div>
              <div className="text-sm capitalize text-gray-600 dark:text-gray-400">
                {tier.replace('_', ' ')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {getPercentage(count, analytics.engagementMetrics.totalUsers)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Events */}
      <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          <MousePointer className="inline w-5 h-5 mr-2" />
          Top User Actions
        </h3>
        <div className="space-y-2">
          {(analytics.behaviorMetrics.topEvents || []).map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded bg-gray-50 dark:bg-gray-800">
              <span className="text-gray-900 dark:text-gray-100">{event.name}</span>
              <span className="font-semibold text-scout-accent-600 dark:text-scout-accent-400">
                {event.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort Distribution */}
      <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          <Calendar className="inline w-5 h-5 mr-2" />
          User Acquisition by Month
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(analytics.cohortMetrics.cohortDistribution || {})
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 12)
            .map(([month, count]) => (
              <div key={month} className="text-center p-3 rounded bg-gray-50 dark:bg-gray-800">
                <div className="text-lg font-bold text-scout-accent-600 dark:text-scout-accent-400">
                  {count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {month}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Countries */}
        <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <Globe className="w-5 h-5 mr-2" />
            Top Countries
          </h3>
          <div className="space-y-2">
            {(analytics.geographicMetrics.topCountries || []).map((country, index) => (
              <div key={country.code} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCountryFlag(country.code)}</span>
                  <span className="text-gray-900 dark:text-gray-100">{country.name}</span>
                </div>
                <span className="font-semibold text-scout-accent-600 dark:text-scout-accent-400">
                  {country.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Regions */}
        <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <Target className="w-5 h-5 mr-2" />
            Top Regions
          </h3>
          <div className="space-y-2">
            {(analytics.geographicMetrics.topRegions || []).map((region, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="text-gray-900 dark:text-gray-100 text-sm">{region.location}</span>
                <span className="font-semibold text-scout-accent-600 dark:text-scout-accent-400">
                  {region.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
            <MapPin className="w-5 h-5 mr-2" />
            Top Cities
          </h3>
          <div className="space-y-2">
            {(analytics.geographicMetrics.topCities || []).map((city, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="text-gray-900 dark:text-gray-100 text-sm">{city.location}</span>
                <span className="font-semibold text-scout-accent-600 dark:text-scout-accent-400">
                  {city.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, subtitle, color }) => (
  <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-6 h-6 ${color}`} />
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
    <div className="text-gray-900 dark:text-gray-100 font-medium">
      {label}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {subtitle}
    </div>
  </div>
);

const DistributionCard = ({ title, icon: Icon, data = {}, total = 0 }) => (
  <div className="p-6 rounded-lg bg-white dark:bg-gray-900 shadow-md">
    <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </h3>
    <div className="space-y-3">
      {Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize text-gray-900 dark:text-gray-100">
                {key}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {count}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
    </div>
  </div>
);

const getTierColorClass = (tier) => {
  switch (tier) {
    case 'power_user':
      return 'text-purple-600 dark:text-purple-400';
    case 'high':
      return 'text-green-600 dark:text-green-400';
    case 'medium':
      return 'text-blue-600 dark:text-blue-400';
    case 'low':
      return 'text-amber-600 dark:text-amber-400';
    case 'inactive':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

// Get country flag emoji from country code
const getCountryFlag = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  // Convert country code to flag emoji
  // A = 0x1F1E6, Z = 0x1F1FF
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);

  return String.fromCodePoint(...codePoints);
};

export default UserAnalyticsDashboard;
