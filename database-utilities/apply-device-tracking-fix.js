import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyDeviceTrackingFix() {
  console.log('🚀 Applying Device Tracking Fix');
  console.log('=====================================');
  console.log('Restoring function that tracked Shabnam in Nova Scotia');
  console.log('');

  // Read the SQL from our migration file
  const sqlPath = path.join(process.cwd(), 'supabase/migrations/20251106_restore_full_device_tracking.sql');

  let sqlContent;
  try {
    sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ Found restoration SQL file');
  } catch (err) {
    console.error('❌ Could not find restoration SQL file');
    return;
  }

  // Extract just the function creation part (remove BEGIN/COMMIT and comments)
  const cleanSql = sqlContent
    .replace(/^--.*$/gm, '') // Remove comments
    .replace(/BEGIN;/g, '')
    .replace(/COMMIT;/g, '')
    .replace(/DO \$\$[\s\S]*?\$\$;/g, '') // Remove DO blocks
    .trim();

  // Split into individual statements
  const statements = cleanSql.split(/;(?=\s*(DROP|CREATE|GRANT))/);

  console.log(`📝 Found ${statements.length} SQL statements to execute`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement) continue;

    // Get first 50 chars for logging
    const preview = statement.substring(0, 50).replace(/\n/g, ' ');

    try {
      // For function creation, we'll try a different approach
      if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(`[${i+1}/${statements.length}] Creating update_user_device function...`);

        // Write it to a temporary file
        const tempSqlFile = 'database-utilities/temp-device-tracking.sql';
        fs.writeFileSync(tempSqlFile, statement + ';');

        console.log('   ⚠️ Function creation requires manual execution');
        console.log(`   📝 SQL saved to ${tempSqlFile}`);
        failCount++;

      } else if (statement.includes('DROP FUNCTION')) {
        console.log(`[${i+1}/${statements.length}] Dropping old function...`);

        // Try to drop using a different approach
        const { error } = await supabase.rpc('execute_sql_wrapper', {
          sql_statement: statement + ';'
        });

        if (error) {
          console.log('   ⚠️ Could not drop (may not exist)');
        } else {
          console.log('   ✅ Dropped successfully');
          successCount++;
        }

      } else if (statement.includes('GRANT')) {
        console.log(`[${i+1}/${statements.length}] Granting permissions...`);
        console.log('   ⏭️ Skipping (will be handled after function creation)');
      }
    } catch (err) {
      console.log(`   ❌ Failed: ${err.message}`);
      failCount++;
    }
  }

  console.log('');
  console.log('=====================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('');

  // Create the complete SQL file for manual execution
  const fullRestoreSql = `-- ============================================================================
-- RESTORE FULL DEVICE TRACKING FUNCTION
-- ============================================================================
-- This restores the function that tracked Shabnam in Nova Scotia in October
-- Generated: ${new Date().toISOString()}
-- ============================================================================

-- Drop the simplified version that replaced our working function
DROP FUNCTION IF EXISTS public.update_user_device CASCADE;

-- Restore the FULL function with all 40+ parameters
CREATE OR REPLACE FUNCTION public.update_user_device(
  p_user_id UUID DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_screen_resolution TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  -- Geographic parameters
  p_country_code TEXT DEFAULT NULL,
  p_country_name TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL,
  -- Enhanced device details
  p_device_manufacturer TEXT DEFAULT NULL,
  p_device_model TEXT DEFAULT NULL,
  p_device_model_confidence TEXT DEFAULT NULL,
  p_platform_version TEXT DEFAULT NULL,
  p_browser_version TEXT DEFAULT NULL,
  p_browser_major_version TEXT DEFAULT NULL,
  -- Display properties
  p_viewport_width INTEGER DEFAULT NULL,
  p_viewport_height INTEGER DEFAULT NULL,
  p_pixel_ratio DECIMAL DEFAULT NULL,
  p_is_retina BOOLEAN DEFAULT NULL,
  p_color_depth INTEGER DEFAULT NULL,
  p_orientation TEXT DEFAULT NULL,
  p_orientation_angle INTEGER DEFAULT NULL,
  -- Input capabilities
  p_touch_support BOOLEAN DEFAULT NULL,
  p_max_touch_points INTEGER DEFAULT NULL,
  p_has_pointer BOOLEAN DEFAULT NULL,
  p_has_coarse_pointer BOOLEAN DEFAULT NULL,
  p_has_hover BOOLEAN DEFAULT NULL,
  -- Browser capabilities
  p_cookies_enabled BOOLEAN DEFAULT NULL,
  p_do_not_track TEXT DEFAULT NULL,
  p_online_status BOOLEAN DEFAULT NULL,
  -- Performance
  p_hardware_concurrency INTEGER DEFAULT NULL,
  p_device_memory DECIMAL DEFAULT NULL,
  -- Network
  p_connection_type TEXT DEFAULT NULL,
  p_connection_downlink DECIMAL DEFAULT NULL,
  p_connection_rtt INTEGER DEFAULT NULL,
  p_connection_save_data BOOLEAN DEFAULT NULL,
  -- Display preferences
  p_prefers_color_scheme TEXT DEFAULT NULL,
  p_prefers_reduced_motion BOOLEAN DEFAULT NULL,
  p_prefers_contrast TEXT DEFAULT NULL,
  p_color_gamut TEXT DEFAULT NULL,
  p_supports_hdr BOOLEAN DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_device_id UUID;
BEGIN
  -- Return null if no user_id provided
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if device already exists for this user
  SELECT id INTO v_device_id
  FROM public.user_device_history
  WHERE user_id = p_user_id
    AND COALESCE(device_type, '') = COALESCE(p_device_type, '')
    AND COALESCE(platform, '') = COALESCE(p_platform, '')
    AND COALESCE(browser, '') = COALESCE(p_browser, '')
  LIMIT 1;

  IF v_device_id IS NULL THEN
    -- New device, create entry with all enhanced fields
    INSERT INTO public.user_device_history (
      user_id, device_type, platform, browser, user_agent, screen_resolution, ip_address,
      country_code, country_name, region, city, timezone, latitude, longitude,
      device_manufacturer, device_model, device_model_confidence,
      platform_version, browser_version, browser_major_version,
      viewport_width, viewport_height, pixel_ratio, is_retina, color_depth,
      orientation, orientation_angle,
      touch_support, max_touch_points, has_pointer, has_coarse_pointer, has_hover,
      cookies_enabled, do_not_track, online_status,
      hardware_concurrency, device_memory,
      connection_type, connection_downlink, connection_rtt, connection_save_data,
      prefers_color_scheme, prefers_reduced_motion, prefers_contrast,
      color_gamut, supports_hdr,
      is_current
    ) VALUES (
      p_user_id, p_device_type, p_platform, p_browser, p_user_agent,
      p_screen_resolution, p_ip_address::inet,
      p_country_code, p_country_name, p_region, p_city, p_timezone, p_latitude, p_longitude,
      p_device_manufacturer, p_device_model, p_device_model_confidence,
      p_platform_version, p_browser_version, p_browser_major_version,
      p_viewport_width, p_viewport_height, p_pixel_ratio, p_is_retina, p_color_depth,
      p_orientation, p_orientation_angle,
      p_touch_support, p_max_touch_points, p_has_pointer, p_has_coarse_pointer, p_has_hover,
      p_cookies_enabled, p_do_not_track, p_online_status,
      p_hardware_concurrency, p_device_memory,
      p_connection_type, p_connection_downlink, p_connection_rtt, p_connection_save_data,
      p_prefers_color_scheme, p_prefers_reduced_motion, p_prefers_contrast,
      p_color_gamut, p_supports_hdr,
      true
    ) RETURNING id INTO v_device_id;
  ELSE
    -- Update existing device with enhanced fields
    UPDATE public.user_device_history
    SET
      last_seen_at = NOW(),
      session_count = session_count + 1,
      user_agent = COALESCE(p_user_agent, user_agent),
      screen_resolution = COALESCE(p_screen_resolution, screen_resolution),
      ip_address = COALESCE(p_ip_address::inet, ip_address),
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
  UPDATE public.user_device_history
  SET is_current = false
  WHERE user_id = p_user_id AND id != v_device_id;

  -- Update users table with latest enhanced device info
  UPDATE public.users
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
    last_latitude = COALESCE(p_latitude, last_latitude),
    last_longitude = COALESCE(p_longitude, last_longitude)
  WHERE id = p_user_id;

  RETURN v_device_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_user_device TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_device TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_device TO service_role;

-- Verify it worked
SELECT
  proname as function_name,
  pronargs as parameter_count,
  pg_get_function_identity_arguments(oid) as parameters
FROM pg_proc
WHERE proname = 'update_user_device'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
`;

  const outputPath = 'database-utilities/EXECUTE_THIS_restore_device_tracking.sql';
  fs.writeFileSync(outputPath, fullRestoreSql);

  console.log('📝 MANUAL EXECUTION REQUIRED');
  console.log('=====================================');
  console.log(`Complete SQL saved to: ${outputPath}`);
  console.log('');
  console.log('NEXT STEPS:');
  console.log('1. Go to Supabase Dashboard (https://supabase.com/dashboard)');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Paste and execute the SQL from EXECUTE_THIS_restore_device_tracking.sql');
  console.log('4. Verify the function exists with 46+ parameters');
  console.log('');
  console.log('This will restore the device tracking that worked for Shabnam in Nova Scotia!');
}

// Run the fix
applyDeviceTrackingFix().catch(console.error);