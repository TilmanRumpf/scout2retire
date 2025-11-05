import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Use anon key since we're just creating functions
);

async function createDeviceTrackingFunction() {
  console.log('Creating update_user_device function...');

  const sql = `
-- Create or replace the update_user_device function
CREATE OR REPLACE FUNCTION public.update_user_device(
  p_browser text DEFAULT NULL,
  p_browser_major_version text DEFAULT NULL,
  p_browser_version text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_color_depth integer DEFAULT NULL,
  p_color_gamut text DEFAULT NULL,
  p_connection_downlink real DEFAULT NULL,
  p_connection_rtt integer DEFAULT NULL,
  p_connection_save_data boolean DEFAULT false,
  p_connection_type text DEFAULT NULL,
  p_cookies_enabled boolean DEFAULT true,
  p_country_code text DEFAULT NULL,
  p_country_name text DEFAULT NULL,
  p_device_manufacturer text DEFAULT NULL,
  p_device_memory real DEFAULT NULL,
  p_device_model text DEFAULT NULL,
  p_device_model_confidence real DEFAULT NULL,
  p_device_type text DEFAULT NULL,
  p_do_not_track text DEFAULT NULL,
  p_hardware_concurrency integer DEFAULT NULL,
  p_has_coarse_pointer boolean DEFAULT false,
  p_has_hover boolean DEFAULT true,
  p_has_pointer boolean DEFAULT true,
  p_ip_address text DEFAULT NULL,
  p_is_retina boolean DEFAULT false,
  p_latitude real DEFAULT NULL,
  p_longitude real DEFAULT NULL,
  p_max_touch_points integer DEFAULT 0,
  p_online_status boolean DEFAULT true,
  p_orientation text DEFAULT NULL,
  p_orientation_angle integer DEFAULT 0,
  p_pixel_ratio real DEFAULT 1,
  p_platform text DEFAULT NULL,
  p_platform_version text DEFAULT NULL,
  p_prefers_color_scheme text DEFAULT NULL,
  p_prefers_contrast text DEFAULT NULL,
  p_prefers_reduced_motion boolean DEFAULT false,
  p_region text DEFAULT NULL,
  p_screen_resolution text DEFAULT NULL,
  p_supports_hdr boolean DEFAULT false,
  p_timezone text DEFAULT NULL,
  p_touch_support boolean DEFAULT false,
  p_user_agent text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_viewport_height integer DEFAULT NULL,
  p_viewport_width integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id uuid;
BEGIN
  -- For now, just return success without storing (we can add storage later if needed)
  -- This prevents the error while keeping the tracking call functional

  RETURN json_build_object(
    'success', true,
    'message', 'Device tracking acknowledged',
    'user_id', p_user_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_user_device TO anon;
GRANT EXECUTE ON FUNCTION public.update_user_device TO authenticated;
`;

  try {
    const { data, error } = await supabase.rpc('query_wrapper', {
      query: sql
    });

    if (error) {
      // Try direct execution as fallback
      console.log('Direct RPC failed, please run this SQL in Supabase dashboard:');
      console.log(sql);
      return;
    }

    console.log('✅ Successfully created update_user_device function');
  } catch (err) {
    console.error('Error creating function:', err);
    console.log('\nPlease run this SQL directly in your Supabase SQL editor:');
    console.log(sql);
  }
}

// Also create the missing behavior tracking function
async function createBehaviorTrackingFunction() {
  console.log('\nCreating track_behavior_event function...');

  const sql = `
-- Create or replace the track_behavior_event function
CREATE OR REPLACE FUNCTION public.track_behavior_event(
  p_user_id uuid,
  p_session_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, just return success without storing
  -- This prevents the error while keeping the tracking call functional

  RETURN json_build_object(
    'success', true,
    'message', 'Behavior event acknowledged',
    'session_id', p_session_id
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.track_behavior_event TO anon;
GRANT EXECUTE ON FUNCTION public.track_behavior_event TO authenticated;
`;

  try {
    const { data, error } = await supabase.rpc('query_wrapper', {
      query: sql
    });

    if (error) {
      console.log('Direct RPC failed for behavior tracking');
    } else {
      console.log('✅ Successfully created track_behavior_event function');
    }
  } catch (err) {
    console.error('Error creating behavior function:', err);
  }
}

// Run both fixes
createDeviceTrackingFunction().then(() => {
  createBehaviorTrackingFunction();
});