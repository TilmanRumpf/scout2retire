-- =====================================================
-- GEOGRAPHIC TRACKING ENHANCEMENT
-- Created: October 19, 2025
-- Purpose: Add country, region, city tracking via IP geolocation
-- =====================================================

-- =====================================================
-- 1. ALTER user_device_history (Add location fields)
-- =====================================================
ALTER TABLE user_device_history
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS country_name TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Create indexes for geographic queries
CREATE INDEX IF NOT EXISTS idx_device_history_country ON user_device_history(country_code);
CREATE INDEX IF NOT EXISTS idx_device_history_region ON user_device_history(region);
CREATE INDEX IF NOT EXISTS idx_device_history_city ON user_device_history(city);

COMMENT ON COLUMN user_device_history.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., US, ES, MX)';
COMMENT ON COLUMN user_device_history.country_name IS 'Full country name (e.g., United States, Spain)';
COMMENT ON COLUMN user_device_history.region IS 'State/Province/Region name';
COMMENT ON COLUMN user_device_history.city IS 'City name';
COMMENT ON COLUMN user_device_history.timezone IS 'IANA timezone (e.g., America/New_York)';
COMMENT ON COLUMN user_device_history.latitude IS 'Approximate latitude (city-level)';
COMMENT ON COLUMN user_device_history.longitude IS 'Approximate longitude (city-level)';

-- =====================================================
-- 2. ALTER users (Add current location fields)
-- =====================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_country_code TEXT,
  ADD COLUMN IF NOT EXISTS last_country_name TEXT,
  ADD COLUMN IF NOT EXISTS last_region TEXT,
  ADD COLUMN IF NOT EXISTS last_city TEXT,
  ADD COLUMN IF NOT EXISTS last_timezone TEXT;

-- Create indexes for user location queries
CREATE INDEX IF NOT EXISTS idx_users_country ON users(last_country_code);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(last_region);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(last_city);

COMMENT ON COLUMN users.last_country_code IS 'Most recent country code from IP geolocation';
COMMENT ON COLUMN users.last_country_name IS 'Most recent country name';
COMMENT ON COLUMN users.last_region IS 'Most recent state/province/region';
COMMENT ON COLUMN users.last_city IS 'Most recent city';
COMMENT ON COLUMN users.last_timezone IS 'Most recent timezone';

