# Scout2Retire User Analytics System

**Created:** October 19, 2025
**Status:** ✅ Production Ready
**Version:** 1.0.0

## 🎯 Overview

A comprehensive, industry-standard user analytics system that tracks device usage, sessions, behavior, engagement, and cohorts. Built following best practices from Google Analytics 4, Amplitude, Mixpanel, and modern SaaS platforms.

---

## 📊 What's Tracked

### 1. **Device Analytics**
- **Device Type:** Mobile, Tablet, Desktop
- **Platform:** iOS, Android, Windows, macOS, Linux
- **Browser:** Chrome, Safari, Firefox, Edge, etc.
- **Screen Resolution:** Track viewport and display specs
- **Device History:** Multiple devices per user over time

### 2. **Session Metrics**
- **Session Duration:** Real-time tracking with heartbeat
- **Page Views:** Count per session
- **Actions Count:** User interactions per session
- **Features Used:** Which features accessed in session
- **Session Quality Score:** 0.0-1.0 based on engagement
- **Entry/Exit Pages:** User flow tracking

### 3. **Engagement Metrics**
- **DAU (Daily Active Users):** Users active today
- **WAU (Weekly Active Users):** Users active last 7 days
- **MAU (Monthly Active Users):** Users active last 30 days
- **Stickiness Ratio:** DAU/MAU percentage
- **Engagement Tiers:** inactive, low, medium, high, power_user
- **Active Days:** Last 7 and 30 day counts

### 4. **Behavior Events**
Track specific user actions:
- **Clicks:** Button/link interactions
- **Views:** Page and town views
- **Searches:** Search queries and results
- **Saves:** Favorites and saved items
- **Shares:** Social sharing actions
- **Chat:** Message sending
- **Preference Changes:** Settings modifications
- **Feature Use:** Specific feature engagement
- **Conversions:** Subscription upgrades
- **Errors:** Error tracking for debugging

### 5. **Online Hours Tracking**
- **Real-time Activity:** 30-second heartbeat
- **Idle Detection:** 5-minute timeout
- **Total Time:** Lifetime online seconds
- **Average Session Duration:** Per user metric
- **Daily Breakdown:** Hours per day analysis

### 6. **Cohort Analysis**
- **Acquisition Cohorts:** By week/month joined
- **Device Cohorts:** By device type
- **Tier Cohorts:** By subscription level
- **Behavior Cohorts:** By usage patterns
- **Retention Tracking:** Day 1, 7, 30+ retention

---

## 🗄️ Database Schema

### Core Tables

**user_device_history**
- Tracks all devices used by each user
- First/last seen timestamps
- Session count per device
- Total time per device

**user_sessions**
- Individual session records
- Duration, page views, actions
- Features used array
- Quality score (0.0-1.0)

**user_behavior_events**
- Granular event tracking
- Event type, name, category
- JSON metadata
- Page URL tracking

**user_engagement_metrics**
- Daily aggregated metrics
- DAU/WAU/MAU flags
- Feature usage arrays
- Engagement scoring

**user_cohorts**
- User segmentation
- Multiple cohort types
- Metadata storage

**retention_metrics**
- Pre-calculated retention
- By cohort and day number
- Retention rate percentages

### User Table Extensions

New columns added to `users` table:
```sql
last_device_type       -- mobile|tablet|desktop
last_platform          -- iOS|Android|Windows|macOS|Linux
last_browser           -- Chrome|Safari|Firefox|Edge
last_user_agent        -- Full UA string
last_login_at          -- Last successful login
last_active_at         -- Last activity (30s heartbeat)
total_sessions         -- Lifetime session count
total_time_seconds     -- Lifetime online time
lifetime_page_views    -- Total page views
lifetime_actions       -- Total actions taken
first_session_at       -- First session timestamp
avg_session_duration_seconds -- Average session length
last_7_days_active_days      -- Active days in last week
last_30_days_active_days     -- Active days in last month
engagement_tier              -- inactive|low|medium|high|power_user
churn_risk_score            -- 0.0-1.0 (higher = more risk)
```

---

## 🔧 Technical Implementation

### Files Created

**Database:**
- `supabase/migrations/20251019230000_user_analytics_system.sql` (573 lines)

**Utilities:**
- `src/utils/analytics/deviceDetection.js` - Device tracking
- `src/utils/analytics/behaviorTracking.js` - Session & event tracking

**Hooks:**
- `src/hooks/useOnlineTracking.js` - Real-time activity monitoring

**Components:**
- `src/components/admin/UserAnalyticsDashboard.jsx` - Admin dashboard

**Context Updates:**
- `src/contexts/AuthContext.jsx` - Auto-tracking on login/signup

---

## 📈 Dashboard Features

Access via: **Admin Panel → PaywallManager → Analytics Tab**

### Key Metrics Cards
- Daily Active Users (DAU)
- Monthly Active Users (MAU) with stickiness %
- Average Session Duration
- Total Online Hours

