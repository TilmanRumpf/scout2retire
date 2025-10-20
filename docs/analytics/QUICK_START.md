# User Analytics - Quick Start Guide

## 🚀 5-Minute Setup

### 1. View the Dashboard
```
Navigate to: Admin Panel → Paywall Manager → Analytics Tab
```

### 2. Track Custom Events
```javascript
import { trackClick, trackFeatureUse } from '../utils/analytics/behaviorTracking';

// In your component
trackClick(user.id, 'button_name', 'category');
trackFeatureUse(user.id, 'feature_name');
```

### 3. Check User Activity
```sql
-- See recent active users
SELECT id, email, last_active_at, engagement_tier
FROM users
WHERE last_active_at > NOW() - INTERVAL '24 hours'
ORDER BY last_active_at DESC;

-- See user's sessions today
SELECT * FROM user_sessions
WHERE user_id = 'USER_ID_HERE'
  AND started_at > CURRENT_DATE;
```

---

## 📊 Common Queries

### Active Users
```sql
-- Today's DAU
SELECT COUNT(DISTINCT user_id)
FROM user_sessions
WHERE started_at >= CURRENT_DATE;

-- This week's WAU
SELECT COUNT(DISTINCT user_id)
FROM user_sessions
WHERE started_at >= CURRENT_DATE - 7;

-- Power users
SELECT id, email, engagement_tier, total_time_seconds / 3600 as total_hours
FROM users
WHERE engagement_tier IN ('high', 'power_user')
ORDER BY total_time_seconds DESC;
```

### Device Analytics
```sql
-- Device distribution
SELECT last_device_type, COUNT(*) as count
FROM users
WHERE last_device_type IS NOT NULL
GROUP BY last_device_type
ORDER BY count DESC;

-- Users by platform
SELECT last_platform, COUNT(*) as count
FROM users
WHERE last_platform IS NOT NULL
GROUP BY last_platform
ORDER BY count DESC;
```

### Popular Actions
```sql
-- Top 10 events last 7 days
SELECT event_name, COUNT(*) as count
FROM user_behavior_events
WHERE occurred_at > NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY count DESC
LIMIT 10;
```

---

## 🎯 Event Tracking Examples

### Track Search
```javascript
import { trackSearch } from '../utils/analytics/behaviorTracking';

trackSearch(
  user.id,
  searchQuery,
  results.length,
  { filters: activeFilters }
);
```

### Track Page View
```javascript
import { trackPageView } from '../utils/analytics/behaviorTracking';

useEffect(() => {
  trackPageView(user.id, window.location.pathname);
}, [location.pathname]);
```

### Track Feature Usage
```javascript
import { trackFeatureUse } from '../utils/analytics/behaviorTracking';

const handleAIChat = () => {
  trackFeatureUse(user.id, 'scotty_ai', { topic: 'retirement_planning' });
  openAIChat();
};
```

### Track Conversion
```javascript
import { trackConversion } from '../utils/analytics/behaviorTracking';

const handleUpgrade = async () => {
  const result = await upgradeToPremium();
  if (result.success) {
    trackConversion(user.id, 'upgrade_premium', 49.00);
  }
};
```

---

## 🔍 User Analysis

### Check Individual User
```sql
-- User summary
SELECT
  id,
  email,
  engagement_tier,
  last_device_type,
  last_platform,
  total_sessions,
  total_time_seconds / 3600 as total_hours,
  last_login_at,
  last_active_at
FROM users
WHERE email = 'user@example.com';

-- User's recent sessions
SELECT
  started_at,
  ended_at,
  duration_seconds / 60 as duration_minutes,
  page_views,
  actions_count,
  session_quality_score
FROM user_sessions
WHERE user_id = 'USER_ID'
ORDER BY started_at DESC
LIMIT 20;

-- User's recent actions
SELECT
  event_type,
  event_name,
  event_category,
  occurred_at
FROM user_behavior_events
WHERE user_id = 'USER_ID'
ORDER BY occurred_at DESC
LIMIT 50;
```

---

## 📈 Dashboard Metrics

Access all these via the Analytics Dashboard:

### Overview Metrics
- **DAU** - Users active today
- **MAU** - Users active last 30 days
- **Stickiness** - DAU/MAU ratio (higher = better)
- **Avg Session** - Average time per session
- **Total Hours** - Combined user time

### Device Breakdown
- Mobile vs Tablet vs Desktop
- iOS vs Android vs Windows vs macOS
- Chrome vs Safari vs Firefox vs Edge

### Engagement Tiers
- Power Users (20+ active days)
- High Engagement (10+ active days)
- Medium Engagement (5+ active days)
- Low Engagement (1-4 active days)
- Inactive (0 active days)

### Behavior Insights
- Top 10 user actions
- Most viewed pages
- Feature adoption rates
- Search patterns

### Cohort Analysis
- Users by signup month
- Retention by cohort
- Growth trends

---

## 🛠️ Maintenance Tasks

### Daily (Automated)
```sql
-- Calculate yesterday's engagement
SELECT calculate_daily_engagement(CURRENT_DATE - 1);
```

### Weekly (Recommended)
```sql
-- Update engagement tiers
UPDATE users
SET engagement_tier = update_engagement_tier(id)
WHERE last_active_at > NOW() - INTERVAL '7 days';

-- Check for inactive users (potential churn)
SELECT email, last_active_at, engagement_tier
FROM users
WHERE last_active_at < NOW() - INTERVAL '30 days'
  AND engagement_tier != 'inactive';
```

### Monthly (Recommended)
```sql
-- Archive old events (keep last 90 days)
DELETE FROM user_behavior_events
WHERE occurred_at < NOW() - INTERVAL '90 days';

-- Review top features
SELECT
  event_name,
  COUNT(*) as uses,
  COUNT(DISTINCT user_id) as unique_users
FROM user_behavior_events
WHERE event_type = 'feature_use'
  AND occurred_at > NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY uses DESC;
```

---

## 🎓 Tips & Best Practices

### DO:
✅ Track key user actions
✅ Use descriptive event names
✅ Include relevant metadata
✅ Review analytics weekly
✅ Set up automated reports
✅ Monitor engagement trends

### DON'T:
❌ Track PII (personally identifiable info) in event metadata
❌ Create too many event types (keep it focused)
❌ Ignore the dashboard (use insights!)
❌ Forget to clean up old events
❌ Track every single click (be strategic)

---

## 📞 Need Help?

- **Full Documentation:** `/docs/analytics/USER_ANALYTICS_SYSTEM.md`
- **Migration File:** `/supabase/migrations/20251019230000_user_analytics_system.sql`
- **Dashboard Code:** `/src/components/admin/UserAnalyticsDashboard.jsx`
- **Tracking Utils:** `/src/utils/analytics/behaviorTracking.js`

---

**You're all set! Start tracking and optimizing your user experience.** 🚀
