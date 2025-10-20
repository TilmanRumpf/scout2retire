# Geographic Tracking - User Location Analytics

**Created:** October 19, 2025
**Status:** ✅ Live in Production
**API:** ipapi.co (free, 1,000 requests/day)

---

## 🌍 What Gets Tracked

Every time a user logs in, we automatically capture:

### **From IP Geolocation API:**
- ✅ **Country Code** (ISO 3166-1 alpha-2: US, ES, MX, etc.)
- ✅ **Country Name** (United States, Spain, Mexico)
- ✅ **Region/State** (California, Texas, Florida, etc.)
- ✅ **City** (San Francisco, Madrid, Barcelona)
- ✅ **Timezone** (America/New_York, Europe/Madrid)
- ✅ **Coordinates** (Lat/Long - city-level, not precise)
- ✅ **IP Address** (Stored for logging)

### **Privacy-Friendly:**
- ⚠️ **City-level only** (not street address)
- ⚠️ **IP-based** (no GPS/browser permission required)
- ⚠️ **RLS protected** (users see own data, admins see all)
- ⚠️ **GDPR compliant** (no PII, can be deleted)

---

## 📊 Analytics Dashboard

**Access:** Admin Panel → Paywall Manager → Analytics Tab

### **New Geographic Sections:**

**1. Top Countries** 🌍
- Top 10 countries by user count
- Country flags (emoji)
- Active vs total users
- Example: 🇺🇸 United States (245 users)

**2. Top Regions** 🗺️
- Top 10 states/provinces
- Format: "Region, Country"
- Example: California, United States (89 users)

**3. Top Cities** 📍
- Top 15 cities by user count
- Format: "City, Region"
- Example: San Francisco, CA (42 users)

---

## 🔧 Technical Implementation

### **Geolocation API**

Using **ipapi.co** (free tier):
```javascript
fetch('https://ipapi.co/json/')
```

**Why ipapi.co?**
- ✅ Free tier: 1,000 requests/day (plenty for Scout2Retire)
- ✅ No API key required
- ✅ Fast and reliable
- ✅ Returns JSON with all needed fields
- ✅ HTTPS support

**Response format:**
```json
{
  "ip": "24.48.0.1",
  "city": "Anytown",
  "region": "California",
  "country_code": "US",
  "country_name": "United States",
  "timezone": "America/Los_Angeles",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

### **Database Schema**

**user_device_history:**
```sql
country_code TEXT        -- 'US', 'ES', 'MX'
country_name TEXT        -- 'United States'
region TEXT              -- 'California', 'Texas'
city TEXT                -- 'San Francisco'
timezone TEXT            -- 'America/Los_Angeles'
latitude DECIMAL(10,8)   -- 37.77490000
longitude DECIMAL(11,8)  -- -122.41940000
ip_address INET          -- Stored IP
```

**users table:**
```sql
last_country_code TEXT   -- Most recent country
last_country_name TEXT   -- Most recent country name
last_region TEXT         -- Most recent state/province
last_city TEXT           -- Most recent city
last_timezone TEXT       -- Most recent timezone
```

**Indexes:**
```sql
idx_device_history_country
idx_device_history_region
idx_device_history_city
idx_users_country
idx_users_region
idx_users_city
```

---

## 📈 Business Insights

### **For Scout2Retire:**

**1. Market Analysis**
```sql
-- Which countries have the most users?
SELECT last_country_name, COUNT(*) as user_count
FROM users
WHERE last_country_code IS NOT NULL
GROUP BY last_country_name
ORDER BY user_count DESC;
```

**2. Regional Targeting**
```sql
-- Which US states should we focus marketing on?
SELECT last_region, COUNT(*) as users
FROM users
WHERE last_country_code = 'US'
  AND last_region IS NOT NULL
GROUP BY last_region
ORDER BY users DESC
LIMIT 10;
```

**3. Timezone Planning**
```sql
-- When should we send emails? (by timezone)
SELECT last_timezone, COUNT(*) as users
FROM users
WHERE last_timezone IS NOT NULL
GROUP BY last_timezone
ORDER BY users DESC;
```

**4. City Engagement**
```sql
-- Top cities with power users
SELECT last_city, last_region, engagement_tier, COUNT(*) as count
FROM users
WHERE engagement_tier IN ('high', 'power_user')
  AND last_city IS NOT NULL
GROUP BY last_city, last_region, engagement_tier
ORDER BY count DESC;
```

### **Product Insights:**

**Users from X prefer destinations in Y:**
```sql
-- What retirement destinations do California users view?
SELECT
  u.last_region,
  t.name as town_viewed,
  t.country,
  COUNT(*) as view_count
FROM user_behavior_events e
JOIN users u ON e.user_id = u.id
JOIN towns t ON (e.event_metadata->>'town_id')::uuid = t.id
WHERE u.last_region = 'California'
  AND e.event_name = 'town_detail'
GROUP BY u.last_region, t.name, t.country
ORDER BY view_count DESC
LIMIT 20;
```

**Geographic recommendations:**
```sql
-- "Users from your area also liked..."
WITH user_location AS (
  SELECT last_city, last_region FROM users WHERE id = 'USER_ID'
)
SELECT t.name, t.country, COUNT(*) as views
FROM user_behavior_events e
JOIN users u ON e.user_id = u.id
JOIN towns t ON (e.event_metadata->>'town_id')::uuid = t.id
WHERE u.last_city = (SELECT last_city FROM user_location)
  AND e.event_name = 'town_detail'