### Device Analytics
- Device Type Distribution (pie chart)
- Platform Distribution
- Browser Distribution
- Cross-device usage patterns

### Engagement Analysis
- Engagement Tier Breakdown
  - Power Users
  - High Engagement
  - Medium Engagement
  - Low Engagement
  - Inactive Users

### Behavior Insights
- Top 10 User Actions
- Event Type Distribution
- Feature Adoption Rates
- Most Viewed Pages

### Cohort Analysis
- User Acquisition by Month
- Retention Curves
- Cohort Size Comparison

### Time Range Filters
- Last 7 Days
- Last 30 Days
- Last 90 Days
- All Time

---

## 🚀 How It Works

### Automatic Tracking

**On Sign In / Sign Up:**
1. Device info detected (type, platform, browser)
2. Device history record created/updated
3. User session started automatically
4. Initial page view tracked

**During Session:**
1. 30-second activity heartbeat
2. Page views tracked on navigation
3. User actions tracked (clicks, searches, etc.)
4. Feature usage recorded
5. Session quality calculated in real-time

**On Sign Out / Timeout:**
1. Session ended automatically
2. Duration and metrics calculated
3. User totals updated
4. Device stats updated

### Manual Event Tracking

Use these functions anywhere in your app:

```javascript
import {
  trackClick,
  trackSearch,
  trackTownView,
  trackFeatureUse,
  trackSave,
  trackShare,
  trackConversion
} from '../utils/analytics/behaviorTracking';

// Track button click
trackClick(userId, 'search_button', 'navigation');

// Track search
trackSearch(userId, 'beach towns Florida', 42, { region: 'Florida' });

// Track town view
trackTownView(userId, townId, 'Valencia, Spain');

// Track feature usage
trackFeatureUse(userId, 'ai_chat', { messages_sent: 5 });

// Track save/favorite
trackSave(userId, 'town', townId);

// Track share
trackShare(userId, 'town', 'email');

// Track conversion
trackConversion(userId, 'upgrade_to_premium', 49.00);
```

---

## 📊 Analytics Functions

### Database Functions

**update_user_device(user_id, device_type, platform, browser, user_agent, screen_resolution)**
- Updates or creates device history
- Returns device_history_id

**start_user_session(user_id, device_history_id, entry_page)**
- Creates new session record
- Returns session_id

**end_user_session(session_id, exit_page)**
- Calculates duration and quality score
- Updates user totals

**track_behavior_event(user_id, session_id, event_type, event_name, event_category, metadata, page_url)**
- Logs user action
- Updates session counters
- Returns event_id

**calculate_daily_engagement(date)**
- Aggregates daily metrics
- Calculates DAU/WAU/MAU
- Returns count of processed users

**assign_user_cohort(user_id, cohort_type, cohort_identifier, metadata)**
- Assigns user to cohort
- Returns cohort_id

**update_engagement_tier(user_id)**
- Classifies user engagement level
- Based on 30-day activity
- Returns tier (inactive|low|medium|high|power_user)

---

## 🔐 Security & Privacy

### Row Level Security (RLS)

All analytics tables have RLS policies:
- Users can view their own data
- Admins (moderator+) can view all data
- Audit logs immutable (auditor+ read-only)

### Data Retention

**Recommendations:**
- Events: 90-180 days
- Sessions: 1 year
- Metrics: 2 years
- User totals: Lifetime

Implement automated cleanup:
```sql
DELETE FROM user_behavior_events
WHERE occurred_at < NOW() - INTERVAL '90 days';
```

---

## 📋 Industry Best Practices Implemented

### ✅ From Google Analytics 4
- Event-based tracking architecture
- Session timeout (30 minutes)
- User engagement metrics
- Conversion tracking
- Custom event metadata

### ✅ From Amplitude
- User cohort analysis
- Retention metrics
- Behavioral segmentation
- Feature adoption tracking

### ✅ From Mixpanel
- Funnel analysis ready
- User properties (engagement tier)
- Churn prediction scoring
- Real-time activity tracking

### ✅ SaaS Metrics Standards
- DAU, WAU, MAU tracking
- Stickiness ratio (DAU/MAU)
- Session quality scoring
- Engagement tier classification
- RFM framework ready (Recency, Frequency, Monetary)

---

## 🎓 Key Metrics Explained

### Stickiness Ratio
**Formula:** `(DAU / MAU) × 100`
- **Good:** 20-30%
- **Great:** 30-50%
- **Excellent:** 50%+

Shows how often monthly users return daily.

### Session Quality Score
**Formula:** `(duration_score × 0.4) + (pageview_score × 0.3) + (action_score × 0.3)`
- **0.0-0.3:** Low quality (bounce/quick exit)
- **0.3-0.6:** Medium quality (some engagement)
- **0.6-0.8:** High quality (good engagement)
- **0.8-1.0:** Excellent quality (power user session)

