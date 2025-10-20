-- =====================================================
-- ENHANCED DEVICE TRACKING
-- Created: October 19, 2025
-- Purpose: Add comprehensive device detection (40+ properties)
--          for UI troubleshooting and debugging
-- =====================================================

-- =====================================================
-- 1. ALTER user_device_history (Add enhanced device tracking columns)
-- =====================================================

ALTER TABLE user_device_history
  -- Exact device model and versions
  ADD COLUMN IF NOT EXISTS device_manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS device_model TEXT,
  ADD COLUMN IF NOT EXISTS device_model_confidence TEXT, -- 'exact', 'group', 'basic'
  ADD COLUMN IF NOT EXISTS platform_version TEXT,
  ADD COLUMN IF NOT EXISTS browser_version TEXT,
  ADD COLUMN IF NOT EXISTS browser_major_version TEXT,

  -- Display details
  ADD COLUMN IF NOT EXISTS viewport_width INTEGER,
  ADD COLUMN IF NOT EXISTS viewport_height INTEGER,
  ADD COLUMN IF NOT EXISTS pixel_ratio DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS is_retina BOOLEAN,
  ADD COLUMN IF NOT EXISTS color_depth INTEGER,
  ADD COLUMN IF NOT EXISTS orientation TEXT, -- 'portrait', 'landscape'
  ADD COLUMN IF NOT EXISTS orientation_angle INTEGER,

  -- Input capabilities
  ADD COLUMN IF NOT EXISTS touch_support BOOLEAN,
  ADD COLUMN IF NOT EXISTS max_touch_points INTEGER,
  ADD COLUMN IF NOT EXISTS has_pointer BOOLEAN, -- fine pointer (mouse)
  ADD COLUMN IF NOT EXISTS has_coarse_pointer BOOLEAN, -- coarse pointer (touch)
  ADD COLUMN IF NOT EXISTS has_hover BOOLEAN,

  -- Browser capabilities
  ADD COLUMN IF NOT EXISTS cookies_enabled BOOLEAN,
  ADD COLUMN IF NOT EXISTS do_not_track TEXT,
  ADD COLUMN IF NOT EXISTS online_status BOOLEAN,

  -- Performance/Hardware
  ADD COLUMN IF NOT EXISTS hardware_concurrency INTEGER, -- CPU cores
  ADD COLUMN IF NOT EXISTS device_memory DECIMAL(4,1), -- RAM in GB

  -- Network
  ADD COLUMN IF NOT EXISTS connection_type TEXT, -- '4g', '5g', 'wifi', etc
  ADD COLUMN IF NOT EXISTS connection_downlink DECIMAL(5,2), -- Mbps
  ADD COLUMN IF NOT EXISTS connection_rtt INTEGER, -- Round-trip time (ms)
  ADD COLUMN IF NOT EXISTS connection_save_data BOOLEAN,

  -- Display preferences
  ADD COLUMN IF NOT EXISTS prefers_color_scheme TEXT, -- 'dark', 'light', 'no-preference'
  ADD COLUMN IF NOT EXISTS prefers_reduced_motion BOOLEAN,
  ADD COLUMN IF NOT EXISTS prefers_contrast TEXT, -- 'high', 'low', 'no-preference'
  ADD COLUMN IF NOT EXISTS color_gamut TEXT, -- 'rec2020', 'p3', 'srgb'
  ADD COLUMN IF NOT EXISTS supports_hdr BOOLEAN;

-- Create indexes for common troubleshooting queries
CREATE INDEX IF NOT EXISTS idx_device_history_model ON user_device_history(device_model);
CREATE INDEX IF NOT EXISTS idx_device_history_manufacturer ON user_device_history(device_manufacturer);
CREATE INDEX IF NOT EXISTS idx_device_history_browser_version ON user_device_history(browser_version);
CREATE INDEX IF NOT EXISTS idx_device_history_platform_version ON user_device_history(platform_version);
CREATE INDEX IF NOT EXISTS idx_device_history_resolution ON user_device_history(screen_resolution);
CREATE INDEX IF NOT EXISTS idx_device_history_pixel_ratio ON user_device_history(pixel_ratio);
CREATE INDEX IF NOT EXISTS idx_device_history_orientation ON user_device_history(orientation);