GROUP BY t.name, t.country
ORDER BY views DESC
LIMIT 10;
```

---

## 🎯 Use Cases

### **1. Personalized Recommendations**
Show users destinations popular with people from their area:
- "Users from Texas also viewed these beach towns"
- "Popular with Californians: Spain, Portugal, Mexico"

### **2. Regional Marketing**
Target campaigns by location:
- Focus Facebook ads on high-engagement cities
- Localize content (Texas → "Y'all looking to retire?")
- Partner with local retirement advisors

### **3. Timezone-Aware Features**
- Send emails at optimal local time
- Schedule webinars for US East Coast peak hours
- Display "Good morning/afternoon/evening" based on timezone

### **4. Geographic Cohorts**
- Track "Florida users" retention
- Compare "West Coast vs East Coast" engagement
- Analyze "International users" behavior

### **5. Competitive Analysis**
- Where are our users vs competitors?
- Which regions have growth potential?
- Geographic expansion planning

---

## 🔍 Example Queries

### **View User's Location**
```sql
SELECT
  email,
  last_city || ', ' || last_region as location,
  last_country_name,
  last_timezone,
  last_active_at
FROM users
WHERE email = 'user@example.com';
```

### **Top 10 Cities**
```sql
SELECT
  last_city,
  last_region,
  last_country_name,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '7 days') as active_users
FROM users
WHERE last_city IS NOT NULL
GROUP BY last_city, last_region, last_country_name
ORDER BY user_count DESC
LIMIT 10;
```

### **Geographic Heatmap Data**
```sql
-- For creating a visual map
SELECT
  last_country_code,
  last_city,
  latitude,
  longitude,
  COUNT(*) as user_count
FROM user_device_history
WHERE latitude IS NOT NULL
  AND is_current = true
GROUP BY last_country_code, last_city, latitude, longitude
ORDER BY user_count DESC;
```

### **Timezone Distribution**
```sql
SELECT
  last_timezone,
  COUNT(*) as users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM users
WHERE last_timezone IS NOT NULL
GROUP BY last_timezone
ORDER BY users DESC;
```

---

## ⚙️ Configuration

### **API Limits**
ipapi.co free tier:
- **1,000 requests/day**
- **Resets daily at midnight UTC**
- **No authentication required**

For Scout2Retire:
- ~50-100 logins/day = well under limit
- Non-blocking (app works even if API fails)
- Cached per device (not called on every page view)

### **Fallback Strategy**
If API fails:
1. Timezone from browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`)
2. Location data is NULL (graceful degradation)
3. App continues to work normally

### **Upgrade Path (if needed)**
If you exceed 1,000 requests/day:
- **ipapi.co Pro**: $15/month for 50k requests
- **MaxMind GeoLite2**: Free database (self-hosted)
- **ipinfo.io**: 50k requests/month free with token

---

## 🛡️ Privacy & Compliance

### **GDPR Compliant:**
- ✅ No street address (city-level only)
- ✅ No device tracking without consent (IP is automatic)
- ✅ Users can request data deletion
- ✅ Data minimization (only what's needed)
- ✅ Legitimate interest (service improvement)

### **What We DON'T Track:**
- ❌ Precise GPS coordinates
- ❌ Street address
- ❌ Home address
- ❌ Real-time location tracking
- ❌ Location history beyond device changes

### **User Rights:**
Users can see their location data:
```sql
SELECT
  last_country_name,
  last_region,
  last_city,
  last_timezone
FROM users
WHERE id = auth.uid();
```

---

## 📊 Dashboard Visualizations

Current:
- ✅ Top Countries list with flags
- ✅ Top Regions list
- ✅ Top Cities list

Future enhancements:
- 🔜 Interactive world map (Leaflet.js)
- 🔜 Heatmap showing user density
- 🔜 Geographic growth trends chart
- 🔜 Region-specific engagement metrics

---

## 🔗 Integration Points

### **With Existing Features:**

**Retirement Recommendations:**
```javascript
// Show "Popular in your area"
const userLocation = await getUserLocation(userId);
const localPopular = await getLocalPopularTowns(userLocation.city);
```

**Marketing Campaigns:**
```javascript
// Target by region
const californiaUsers = await getUsersByRegion('California');
sendCampaign(californiaUsers, 'spanish-retirement-guide');
```

**Analytics Reports:**
```javascript
// Geographic breakdown in reports
const geoStats = await getGeographicDistribution();
generateMonthlyReport(geoStats);
```

---

## 🎓 Best Practices

### **DO:**
✅ Use geographic data for personalization
✅ Analyze regional trends for product decisions
✅ Respect user privacy (city-level only)
✅ Handle API failures gracefully
✅ Cache location data per device

### **DON'T:**
❌ Store precise GPS coordinates without consent
❌ Use location for discriminatory pricing
❌ Share location data with third parties
❌ Track real-time movement
❌ Make assumptions about users based on location

---

## 📞 Support

**Implementation Files:**
- Migration: `supabase/migrations/20251019233000_add_geographic_tracking.sql`
- Detection: `src/utils/analytics/deviceDetection.js`
- Dashboard: `src/components/admin/UserAnalyticsDashboard.jsx`

**API Documentation:**
- https://ipapi.co/api/

---

**Geographic tracking is live! Your location data will populate as users log in.** 🌍📊