### Engagement Tiers
Based on 30-day activity:
- **Power User:** 20+ active days AND 100+ actions
- **High:** 10+ active days OR 50+ actions
- **Medium:** 5+ active days OR 20+ actions
- **Low:** 1-4 active days OR 1-19 actions
- **Inactive:** 0 active days

### Churn Risk Score
**Factors:**
- Days since last login
- Engagement tier decline
- Session frequency drop
- Feature usage reduction

**Ranges:**
- **0.0-0.3:** Low risk (engaged user)
- **0.3-0.6:** Medium risk (watch closely)
- **0.6-0.8:** High risk (re-engagement campaign)
- **0.8-1.0:** Very high risk (likely to churn)

---

## 🔄 Maintenance

### Daily Tasks
```sql
-- Calculate yesterday's engagement metrics
SELECT calculate_daily_engagement(CURRENT_DATE - 1);

-- Update engagement tiers for active users
UPDATE users
SET engagement_tier = update_engagement_tier(id)
WHERE last_active_at > NOW() - INTERVAL '7 days';
```

### Weekly Tasks
```sql
-- Calculate retention metrics for recent cohorts
INSERT INTO retention_metrics (cohort_type, cohort_identifier, day_number, retained_users, retention_rate)
SELECT
  'acquisition_month',
  cohort_identifier,
  EXTRACT(DAY FROM NOW() - joined_cohort_at)::INTEGER as day_number,
  COUNT(*) as retained_users,
  (COUNT(*) * 100.0 / cohort_size) as retention_rate
FROM user_cohorts
JOIN users ON user_cohorts.user_id = users.id
WHERE last_active_at > NOW() - INTERVAL '7 days'
GROUP BY cohort_identifier, day_number;
```

### Monthly Tasks
- Review and archive old events
- Generate executive reports
- Analyze cohort trends
- Update churn predictions

---

## 📚 Usage Examples

### Example 1: Track Town Search
```javascript
import { trackSearch } from '../utils/analytics/behaviorTracking';

const handleSearch = async (query, filters) => {
  const results = await searchTowns(query, filters);

  // Track the search
  await trackSearch(
    user.id,
    query,
    results.length,
    filters
  );

  return results;
};
```

### Example 2: Track Feature Usage
```javascript
import { trackFeatureUse } from '../utils/analytics/behaviorTracking';

const openAIChat = () => {
  // Track feature usage
  trackFeatureUse(user.id, 'scotty_ai_chat', {
    entry_point: 'header_button',
    time_of_day: new Date().getHours()
  });

  setShowAIChat(true);
};
```

### Example 3: Track Conversion
```javascript
import { trackConversion } from '../utils/analytics/behaviorTracking';

const handleUpgrade = async (tier, price) => {
  const result = await upgradeToPremium(tier);

  if (result.success) {
    // Track conversion
    await trackConversion(
      user.id,
      `upgrade_to_${tier}`,
      price,
      {
        previous_tier: user.category_code,
        payment_method: result.payment_method,
        promo_code: result.promo_code
      }
    );
  }

  return result;
};
```

---

## 🎯 Next Steps

### Recommended Enhancements

1. **Automated Reports**
   - Weekly email to admins
   - Monthly executive summary
   - Cohort retention alerts

2. **Advanced Analytics**
   - Funnel analysis
   - A/B testing framework
   - Predictive churn models
   - User lifetime value (LTV)

3. **Visualizations**
   - Interactive charts (Chart.js, Recharts)
   - Retention heatmaps
   - User journey maps
   - Real-time dashboards

4. **Integrations**
   - Export to Google Analytics
   - Slack notifications
   - Data warehouse sync
   - BI tool integration

5. **Performance**
   - Event batching
   - Background processing
   - Materialized views
   - Query optimization

---

## 🐛 Troubleshooting

### Sessions Not Starting
**Check:**
1. User is authenticated (`user.id` exists)
2. AuthContext imported correctly
3. No console errors in browser
4. Database functions created

### Events Not Tracked
**Check:**
1. Session is active (`isSessionActive()`)
2. Event name is valid
3. User ID passed correctly
4. RLS policies allow insert

### Dashboard Not Loading
**Check:**
1. User has admin access
2. Analytics tables exist
3. Sample data present
4. No SQL errors in console

### Device Not Detected
**Check:**
1. User agent accessible
2. `deviceDetection.js` imported
3. Function called on login
4. Database function exists

---

## 📞 Support

**Documentation:** `/docs/analytics/`
**Migration File:** `/supabase/migrations/20251019230000_user_analytics_system.sql`
**Dashboard:** Admin Panel → Paywall Manager → Analytics Tab

---

## 🏆 Success Metrics

After implementation, track these KPIs:

- **Tracking Coverage:** % of active users with session data
- **Data Quality:** % of events with complete metadata
- **Dashboard Usage:** Admin views per week
- **Insights Generated:** Decisions made from analytics
- **Performance:** Average query response time

---

**Built with industry best practices. Ready for production. Scale with confidence.** 🚀