-- Add comments
COMMENT ON COLUMN user_device_history.device_manufacturer IS 'Device manufacturer (Apple, Samsung, Google, etc.)';
COMMENT ON COLUMN user_device_history.device_model IS 'Exact device model (iPhone 15 Pro, Galaxy S23, etc.)';
COMMENT ON COLUMN user_device_history.device_model_confidence IS 'Detection confidence: exact, group, or basic';
COMMENT ON COLUMN user_device_history.platform_version IS 'OS version (16.5, 13.0, 10/11, etc.)';
COMMENT ON COLUMN user_device_history.browser_version IS 'Full browser version (115.0.5790.110)';
COMMENT ON COLUMN user_device_history.viewport_width IS 'Browser viewport width in pixels';
COMMENT ON COLUMN user_device_history.pixel_ratio IS 'Device pixel ratio (1=standard, 2=retina, 3=ultra)';
COMMENT ON COLUMN user_device_history.orientation IS 'Device orientation (portrait/landscape)';
COMMENT ON COLUMN user_device_history.touch_support IS 'Whether device supports touch input';
COMMENT ON COLUMN user_device_history.hardware_concurrency IS 'Number of logical CPU cores';
COMMENT ON COLUMN user_device_history.device_memory IS 'Device RAM in GB (Chrome only)';
COMMENT ON COLUMN user_device_history.connection_type IS 'Network connection type (4g, 5g, wifi, etc.)';
COMMENT ON COLUMN user_device_history.color_gamut IS 'Supported color gamut (rec2020, p3, srgb)';

-- =====================================================
-- 2. ALTER users (Add current enhanced device fields)
-- =====================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_device_manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS last_device_model TEXT,
  ADD COLUMN IF NOT EXISTS last_device_model_confidence TEXT,
  ADD COLUMN IF NOT EXISTS last_platform_version TEXT,
  ADD COLUMN IF NOT EXISTS last_browser_version TEXT,
  ADD COLUMN IF NOT EXISTS last_screen_resolution TEXT,
  ADD COLUMN IF NOT EXISTS last_viewport_size TEXT,
  ADD COLUMN IF NOT EXISTS last_pixel_ratio DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS last_orientation TEXT,
  ADD COLUMN IF NOT EXISTS last_touch_support BOOLEAN,
  ADD COLUMN IF NOT EXISTS last_connection_type TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_device_model ON users(last_device_model);
CREATE INDEX IF NOT EXISTS idx_users_browser_version ON users(last_browser_version);
CREATE INDEX IF NOT EXISTS idx_users_platform_version ON users(last_platform_version);
CREATE INDEX IF NOT EXISTS idx_users_pixel_ratio ON users(last_pixel_ratio);

COMMENT ON COLUMN users.last_device_model IS 'Most recent exact device model';
COMMENT ON COLUMN users.last_browser_version IS 'Most recent browser version';
COMMENT ON COLUMN users.last_screen_resolution IS 'Most recent screen resolution (e.g., 1920x1080)';
COMMENT ON COLUMN users.last_pixel_ratio IS 'Most recent device pixel ratio (for retina detection)';

-- =====================================================
-- 3. UPDATE update_user_device function (Add enhanced parameters)
-- =====================================================

-- Drop old function
DROP FUNCTION IF EXISTS update_user_device(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INET, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, DECIMAL);