-- =====================================================
-- 3. UPDATE update_user_device function (Add location params)
-- =====================================================
-- Drop old function first
DROP FUNCTION IF EXISTS update_user_device(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION update_user_device(
  p_user_id UUID,
  p_device_type TEXT,
  p_platform TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_screen_resolution TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_country_name TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_device_id UUID;
BEGIN
  -- Find or create device history entry
  SELECT id INTO v_device_id
  FROM user_device_history
  WHERE user_id = p_user_id
    AND device_type = p_device_type
    AND platform = p_platform
    AND browser = p_browser
  LIMIT 1;

  IF v_device_id IS NULL THEN
    -- New device, create entry
    INSERT INTO user_device_history (
      user_id,
      device_type,
      platform,
      browser,
      user_agent,
      screen_resolution,
      ip_address,
      country_code,
      country_name,
      region,
      city,
      timezone,
      latitude,
      longitude,
      is_current
    ) VALUES (
      p_user_id,
      p_device_type,
      p_platform,
      p_browser,
      p_user_agent,
      p_screen_resolution,
      p_ip_address,
      p_country_code,
      p_country_name,
      p_region,
      p_city,
      p_timezone,
      p_latitude,
      p_longitude,
      true
    ) RETURNING id INTO v_device_id;
  ELSE
    -- Update existing device
    UPDATE user_device_history
    SET
      last_seen_at = NOW(),
      session_count = session_count + 1,
      user_agent = COALESCE(p_user_agent, user_agent),
      screen_resolution = COALESCE(p_screen_resolution, screen_resolution),
      ip_address = COALESCE(p_ip_address, ip_address),
      country_code = COALESCE(p_country_code, country_code),
      country_name = COALESCE(p_country_name, country_name),
      region = COALESCE(p_region, region),
      city = COALESCE(p_city, city),
      timezone = COALESCE(p_timezone, timezone),
      latitude = COALESCE(p_latitude, latitude),
      longitude = COALESCE(p_longitude, longitude),
      is_current = true
    WHERE id = v_device_id;
  END IF;

  -- Mark other devices as not current
  UPDATE user_device_history
  SET is_current = false
  WHERE user_id = p_user_id AND id != v_device_id;

  -- Update users table with latest location
  UPDATE users
  SET
    last_device_type = p_device_type,
    last_platform = p_platform,
    last_browser = p_browser,
    last_user_agent = p_user_agent,
    last_login_at = NOW(),
    last_active_at = NOW(),
    last_country_code = COALESCE(p_country_code, last_country_code),
    last_country_name = COALESCE(p_country_name, last_country_name),
    last_region = COALESCE(p_region, last_region),
    last_city = COALESCE(p_city, last_city),
    last_timezone = COALESCE(p_timezone, last_timezone)
  WHERE id = p_user_id;

  RETURN v_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_device IS 'Update or create device history with geographic location data';

-- =====================================================
-- 4. CREATE geographic_distribution view (Analytics helper)
-- =====================================================
CREATE OR REPLACE VIEW user_geographic_distribution AS
SELECT
  last_country_code,
  last_country_name,
  last_region,
  last_city,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '7 days') as active_7d,
  COUNT(*) FILTER (WHERE last_active_at > NOW() - INTERVAL '30 days') as active_30d,
  ARRAY_AGG(DISTINCT engagement_tier) as engagement_tiers
FROM users
WHERE last_country_code IS NOT NULL
GROUP BY last_country_code, last_country_name, last_region, last_city
ORDER BY user_count DESC;

COMMENT ON VIEW user_geographic_distribution IS 'Geographic distribution of users by country, region, and city';

-- =====================================================
-- 5. CREATE top_countries_regions function
-- =====================================================
CREATE OR REPLACE FUNCTION get_top_countries(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  country_code TEXT,
  country_name TEXT,
  user_count BIGINT,
  active_users BIGINT,
  engagement_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.last_country_code,
    u.last_country_name,
    COUNT(*) as user_count,
    COUNT(*) FILTER (WHERE u.last_active_at > NOW() - INTERVAL '7 days') as active_users,
    jsonb_object_agg(
      u.engagement_tier,
      COUNT(*) FILTER (WHERE u.engagement_tier IS NOT NULL)
    ) as engagement_breakdown
  FROM users u
  WHERE u.last_country_code IS NOT NULL
  GROUP BY u.last_country_code, u.last_country_name
  ORDER BY user_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_top_countries IS 'Get top countries by user count with engagement breakdown';

-- =====================================================
-- 6. CREATE city_distribution function
-- =====================================================
CREATE OR REPLACE FUNCTION get_top_cities(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  city TEXT,
  region TEXT,
  country_name TEXT,
  user_count BIGINT,
  active_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.last_city,
    u.last_region,
    u.last_country_name,
    COUNT(*) as user_count,
    COUNT(*) FILTER (WHERE u.last_active_at > NOW() - INTERVAL '7 days') as active_users
  FROM users u
  WHERE u.last_city IS NOT NULL
  GROUP BY u.last_city, u.last_region, u.last_country_name
  ORDER BY user_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_top_cities IS 'Get top cities by user count';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
COMMENT ON SCHEMA public IS 'Geographic tracking added - October 19, 2025';

-- Example queries:
-- SELECT * FROM user_geographic_distribution LIMIT 20;
-- SELECT * FROM get_top_countries(10);
-- SELECT * FROM get_top_cities(20);