-- Create enhanced function
CREATE OR REPLACE FUNCTION update_user_device(
  p_user_id UUID,
  p_device_type TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_screen_resolution TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  -- Geographic
  p_country_code TEXT DEFAULT NULL,
  p_country_name TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL,
  -- ENHANCED: Device details
  p_device_manufacturer TEXT DEFAULT NULL,
  p_device_model TEXT DEFAULT NULL,
  p_device_model_confidence TEXT DEFAULT NULL,
  p_platform_version TEXT DEFAULT NULL,
  p_browser_version TEXT DEFAULT NULL,
  p_browser_major_version TEXT DEFAULT NULL,
  -- ENHANCED: Display
  p_viewport_width INTEGER DEFAULT NULL,
  p_viewport_height INTEGER DEFAULT NULL,
  p_pixel_ratio DECIMAL DEFAULT NULL,
  p_is_retina BOOLEAN DEFAULT NULL,
  p_color_depth INTEGER DEFAULT NULL,
  p_orientation TEXT DEFAULT NULL,
  p_orientation_angle INTEGER DEFAULT NULL,
  -- ENHANCED: Input capabilities
  p_touch_support BOOLEAN DEFAULT NULL,
  p_max_touch_points INTEGER DEFAULT NULL,
  p_has_pointer BOOLEAN DEFAULT NULL,
  p_has_coarse_pointer BOOLEAN DEFAULT NULL,
  p_has_hover BOOLEAN DEFAULT NULL,
  -- ENHANCED: Browser capabilities
  p_cookies_enabled BOOLEAN DEFAULT NULL,
  p_do_not_track TEXT DEFAULT NULL,
  p_online_status BOOLEAN DEFAULT NULL,
  -- ENHANCED: Performance
  p_hardware_concurrency INTEGER DEFAULT NULL,
  p_device_memory DECIMAL DEFAULT NULL,
  -- ENHANCED: Network
  p_connection_type TEXT DEFAULT NULL,
  p_connection_downlink DECIMAL DEFAULT NULL,
  p_connection_rtt INTEGER DEFAULT NULL,
  p_connection_save_data BOOLEAN DEFAULT NULL,
  -- ENHANCED: Display preferences
  p_prefers_color_scheme TEXT DEFAULT NULL,
  p_prefers_reduced_motion BOOLEAN DEFAULT NULL,
  p_prefers_contrast TEXT DEFAULT NULL,
  p_color_gamut TEXT DEFAULT NULL,
  p_supports_hdr BOOLEAN DEFAULT NULL
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
    -- New device, create entry with all enhanced fields
    INSERT INTO user_device_history (
      user_id, device_type, platform, browser, user_agent, screen_resolution, ip_address,
      country_code, country_name, region, city, timezone, latitude, longitude,
      device_manufacturer, device_model, device_model_confidence, platform_version, browser_version, browser_major_version,
      viewport_width, viewport_height, pixel_ratio, is_retina, color_depth, orientation, orientation_angle,
      touch_support, max_touch_points, has_pointer, has_coarse_pointer, has_hover,
      cookies_enabled, do_not_track, online_status,
      hardware_concurrency, device_memory,
      connection_type, connection_downlink, connection_rtt, connection_save_data,
      prefers_color_scheme, prefers_reduced_motion, prefers_contrast, color_gamut, supports_hdr,
      is_current
    ) VALUES (
      p_user_id, p_device_type, p_platform, p_browser, p_user_agent, p_screen_resolution, p_ip_address,
      p_country_code, p_country_name, p_region, p_city, p_timezone, p_latitude, p_longitude,
      p_device_manufacturer, p_device_model, p_device_model_confidence, p_platform_version, p_browser_version, p_browser_major_version,
      p_viewport_width, p_viewport_height, p_pixel_ratio, p_is_retina, p_color_depth, p_orientation, p_orientation_angle,
      p_touch_support, p_max_touch_points, p_has_pointer, p_has_coarse_pointer, p_has_hover,
      p_cookies_enabled, p_do_not_track, p_online_status,
      p_hardware_concurrency, p_device_memory,
      p_connection_type, p_connection_downlink, p_connection_rtt, p_connection_save_data,
      p_prefers_color_scheme, p_prefers_reduced_motion, p_prefers_contrast, p_color_gamut, p_supports_hdr,
      true
    ) RETURNING id INTO v_device_id;
  ELSE
    -- Update existing device with enhanced fields
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
      -- Enhanced fields
      device_manufacturer = COALESCE(p_device_manufacturer, device_manufacturer),
      device_model = COALESCE(p_device_model, device_model),
      device_model_confidence = COALESCE(p_device_model_confidence, device_model_confidence),
      platform_version = COALESCE(p_platform_version, platform_version),
      browser_version = COALESCE(p_browser_version, browser_version),
      browser_major_version = COALESCE(p_browser_major_version, browser_major_version),
      viewport_width = COALESCE(p_viewport_width, viewport_width),
      viewport_height = COALESCE(p_viewport_height, viewport_height),
      pixel_ratio = COALESCE(p_pixel_ratio, pixel_ratio),
      is_retina = COALESCE(p_is_retina, is_retina),
      color_depth = COALESCE(p_color_depth, color_depth),
      orientation = COALESCE(p_orientation, orientation),
      orientation_angle = COALESCE(p_orientation_angle, orientation_angle),
      touch_support = COALESCE(p_touch_support, touch_support),
      max_touch_points = COALESCE(p_max_touch_points, max_touch_points),
      has_pointer = COALESCE(p_has_pointer, has_pointer),
      has_coarse_pointer = COALESCE(p_has_coarse_pointer, has_coarse_pointer),
      has_hover = COALESCE(p_has_hover, has_hover),
      cookies_enabled = COALESCE(p_cookies_enabled, cookies_enabled),
      do_not_track = COALESCE(p_do_not_track, do_not_track),
      online_status = COALESCE(p_online_status, online_status),
      hardware_concurrency = COALESCE(p_hardware_concurrency, hardware_concurrency),
      device_memory = COALESCE(p_device_memory, device_memory),
      connection_type = COALESCE(p_connection_type, connection_type),
      connection_downlink = COALESCE(p_connection_downlink, connection_downlink),
      connection_rtt = COALESCE(p_connection_rtt, connection_rtt),
      connection_save_data = COALESCE(p_connection_save_data, connection_save_data),
      prefers_color_scheme = COALESCE(p_prefers_color_scheme, prefers_color_scheme),
      prefers_reduced_motion = COALESCE(p_prefers_reduced_motion, prefers_reduced_motion),
      prefers_contrast = COALESCE(p_prefers_contrast, prefers_contrast),
      color_gamut = COALESCE(p_color_gamut, color_gamut),
      supports_hdr = COALESCE(p_supports_hdr, supports_hdr),
      is_current = true
    WHERE id = v_device_id;
  END IF;

  -- Mark other devices as not current
  UPDATE user_device_history
  SET is_current = false
  WHERE user_id = p_user_id AND id != v_device_id;

  -- Update users table with latest enhanced device info
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
    last_timezone = COALESCE(p_timezone, last_timezone),
    -- Enhanced fields
    last_device_manufacturer = COALESCE(p_device_manufacturer, last_device_manufacturer),
    last_device_model = COALESCE(p_device_model, last_device_model),
    last_device_model_confidence = COALESCE(p_device_model_confidence, last_device_model_confidence),
    last_platform_version = COALESCE(p_platform_version, last_platform_version),
    last_browser_version = COALESCE(p_browser_version, last_browser_version),
    last_screen_resolution = COALESCE(p_screen_resolution, last_screen_resolution),
    last_viewport_size = COALESCE(p_viewport_width || 'x' || p_viewport_height, last_viewport_size),
    last_pixel_ratio = COALESCE(p_pixel_ratio, last_pixel_ratio),
    last_orientation = COALESCE(p_orientation, last_orientation),
    last_touch_support = COALESCE(p_touch_support, last_touch_support),
    last_connection_type = COALESCE(p_connection_type, last_connection_type)
  WHERE id = p_user_id;

  RETURN v_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_user_device IS 'Update or create device history with comprehensive enhanced device detection (40+ properties)';

-- =====================================================
-- VERIFICATION
-- =====================================================

COMMENT ON SCHEMA public IS 'Enhanced device tracking added - October 19, 2025';

-- Example query to view enhanced device data:
-- SELECT
--   email,
--   last_device_manufacturer,
--   last_device_model,
--   last_platform || ' ' || last_platform_version as os,
--   last_browser || ' ' || last_browser_version as browser,
--   last_screen_resolution,
--   last_viewport_size,
--   last_pixel_ratio,
--   last_orientation,
--   last_touch_support
-- FROM users
-- WHERE last_device_model IS NOT NULL
-- LIMIT 20;
