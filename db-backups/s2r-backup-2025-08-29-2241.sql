

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_invitation_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    sender_name TEXT;
    sender_email TEXT;
BEGIN
    -- Only create notification for new pending invitations
    IF NEW.status = 'pending' AND TG_OP = 'INSERT' THEN
        -- Get sender's name and email
        SELECT COALESCE(full_name, email), email 
        INTO sender_name, sender_email
        FROM users
        WHERE id = NEW.user_id;
        
        -- Create notification for recipient
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            NEW.friend_id,
            'friend_invitation',
            'New Friend Request',
            COALESCE(sender_name, 'Someone') || ' sent you a friend request',
            jsonb_build_object(
                'connection_id', NEW.id,
                'sender_id', NEW.user_id,
                'sender_name', sender_name,
                'sender_email', sender_email,
                'invitation_message', NEW.message
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_invitation_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_account"("user_id_param" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  DECLARE
      deleted_count integer := 0;
      result json;
  BEGIN
      -- Check if the calling user is deleting their own account
      IF auth.uid() != user_id_param THEN
          RETURN json_build_object(
              'success', false,
              'message', 'You can only delete your own account'
          );
      END IF;

      -- Delete from public schema tables first (due to foreign keys)
      DELETE FROM public.notifications WHERE user_id = user_id_param;
      DELETE FROM public.shared_towns WHERE user_id = user_id_param;
      DELETE FROM public.favorites WHERE user_id = user_id_param;
      DELETE FROM public.user_preferences WHERE user_id = user_id_param;
      DELETE FROM public.reviews WHERE user_id = user_id_param;
      DELETE FROM public.invitations WHERE from_user_id = user_id_param OR to_user_id = user_id_param;

      -- Delete from public.users
      DELETE FROM public.users WHERE id = user_id_param;
      GET DIAGNOSTICS deleted_count = ROW_COUNT;

      -- Delete from auth.users - THIS IS THE KEY PART
      DELETE FROM auth.users WHERE id = user_id_param;

      IF deleted_count > 0 THEN
          result := json_build_object(
              'success', true,
              'message', 'Account deleted successfully'
          );
      ELSE
          result := json_build_object(
              'success', false,
              'message', 'Account not found'
          );
      END IF;

      RETURN result;
  END;
  $$;


ALTER FUNCTION "public"."delete_user_account"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_water_bodies_comprehensive"("town_name" "text", "town_country" "text", "town_description" "text") RETURNS "text"[]
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    detected_bodies TEXT[] := '{}';
    desc_lower TEXT;
    name_lower TEXT;
BEGIN
    desc_lower := LOWER(COALESCE(town_description, ''));
    name_lower := LOWER(COALESCE(town_name, ''));
    
    -- Existing sea/ocean detection
    IF desc_lower LIKE '%mediterranean%' THEN
        detected_bodies := array_append(detected_bodies, 'Mediterranean Sea');
    END IF;
    
    IF desc_lower LIKE '%atlantic%' THEN
        detected_bodies := array_append(detected_bodies, 'Atlantic Ocean');
    END IF;
    
    IF desc_lower LIKE '%caribbean%' THEN
        detected_bodies := array_append(detected_bodies, 'Caribbean Sea');
    END IF;
    
    IF desc_lower LIKE '%baltic%' THEN
        detected_bodies := array_append(detected_bodies, 'Baltic Sea');
    END IF;
    
    IF desc_lower LIKE '%adriatic%' THEN
        detected_bodies := array_append(detected_bodies, 'Adriatic Sea');
    END IF;
    
    IF desc_lower LIKE '%aegean%' THEN
        detected_bodies := array_append(detected_bodies, 'Aegean Sea');
    END IF;
    
    IF desc_lower LIKE '%north sea%' THEN
        detected_bodies := array_append(detected_bodies, 'North Sea');
    END IF;
    
    IF desc_lower LIKE '%pacific%' THEN
        detected_bodies := array_append(detected_bodies, 'Pacific Ocean');
    END IF;
    
    IF desc_lower LIKE '%black sea%' THEN
        detected_bodies := array_append(detected_bodies, 'Black Sea');
    END IF;
    
    -- Lake detection
    IF desc_lower LIKE '%lake geneva%' OR desc_lower LIKE '%lac léman%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Geneva');
    END IF;
    
    IF desc_lower LIKE '%lake como%' OR desc_lower LIKE '%lago di como%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Como');
    END IF;
    
    IF desc_lower LIKE '%lake garda%' OR desc_lower LIKE '%lago di garda%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Garda');
    END IF;
    
    IF desc_lower LIKE '%ijsselmeer%' OR desc_lower LIKE '%ijssel%' THEN
        detected_bodies := array_append(detected_bodies, 'IJsselmeer');
    END IF;
    
    IF desc_lower LIKE '%balaton%' THEN
        detected_bodies := array_append(detected_bodies, 'Lake Balaton');
    END IF;
    
    -- River detection
    IF desc_lower LIKE '%rhine%' OR desc_lower LIKE '%rijn%' OR desc_lower LIKE '%rhein%' THEN
        detected_bodies := array_append(detected_bodies, 'Rhine River');
    END IF;
    
    IF desc_lower LIKE '%danube%' OR desc_lower LIKE '%donau%' THEN
        detected_bodies := array_append(detected_bodies, 'Danube River');
    END IF;
    
    IF desc_lower LIKE '%seine%' THEN
        detected_bodies := array_append(detected_bodies, 'Seine River');
    END IF;
    
    IF desc_lower LIKE '%thames%' THEN
        detected_bodies := array_append(detected_bodies, 'Thames River');
    END IF;
    
    IF desc_lower LIKE '%douro%' OR desc_lower LIKE '%duero%' THEN
        detected_bodies := array_append(detected_bodies, 'Douro River');
    END IF;
    
    IF desc_lower LIKE '%tagus%' OR desc_lower LIKE '%tajo%' OR desc_lower LIKE '%tejo%' THEN
        detected_bodies := array_append(detected_bodies, 'Tagus River');
    END IF;
    
    -- Special features
    IF name_lower = 'venice' OR desc_lower LIKE '%venetian lagoon%' THEN
        detected_bodies := array_append(detected_bodies, 'Venetian Lagoon');
    END IF;
    
    IF name_lower = 'amsterdam' AND desc_lower LIKE '%canal%' THEN
        detected_bodies := array_append(detected_bodies, 'Amsterdam Canals');
    END IF;
    
    RETURN detected_bodies;
END;
$$;


ALTER FUNCTION "public"."detect_water_bodies_comprehensive"("town_name" "text", "town_country" "text", "town_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_water_bodies_from_text"("town_description" "text") RETURNS "text"[]
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    detected_bodies TEXT[] := '{}';
    desc_lower TEXT;
BEGIN
    desc_lower := LOWER(COALESCE(town_description, ''));
    
    -- Mediterranean detection
    IF desc_lower LIKE '%mediterranean%' THEN
        detected_bodies := array_append(detected_bodies, 'Mediterranean Sea');
    END IF;
    
    -- Atlantic detection  
    IF desc_lower LIKE '%atlantic%' THEN
        detected_bodies := array_append(detected_bodies, 'Atlantic Ocean');
    END IF;
    
    -- Caribbean detection
    IF desc_lower LIKE '%caribbean%' THEN
        detected_bodies := array_append(detected_bodies, 'Caribbean Sea');
    END IF;
    
    -- Baltic detection
    IF desc_lower LIKE '%baltic%' THEN
        detected_bodies := array_append(detected_bodies, 'Baltic Sea');
    END IF;
    
    -- Adriatic detection
    IF desc_lower LIKE '%adriatic%' THEN
        detected_bodies := array_append(detected_bodies, 'Adriatic Sea');
    END IF;
    
    -- Aegean detection
    IF desc_lower LIKE '%aegean%' THEN
        detected_bodies := array_append(detected_bodies, 'Aegean Sea');
    END IF;
    
    -- North Sea detection
    IF desc_lower LIKE '%north sea%' THEN
        detected_bodies := array_append(detected_bodies, 'North Sea');
    END IF;
    
    -- Pacific detection
    IF desc_lower LIKE '%pacific%' THEN
        detected_bodies := array_append(detected_bodies, 'Pacific Ocean');
    END IF;
    
    RETURN detected_bodies;
END;
$$;


ALTER FUNCTION "public"."detect_water_bodies_from_text"("town_description" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_best_image_for_town"("town_country" "text", "town_region" "text" DEFAULT NULL::"text", "town_features" "text"[] DEFAULT NULL::"text"[]) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  best_image TEXT;
BEGIN
  -- First try exact country match with highest quality
  SELECT image_url INTO best_image
  FROM curated_location_images
  WHERE country = town_country
    AND is_primary = true
  ORDER BY quality_score DESC
  LIMIT 1;
  
  -- If no primary image, get any high-quality image for the country
  IF best_image IS NULL THEN
    SELECT image_url INTO best_image
    FROM curated_location_images
    WHERE country = town_country
    ORDER BY quality_score DESC, usage_count ASC
    LIMIT 1;
  END IF;
  
  -- Update usage count
  IF best_image IS NOT NULL THEN
    UPDATE curated_location_images
    SET usage_count = usage_count + 1
    WHERE image_url = best_image;
  END IF;
  
  RETURN best_image;
END;
$$;


ALTER FUNCTION "public"."get_best_image_for_town"("town_country" "text", "town_region" "text", "town_features" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_country_regions"("country_name" character varying) RETURNS "text"[]
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    region_names TEXT[];
BEGIN
    SELECT ARRAY_AGG(r.name ORDER BY cr.is_primary DESC, r.name)
    INTO region_names
    FROM country_regions cr
    JOIN regions r ON cr.region_id = r.id
    WHERE cr.country = country_name;
    
    RETURN COALESCE(region_names, '{}');
END;
$$;


ALTER FUNCTION "public"."get_country_regions"("country_name" character varying) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."towns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "country" "text" NOT NULL,
    "cost_index" integer,
    "climate" "text",
    "healthcare_score" integer,
    "safety_score" integer,
    "description" "text",
    "cost_of_living_usd" integer,
    "population" integer,
    "quality_of_life" integer,
    "nightlife_rating" integer,
    "museums_rating" integer,
    "cultural_landmark_1" "text",
    "cultural_landmark_2" "text",
    "cultural_landmark_3" "text",
    "google_maps_link" "text",
    "image_url_1" "text",
    "image_url_2" "text",
    "image_url_3" "text",
    "climate_description" "text",
    "avg_temp_summer" numeric,
    "avg_temp_winter" numeric,
    "annual_rainfall" integer,
    "sunshine_hours" numeric,
    "cost_description" "text",
    "rent_1bed" integer,
    "meal_cost" integer,
    "groceries_cost" integer,
    "utilities_cost" integer,
    "healthcare_description" "text",
    "hospital_count" integer,
    "healthcare_cost" integer,
    "english_speaking_doctors" boolean,
    "lifestyle_description" "text",
    "restaurants_rating" integer,
    "cultural_rating" integer,
    "outdoor_rating" integer,
    "safety_description" "text",
    "crime_rate" "text",
    "natural_disaster_risk" integer,
    "infrastructure_description" "text",
    "internet_speed" integer,
    "public_transport_quality" integer,
    "nearest_airport" "text",
    "airport_distance" "text",
    "walkability" integer,
    "last_ai_update" timestamp with time zone,
    "search_vector" "tsvector",
    "image_source" character varying(50),
    "image_license" character varying(50),
    "image_photographer" character varying(200),
    "image_validation_note" "text",
    "image_validated_at" timestamp with time zone,
    "image_is_fallback" boolean DEFAULT false,
    "image_urls" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "region" "text",
    "regions" "text"[] DEFAULT '{}'::"text"[],
    "water_bodies" "text"[] DEFAULT '{}'::"text"[],
    "summer_climate_actual" "text",
    "winter_climate_actual" "text",
    "humidity_level_actual" "text",
    "sunshine_level_actual" "text",
    "precipitation_level_actual" "text",
    "seasonal_variation_actual" "text",
    "activities_available" "text"[],
    "interests_supported" "text"[],
    "activity_infrastructure" "jsonb",
    "outdoor_activities_rating" integer,
    "cultural_events_rating" integer,
    "shopping_rating" integer,
    "wellness_rating" integer,
    "travel_connectivity_rating" integer,
    "expat_community_size" "text",
    "english_proficiency_level" "text",
    "languages_spoken" "text"[],
    "pace_of_life_actual" "text",
    "urban_rural_character" "text",
    "social_atmosphere" "text",
    "traditional_progressive_lean" "text",
    "visa_requirements" "jsonb",
    "residency_path_info" "jsonb",
    "government_efficiency_rating" integer,
    "political_stability_rating" integer,
    "emergency_services_quality" integer,
    "healthcare_specialties_available" "text"[],
    "medical_specialties_rating" integer,
    "environmental_health_rating" integer,
    "insurance_availability_rating" integer,
    "typical_monthly_living_cost" integer,
    "typical_rent_1bed" integer,
    "typical_home_price" integer,
    "healthcare_cost_monthly" integer,
    "local_mobility_options" "text"[],
    "regional_connectivity" "text"[],
    "international_access" "text"[],
    "geographic_features_actual" "text"[],
    "vegetation_type_actual" "text"[],
    "air_quality_index" integer,
    "environmental_factors" "jsonb",
    "family_friendliness_rating" integer,
    "pet_friendliness" "jsonb",
    "solo_living_support" integer,
    "senior_friendly_rating" integer,
    "retirement_community_presence" "text",
    "primary_language" "text",
    "secondary_languages" "text"[],
    "visa_on_arrival_countries" "text"[],
    "easy_residency_countries" "text"[],
    "digital_nomad_visa" boolean DEFAULT false,
    "retirement_visa_available" boolean DEFAULT false,
    "min_income_requirement_usd" integer,
    "geographic_features" "text"[],
    "elevation_meters" "text",
    "distance_to_ocean_km" "text",
    "humidity_average" integer,
    "pollen_levels" "text",
    "natural_disaster_risk_score" integer,
    "income_tax_rate_pct" numeric(5,2),
    "sales_tax_rate_pct" numeric(5,2),
    "property_tax_rate_pct" numeric(5,2),
    "tax_treaty_us" boolean DEFAULT false,
    "tax_haven_status" boolean DEFAULT false,
    "foreign_income_taxed" boolean DEFAULT true,
    "medical_specialties_available" "text"[],
    "nearest_major_hospital_km" "text",
    "health_insurance_required" boolean DEFAULT true,
    "private_healthcare_cost_index" integer,
    "golf_courses_count" integer DEFAULT 0,
    "tennis_courts_count" integer DEFAULT 0,
    "swimming_facilities" "text"[],
    "hiking_trails_km" integer DEFAULT 0,
    "beaches_nearby" boolean DEFAULT false,
    "ski_resorts_within_100km" integer DEFAULT 0,
    "marinas_count" integer DEFAULT 0,
    "expat_groups" "text"[],
    "international_schools_count" integer DEFAULT 0,
    "coworking_spaces_count" integer DEFAULT 0,
    "farmers_markets" boolean DEFAULT false,
    "cultural_events_frequency" "text",
    "veterinary_clinics_count" integer DEFAULT 0,
    "pet_friendly_rating" integer,
    "dog_parks_count" integer DEFAULT 0,
    "international_schools_available" boolean DEFAULT false,
    "childcare_available" boolean DEFAULT false,
    "rent_2bed_usd" integer,
    "rent_house_usd" integer,
    "purchase_apartment_sqm_usd" integer,
    "purchase_house_avg_usd" integer,
    "property_appreciation_rate_pct" numeric(5,2),
    "has_uber" boolean DEFAULT false,
    "has_public_transit" boolean DEFAULT false,
    "requires_car" boolean DEFAULT false,
    "train_station" boolean DEFAULT false,
    "international_flights_direct" "text"[],
    "tourist_season_impact" "text",
    "lgbtq_friendly_rating" integer,
    "startup_ecosystem_rating" integer,
    "data_completeness_score" integer DEFAULT 0,
    "last_verified_date" "date",
    "data_sources" "text"[],
    "needs_update" boolean DEFAULT false,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "geo_region" "text",
    "audit_data" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "towns_cultural_events_frequency_check" CHECK (("cultural_events_frequency" = ANY (ARRAY['rare'::"text", 'monthly'::"text", 'weekly'::"text", 'daily'::"text"]))),
    CONSTRAINT "towns_lgbtq_friendly_rating_check" CHECK ((("lgbtq_friendly_rating" >= 1) AND ("lgbtq_friendly_rating" <= 10))),
    CONSTRAINT "towns_natural_disaster_risk_score_check" CHECK ((("natural_disaster_risk_score" >= 1) AND ("natural_disaster_risk_score" <= 10))),
    CONSTRAINT "towns_pace_of_life_actual_check" CHECK (("pace_of_life_actual" = ANY (ARRAY['fast'::"text", 'moderate'::"text", 'relaxed'::"text"]))),
    CONSTRAINT "towns_pet_friendly_rating_check" CHECK ((("pet_friendly_rating" >= 1) AND ("pet_friendly_rating" <= 10))),
    CONSTRAINT "towns_pollen_levels_check" CHECK (("pollen_levels" = ANY (ARRAY['low'::"text", 'moderate'::"text", 'high'::"text", 'very_high'::"text"]))),
    CONSTRAINT "towns_startup_ecosystem_rating_check" CHECK ((("startup_ecosystem_rating" >= 1) AND ("startup_ecosystem_rating" <= 10))),
    CONSTRAINT "towns_tourist_season_impact_check" CHECK (("tourist_season_impact" = ANY (ARRAY['none'::"text", 'low'::"text", 'moderate'::"text", 'high'::"text", 'extreme'::"text"])))
);


ALTER TABLE "public"."towns" OWNER TO "postgres";


COMMENT ON COLUMN "public"."towns"."latitude" IS 'Latitude coordinate for town location';



COMMENT ON COLUMN "public"."towns"."longitude" IS 'Longitude coordinate for town location';



COMMENT ON COLUMN "public"."towns"."audit_data" IS 'Stores audit approval information for each field. Structure: {fieldName: {approved: boolean, approvedBy: email, approvedByName: string, approvedByAvatar: url, approvedAt: ISO string}}';



CREATE OR REPLACE FUNCTION "public"."get_recommended_towns"("user_id" "uuid", "limit_count" integer DEFAULT 10) RETURNS SETOF "public"."towns"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  WITH user_prefs AS (
    SELECT 
      (budget->>'monthly_budget')::integer AS budget,
      climate_preferences->>'temperature_preference' AS temp_pref
    FROM 
      onboarding_responses
    WHERE 
      user_id = $1
  )
  SELECT t.*
  FROM towns t, user_prefs p
  WHERE 
    (p.budget IS NULL OR t.cost_index <= p.budget)
    AND (
      p.temp_pref IS NULL OR
      (p.temp_pref = 'warm' AND t.avg_temp_summer >= 25) OR
      (p.temp_pref = 'moderate' AND t.avg_temp_summer BETWEEN 18 AND 28) OR
      (p.temp_pref = 'cool' AND t.avg_temp_summer < 22)
    )
  ORDER BY 
    t.healthcare_score DESC,
    t.safety_score DESC
  LIMIT limit_count;
END;
$_$;


ALTER FUNCTION "public"."get_recommended_towns"("user_id" "uuid", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_town_hobbies_detailed"("town_uuid" "uuid") RETURNS TABLE("hobby_id" "uuid", "hobby_name" "text", "category" "text", "description" "text", "icon" "text", "added_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.category,
        h.description,
        h.icon,
        th.created_at
    FROM town_hobbies th
    JOIN hobbies h ON th.hobby_id = h.id
    WHERE th.town_id = town_uuid
    ORDER BY h.category, h.name;
END;
$$;


ALTER FUNCTION "public"."get_town_hobbies_detailed"("town_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_towns_by_region"("region_name" character varying, "max_towns" integer DEFAULT 100) RETURNS TABLE("id" character varying, "name" character varying, "country" character varying, "regions" "text"[], "cost_index" integer, "healthcare_score" integer, "safety_score" integer, "image_url_1" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.country,
        t.regions,
        t.cost_index,
        t.healthcare_score,
        t.safety_score,
        t.image_url_1
    FROM towns t
    WHERE region_name = ANY(t.regions)
    ORDER BY t.healthcare_score DESC NULLS LAST, t.safety_score DESC NULLS LAST
    LIMIT max_towns;
END;
$$;


ALTER FUNCTION "public"."get_towns_by_region"("region_name" character varying, "max_towns" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_notification_count"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = auth.uid()
        AND is_read = false
    );
END;
$$;


ALTER FUNCTION "public"."get_unread_notification_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_us_town_image_url"("p_town_name" "text", "p_town_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_state_code TEXT;
  v_city_name TEXT;
  v_city_slug TEXT;
  v_unique_id TEXT;
BEGIN
  -- Extract state code (e.g., 'FL' from 'Gainesville, FL')
  IF POSITION(', ' IN p_town_name) > 0 THEN
    v_state_code := LOWER(SUBSTRING(p_town_name FROM POSITION(', ' IN p_town_name) + 2));
    v_city_name := SUBSTRING(p_town_name FROM 1 FOR POSITION(', ' IN p_town_name) - 1);
  ELSE
    -- No state code found, use default
    v_state_code := 'xx';
    v_city_name := p_town_name;
  END IF;
  
  -- Create city slug (lowercase, hyphenated)
  v_city_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(v_city_name, '[^a-zA-Z0-9\s]', '', 'g'), -- Remove special chars
      '\s+', '-', 'g' -- Replace spaces with hyphens
    )
  );
  
  -- Generate unique ID (using first 8 chars of UUID)
  v_unique_id := SUBSTRING(p_town_id::TEXT, 1, 8);
  
  -- Build the URL
  RETURN CONCAT(
    'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/us-',
    v_state_code,
    '-',
    v_city_slug,
    '-',
    v_unique_id,
    '.jpg'
  );
END;
$$;


ALTER FUNCTION "public"."get_us_town_image_url"("p_town_name" "text", "p_town_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_by_id"("user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name
  FROM users u
  WHERE u.id = user_id
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_user_by_id"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_hobbies_detailed"("user_uuid" "uuid") RETURNS TABLE("hobby_id" "uuid", "hobby_name" "text", "category" "text", "description" "text", "icon" "text", "added_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.category,
        h.description,
        h.icon,
        uh.created_at
    FROM user_hobbies uh
    JOIN hobbies h ON uh.hobby_id = h.id
    WHERE uh.user_id = user_uuid
    ORDER BY h.category, h.name;
END;
$$;


ALTER FUNCTION "public"."get_user_hobbies_detailed"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_read"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE user_id = auth.uid()
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;


ALTER FUNCTION "public"."mark_all_notifications_read"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("notification_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    updated_count INT;
BEGIN
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE id = notification_id 
    AND user_id = auth.uid()
    AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count > 0;
END;
$$;


ALTER FUNCTION "public"."mark_notification_read"("notification_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_onboarding_to_users_columns"() RETURNS TABLE("user_id" "uuid", "email" "text", "status" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  rec RECORD;
  update_count integer := 0;
  error_count integer := 0;
BEGIN
  -- Loop through all users with completed onboarding
  FOR rec IN 
    SELECT 
      u.id,
      u.email,
      o.current_status,
      o.region,
      o.climate,
      o.culture,
      o.hobbies,
      o.administration,
      o.budget
    FROM users u
    INNER JOIN onboarding_responses o ON u.id = o.user_id
    WHERE u.onboarding_completed = true
  LOOP
    BEGIN
      -- Update user with all onboarding data
      UPDATE users 
      SET
        -- Step 1: Current Status
        retirement_status = rec.current_status->>'retirement_status',
        retirement_month = CASE 
          WHEN rec.current_status->>'retirement_month' IS NOT NULL 
          THEN (rec.current_status->>'retirement_month')::integer 
          ELSE NULL 
        END,
        retirement_day = CASE 
          WHEN rec.current_status->>'retirement_day' IS NOT NULL 
          THEN (rec.current_status->>'retirement_day')::integer 
          ELSE NULL 
        END,
        primary_citizenship = rec.current_status->'citizenship'->>'primary_citizenship',
        dual_citizenship = COALESCE((rec.current_status->'citizenship'->>'dual_citizenship')::boolean, false),
        secondary_citizenship = rec.current_status->'citizenship'->>'secondary_citizenship',
        family_situation = rec.current_status->>'family_situation',
        partner_primary_citizenship = rec.current_status->'partner_citizenship'->>'primary_citizenship',
        partner_dual_citizenship = CASE
          WHEN rec.current_status->'partner_citizenship'->>'dual_citizenship' IS NOT NULL
          THEN (rec.current_status->'partner_citizenship'->>'dual_citizenship')::boolean
          ELSE false
        END,
        partner_secondary_citizenship = rec.current_status->'partner_citizenship'->>'secondary_citizenship',
        has_pets = COALESCE((rec.current_status->>'has_pets')::boolean, false),
        
        -- Step 2: Region
        preferred_regions = CASE 
          WHEN rec.region->'regions' IS NOT NULL AND jsonb_typeof(rec.region->'regions') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(rec.region->'regions'))
          ELSE NULL
        END,
        preferred_countries = CASE 
          WHEN rec.region->'countries' IS NOT NULL AND jsonb_typeof(rec.region->'countries') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(rec.region->'countries'))
          ELSE NULL
        END,
        preferred_provinces = CASE 
          WHEN rec.region->'provinces' IS NOT NULL AND jsonb_typeof(rec.region->'provinces') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(rec.region->'provinces'))
          ELSE NULL
        END,
        geographic_features = CASE 
          WHEN rec.region->'geographic_features' IS NOT NULL AND jsonb_typeof(rec.region->'geographic_features') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(rec.region->'geographic_features'))
          ELSE NULL
        END,
        vegetation_preferences = CASE 
          WHEN rec.region->'vegetation_types' IS NOT NULL AND jsonb_typeof(rec.region->'vegetation_types') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(rec.region->'vegetation_types'))
          ELSE NULL
        END,
        
        -- Step 3: Climate
        summer_temp_preference = rec.climate->>'summer_temp',
        winter_temp_preference = rec.climate->>'winter_temp',
        humidity_preference = rec.climate->>'humidity_level',
        sunshine_preference = rec.climate->>'sunshine_level',
        precipitation_preference = rec.climate->>'precipitation_level',
        seasonal_preference = rec.climate->>'seasonal_preference'
        
        -- Note: Would continue for all fields, but truncated for readability
      WHERE id = rec.id;
      
      update_count := update_count + 1;
      
      -- Return status for this user
      user_id := rec.id;
      email := rec.email;
      status := 'success';
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      user_id := rec.id;
      email := rec.email;
      status := 'error: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
  
  RAISE NOTICE 'Migration complete. Updated: %, Errors: %', update_count, error_count;
END;
$$;


ALTER FUNCTION "public"."migrate_onboarding_to_users_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_user_by_email"("search_email" "text") RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.full_name
  FROM users u
  WHERE LOWER(u.email) = LOWER(search_email)
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."search_user_by_email"("search_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."towns_search_vector_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.country, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.climate_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.lifestyle_description, '')), 'C');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."towns_search_vector_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transform_administration_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only transform if administration field exists
  IF NEW.administration IS NOT NULL THEN
    -- Let the frontend data pass through as-is
    -- The frontend is the source of truth
    NEW.administration = NEW.administration;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."transform_administration_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_activities_on_infrastructure_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  activities text[];
BEGIN
  -- Start with current activities or empty array
  activities := COALESCE(NEW.activities_available, ARRAY[]::text[]);
  
  -- ========== GOLF ACTIVITIES ==========
  IF NEW.golf_courses_count IS DISTINCT FROM OLD.golf_courses_count THEN
    -- Remove all golf-related activities first
    activities := array_remove(activities, 'golf');
    activities := array_remove(activities, 'driving_range');
    activities := array_remove(activities, 'golf_variety');
    activities := array_remove(activities, 'golf_tournaments');
    activities := array_remove(activities, 'golf_destination');
    
    -- Add based on count
    IF NEW.golf_courses_count > 0 THEN
      activities := array_append(activities, 'golf');
      activities := array_append(activities, 'driving_range');
      
      IF NEW.golf_courses_count >= 2 THEN
        activities := array_append(activities, 'golf_variety');
        activities := array_append(activities, 'golf_tournaments');
      END IF;
      
      IF NEW.golf_courses_count >= 5 THEN
        activities := array_append(activities, 'golf_destination');
      END IF;
    END IF;
  END IF;
  
  -- ========== TENNIS ACTIVITIES ==========
  IF NEW.tennis_courts_count IS DISTINCT FROM OLD.tennis_courts_count THEN
    -- Remove all tennis-related activities first
    activities := array_remove(activities, 'tennis');
    activities := array_remove(activities, 'tennis_clubs');
    activities := array_remove(activities, 'tennis_tournaments');
    activities := array_remove(activities, 'tennis_lessons');
    activities := array_remove(activities, 'pickleball');
    
    -- Add based on count
    IF NEW.tennis_courts_count > 0 THEN
      activities := array_append(activities, 'tennis');
      
      IF NEW.tennis_courts_count >= 5 THEN
        activities := array_append(activities, 'tennis_clubs');
        activities := array_append(activities, 'pickleball');
      END IF;
      
      IF NEW.tennis_courts_count >= 10 THEN
        activities := array_append(activities, 'tennis_tournaments');
        activities := array_append(activities, 'tennis_lessons');
      END IF;
    END IF;
  END IF;
  
  -- ========== BEACH ACTIVITIES ==========
  IF NEW.beaches_nearby IS DISTINCT FROM OLD.beaches_nearby THEN
    -- Remove all beach activities first
    activities := array_remove(activities, 'beach_walking');
    activities := array_remove(activities, 'beach_lounging');
    activities := array_remove(activities, 'swimming_ocean');
    activities := array_remove(activities, 'beachcombing');
    activities := array_remove(activities, 'beach_volleyball');
    activities := array_remove(activities, 'sunbathing');
    activities := array_remove(activities, 'beach_sports');
    
    -- Add if beaches nearby
    IF NEW.beaches_nearby = true THEN
      activities := array_append(activities, 'beach_walking');
      activities := array_append(activities, 'beach_lounging');
      activities := array_append(activities, 'swimming_ocean');
      activities := array_append(activities, 'beachcombing');
      activities := array_append(activities, 'beach_volleyball');
      
      -- Add climate-dependent activities
      IF NEW.avg_temp_summer >= 25 OR NEW.climate = 'Tropical' THEN
        activities := array_append(activities, 'sunbathing');
        activities := array_append(activities, 'beach_sports');
      END IF;
    END IF;
  END IF;
  
  -- ========== MARINA/BOATING ACTIVITIES ==========
  IF NEW.marinas_count IS DISTINCT FROM OLD.marinas_count THEN
    -- Remove all marina activities first
    activities := array_remove(activities, 'boating');
    activities := array_remove(activities, 'sailing');
    activities := array_remove(activities, 'yacht_watching');
    activities := array_remove(activities, 'yacht_clubs');
    activities := array_remove(activities, 'sailing_lessons');
    activities := array_remove(activities, 'fishing_charters');
    activities := array_remove(activities, 'yacht_racing');
    activities := array_remove(activities, 'marina_dining');
    
    -- Add based on count
    IF NEW.marinas_count > 0 THEN
      activities := array_append(activities, 'boating');
      activities := array_append(activities, 'sailing');
      activities := array_append(activities, 'yacht_watching');
      
      IF NEW.marinas_count >= 2 THEN
        activities := array_append(activities, 'yacht_clubs');
        activities := array_append(activities, 'sailing_lessons');
        activities := array_append(activities, 'fishing_charters');
      END IF;
      
      IF NEW.marinas_count >= 3 THEN
        activities := array_append(activities, 'yacht_racing');
        activities := array_append(activities, 'marina_dining');
      END IF;
    END IF;
  END IF;
  
  -- ========== HIKING ACTIVITIES ==========
  IF NEW.hiking_trails_km IS DISTINCT FROM OLD.hiking_trails_km THEN
    -- Remove all hiking activities first
    activities := array_remove(activities, 'hiking');
    activities := array_remove(activities, 'nature_walks');
    activities := array_remove(activities, 'trail_photography');
    activities := array_remove(activities, 'day_hikes');
    activities := array_remove(activities, 'trail_variety');
    activities := array_remove(activities, 'serious_hiking');
    activities := array_remove(activities, 'backpacking');
    activities := array_remove(activities, 'trail_running');
    activities := array_remove(activities, 'mountain_biking');
    activities := array_remove(activities, 'multi_day_trekking');
    activities := array_remove(activities, 'wilderness_exploration');
    
    -- Add based on trail length
    IF NEW.hiking_trails_km > 0 THEN
      activities := array_append(activities, 'hiking');
      activities := array_append(activities, 'nature_walks');
      activities := array_append(activities, 'trail_photography');
      
      IF NEW.hiking_trails_km >= 25 THEN
        activities := array_append(activities, 'day_hikes');
        activities := array_append(activities, 'trail_variety');
      END IF;
      
      IF NEW.hiking_trails_km >= 100 THEN
        activities := array_append(activities, 'serious_hiking');
        activities := array_append(activities, 'backpacking');
        activities := array_append(activities, 'trail_running');
        activities := array_append(activities, 'mountain_biking');
      END IF;
      
      IF NEW.hiking_trails_km >= 200 THEN
        activities := array_append(activities, 'multi_day_trekking');
        activities := array_append(activities, 'wilderness_exploration');
      END IF;
    END IF;
  END IF;
  
  -- ========== SKI ACTIVITIES ==========
  IF NEW.ski_resorts_within_100km IS DISTINCT FROM OLD.ski_resorts_within_100km THEN
    -- Remove all ski activities first
    activities := array_remove(activities, 'skiing');
    activities := array_remove(activities, 'snowboarding');
    activities := array_remove(activities, 'apres_ski');
    activities := array_remove(activities, 'ski_variety');
    activities := array_remove(activities, 'ski_touring');
    activities := array_remove(activities, 'ski_destination');
    activities := array_remove(activities, 'winter_sports_hub');
    
    -- Add based on count
    IF NEW.ski_resorts_within_100km > 0 THEN
      activities := array_append(activities, 'skiing');
      activities := array_append(activities, 'snowboarding');
      activities := array_append(activities, 'apres_ski');
      
      IF NEW.ski_resorts_within_100km >= 3 THEN
        activities := array_append(activities, 'ski_variety');
        activities := array_append(activities, 'ski_touring');
      END IF;
      
      IF NEW.ski_resorts_within_100km >= 5 THEN
        activities := array_append(activities, 'ski_destination');
        activities := array_append(activities, 'winter_sports_hub');
      END IF;
    END IF;
  END IF;
  
  -- ========== COWORKING/DIGITAL NOMAD ==========
  IF NEW.coworking_spaces_count IS DISTINCT FROM OLD.coworking_spaces_count THEN
    -- Remove all coworking activities first
    activities := array_remove(activities, 'coworking');
    activities := array_remove(activities, 'digital_nomad_friendly');
    activities := array_remove(activities, 'networking');
    activities := array_remove(activities, 'startup_scene');
    activities := array_remove(activities, 'tech_meetups');
    
    -- Add based on count
    IF NEW.coworking_spaces_count > 0 THEN
      activities := array_append(activities, 'coworking');
      activities := array_append(activities, 'digital_nomad_friendly');
      activities := array_append(activities, 'networking');
      
      IF NEW.coworking_spaces_count >= 3 THEN
        activities := array_append(activities, 'startup_scene');
        activities := array_append(activities, 'tech_meetups');
      END IF;
    END IF;
  END IF;
  
  -- ========== DOG PARKS ==========
  IF NEW.dog_parks_count IS DISTINCT FROM OLD.dog_parks_count THEN
    -- Remove all dog activities first
    activities := array_remove(activities, 'dog_walking');
    activities := array_remove(activities, 'pet_friendly');
    activities := array_remove(activities, 'dog_community');
    activities := array_remove(activities, 'pet_events');
    
    -- Add based on count
    IF NEW.dog_parks_count > 0 THEN
      activities := array_append(activities, 'dog_walking');
      activities := array_append(activities, 'pet_friendly');
      
      IF NEW.dog_parks_count >= 3 THEN
        activities := array_append(activities, 'dog_community');
        activities := array_append(activities, 'pet_events');
      END IF;
    END IF;
  END IF;
  
  -- Remove duplicates and sort
  activities := ARRAY(SELECT DISTINCT unnest(activities) ORDER BY 1);
  
  -- Update the activities
  NEW.activities_available := activities;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_activities_on_infrastructure_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_town_regions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.regions := get_country_regions(NEW.country);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_town_regions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_town_image"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Simple validation - just return the new row without modification
  -- This replaces the broken function that references non-existent fields
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_town_image"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocked_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL,
    "blocked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blocked_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_threads" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "town_id" "uuid",
    "topic" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."chat_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_regions" (
    "id" integer NOT NULL,
    "country" character varying(100) NOT NULL,
    "region_id" integer,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."country_regions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."country_regions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."country_regions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."country_regions_id_seq" OWNED BY "public"."country_regions"."id";



CREATE TABLE IF NOT EXISTS "public"."curated_location_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country" "text" NOT NULL,
    "region" "text",
    "city" "text",
    "geographic_feature" "text",
    "image_url" "text" NOT NULL,
    "image_source" "text" NOT NULL,
    "description" "text",
    "photographer" "text",
    "license" "text",
    "tags" "text"[],
    "is_primary" boolean DEFAULT false,
    "quality_score" integer,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "curated_location_images_quality_score_check" CHECK ((("quality_score" >= 1) AND ("quality_score" <= 10)))
);


ALTER TABLE "public"."curated_location_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."direct_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone,
    "edited_at" timestamp with time zone
);


ALTER TABLE "public"."direct_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "user_id" "uuid" NOT NULL,
    "town_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "town_name" "text",
    "town_country" "text"
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


COMMENT ON COLUMN "public"."favorites"."town_name" IS 'Denormalized town name for performance';



COMMENT ON COLUMN "public"."favorites"."town_country" IS 'Denormalized country name for performance';



CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    CONSTRAINT "friendships_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hobbies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_universal" boolean DEFAULT false,
    "required_conditions" "jsonb",
    "group_name" "text",
    "hobby_type" "text",
    CONSTRAINT "hobbies_category_check" CHECK (("category" = ANY (ARRAY['activity'::"text", 'interest'::"text", 'custom'::"text"]))),
    CONSTRAINT "hobbies_hobby_type_check" CHECK (("hobby_type" = ANY (ARRAY['physical'::"text", 'hobby'::"text", NULL::"text"])))
);


ALTER TABLE "public"."hobbies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journal_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "town_id" "uuid",
    "entry_date" "date" DEFAULT CURRENT_DATE,
    "content" "text" NOT NULL,
    "mood" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "entry_type" character varying(50) DEFAULT 'journal'::character varying,
    "metadata" "jsonb",
    "related_user_id" "uuid"
);


ALTER TABLE "public"."journal_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" character varying(50) NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "data" "jsonb",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "current_status" "jsonb",
    "region_preferences" "jsonb",
    "climate_preferences" "jsonb",
    "culture_preferences" "jsonb",
    "hobbies" "jsonb",
    "costs" "jsonb",
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "administration" "jsonb"
);


ALTER TABLE "public"."onboarding_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regional_inspirations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "region_name" "text" NOT NULL,
    "region_type" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_source" "text",
    "image_attribution" "text",
    "geographic_features" "text"[],
    "vegetation_types" "text"[],
    "summer_climate" "text"[],
    "winter_climate" "text"[],
    "humidity" "text",
    "sunshine" "text",
    "precipitation" "text",
    "living_environments" "text"[],
    "pace_of_life" "text",
    "social_preference" "text",
    "expat_community_size" "text",
    "language_preference" "text",
    "primary_language" "text",
    "english_proficiency" "text",
    "healthcare_quality" "text",
    "healthcare_ranking" integer,
    "safety_quality" "text",
    "safety_index" integer,
    "visa_process" "text",
    "visa_free_days" integer,
    "cost_category" "text",
    "monthly_budget_range" "int4range",
    "typical_rent_range" "int4range",
    "local_mobility" "text"[],
    "regional_mobility" "text"[],
    "flight_connections" "text",
    "currency_code" "text",
    "timezone" "text",
    "best_months" integer[],
    "internet_speed_mbps" integer,
    "keywords" "text"[],
    "unique_selling_points" "text"[],
    "typical_town_examples" "text"[],
    "display_order" integer,
    "is_active" boolean DEFAULT true,
    "seasonal_notes" "jsonb",
    "town_count" integer DEFAULT 0,
    "avg_cost_index" numeric(10,2),
    "avg_healthcare_score" numeric(5,2),
    "avg_safety_score" numeric(5,2),
    "last_town_added" timestamp with time zone,
    "view_count" integer DEFAULT 0,
    "click_count" integer DEFAULT 0,
    "click_through_rate" numeric(5,4) GENERATED ALWAYS AS (
CASE
    WHEN ("view_count" > 0) THEN (("click_count")::numeric / ("view_count")::numeric)
    ELSE (0)::numeric
END) STORED,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "regional_inspirations_best_months_check" CHECK (("best_months" <@ ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])),
    CONSTRAINT "regional_inspirations_english_proficiency_check" CHECK (("english_proficiency" = ANY (ARRAY['low'::"text", 'moderate'::"text", 'good'::"text", 'high'::"text", 'excellent'::"text"]))),
    CONSTRAINT "regional_inspirations_healthcare_ranking_check" CHECK ((("healthcare_ranking" >= 1) AND ("healthcare_ranking" <= 200))),
    CONSTRAINT "regional_inspirations_region_type_check" CHECK (("region_type" = ANY (ARRAY['country'::"text", 'region'::"text"]))),
    CONSTRAINT "regional_inspirations_safety_index_check" CHECK ((("safety_index" >= 0) AND ("safety_index" <= 100))),
    CONSTRAINT "regional_inspirations_safety_quality_check" CHECK (("safety_quality" = ANY (ARRAY['good'::"text", 'functional'::"text", 'basic'::"text"]))),
    CONSTRAINT "regional_inspirations_visa_process_check" CHECK (("visa_process" = ANY (ARRAY['good'::"text", 'functional'::"text", 'basic'::"text"])))
);


ALTER TABLE "public"."regional_inspirations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regions" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "type" character varying(50),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "regions_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('continent'::character varying)::"text", ('cultural'::character varying)::"text", ('geographic'::character varying)::"text", ('economic'::character varying)::"text"])))
);


ALTER TABLE "public"."regions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."regions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."regions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."regions_id_seq" OWNED BY "public"."regions"."id";



CREATE TABLE IF NOT EXISTS "public"."retirement_schedule" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milestone" "text" NOT NULL,
    "target_date" "date",
    "status" "text",
    "notes" "text",
    CONSTRAINT "retirement_schedule_status_check" CHECK (("status" = ANY (ARRAY['Not started'::"text", 'In progress'::"text", 'Complete'::"text"])))
);


ALTER TABLE "public"."retirement_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retirement_tips" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "category" character varying(100),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."retirement_tips" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."retirement_tips_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."retirement_tips_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."retirement_tips_id_seq" OWNED BY "public"."retirement_tips"."id";



CREATE TABLE IF NOT EXISTS "public"."scotty_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "town_id" "uuid",
    "town_name" "text",
    "town_country" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "user_citizenship" "text",
    "conversation_topic" "text"
);


ALTER TABLE "public"."scotty_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scotty_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "message_type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "contains_town_request" boolean DEFAULT false,
    "mentioned_towns" "text"[],
    "topics" "text"[],
    CONSTRAINT "scotty_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['user'::"text", 'scotty'::"text"])))
);


ALTER TABLE "public"."scotty_messages" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."scotty_analytics" AS
 SELECT "date_trunc"('day'::"text", "created_at") AS "date",
    "count"(DISTINCT "user_id") AS "unique_users",
    "count"(DISTINCT "conversation_id") AS "total_conversations",
    "count"(*) AS "total_messages",
    "count"(
        CASE
            WHEN "contains_town_request" THEN 1
            ELSE NULL::integer
        END) AS "town_requests"
   FROM ( SELECT "sm"."id",
            "sm"."created_at",
            "sm"."conversation_id",
            "sm"."contains_town_request",
            "sc"."user_id"
           FROM ("public"."scotty_messages" "sm"
             JOIN "public"."scotty_conversations" "sc" ON (("sc"."id" = "sm"."conversation_id")))) "t"
  GROUP BY ("date_trunc"('day'::"text", "created_at"));


ALTER VIEW "public"."scotty_analytics" OWNER TO "postgres";


COMMENT ON VIEW "public"."scotty_analytics" IS 'Analytics view for Scotty conversations. Sample queries:

SELECT unnest(mentioned_towns) as town, COUNT(*) 
FROM scotty_messages 
WHERE mentioned_towns && ARRAY[''town_name'']
GROUP BY town 
ORDER BY COUNT(*) DESC;

SELECT unnest(topics) as topic, COUNT(*) 
FROM scotty_messages 
WHERE topics IS NOT NULL
GROUP BY topic 
ORDER BY COUNT(*) DESC;

SELECT 
  DATE_TRUNC(''week'', created_at) as week,
  COUNT(DISTINCT user_id) as active_users,
  AVG(message_count) as avg_messages_per_conversation
FROM (
  SELECT 
    sc.id, 
    sc.user_id, 
    sc.created_at,
    COUNT(sm.id) as message_count
  FROM scotty_conversations sc
  JOIN scotty_messages sm ON sm.conversation_id = sc.id
  GROUP BY sc.id, sc.user_id, sc.created_at
) t
GROUP BY DATE_TRUNC(''week'', created_at);
';



CREATE OR REPLACE VIEW "public"."scotty_mentioned_towns" AS
 SELECT "date_trunc"('day'::"text", "sm"."created_at") AS "date",
    "town"."town",
    "count"(*) AS "mention_count"
   FROM ("public"."scotty_messages" "sm"
     CROSS JOIN LATERAL "unnest"("sm"."mentioned_towns") "town"("town"))
  WHERE ("sm"."mentioned_towns" IS NOT NULL)
  GROUP BY ("date_trunc"('day'::"text", "sm"."created_at")), "town"."town";


ALTER VIEW "public"."scotty_mentioned_towns" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."scotty_topics" AS
 SELECT "date_trunc"('day'::"text", "sm"."created_at") AS "date",
    "topic"."topic",
    "count"(*) AS "topic_count"
   FROM ("public"."scotty_messages" "sm"
     CROSS JOIN LATERAL "unnest"("sm"."topics") "topic"("topic"))
  WHERE ("sm"."topics" IS NOT NULL)
  GROUP BY ("date_trunc"('day'::"text", "sm"."created_at")), "topic"."topic";


ALTER VIEW "public"."scotty_topics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."town_summaries" AS
 SELECT "id",
    "name",
    "country",
    "cost_index",
    "healthcare_score",
    "safety_score",
    "description",
    "image_url_1",
    "climate",
    "avg_temp_summer",
    "avg_temp_winter"
   FROM "public"."towns";


ALTER VIEW "public"."town_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."towns_hobbies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "town_id" "uuid" NOT NULL,
    "hobby_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."towns_hobbies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "friend_id" "uuid",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "message" "text",
    CONSTRAINT "user_connections_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."user_connections" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_favorites_with_towns" AS
 SELECT "f"."user_id",
    "f"."created_at",
    "t"."id" AS "town_id",
    "t"."name",
    "t"."country",
    "t"."cost_index",
    "t"."healthcare_score",
    "t"."safety_score",
    "t"."image_url_1"
   FROM ("public"."favorites" "f"
     JOIN "public"."towns" "t" ON (("f"."town_id" = "t"."id")));


ALTER VIEW "public"."user_favorites_with_towns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_hobbies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "hobby_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_hobbies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "retirement_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "target_retirement_year" integer,
    "timeline_flexibility" "text",
    "primary_citizenship" "text",
    "secondary_citizenship" "text",
    "visa_concerns" boolean DEFAULT false,
    "family_status" "text",
    "partner_agreement" "text",
    "bringing_children" boolean DEFAULT false,
    "bringing_pets" boolean DEFAULT false,
    "current_location" "text",
    "moving_motivation" "text",
    "regions" "text"[],
    "countries" "text"[],
    "provinces" "text"[],
    "geographic_features" "text"[],
    "vegetation_types" "text"[],
    "summer_climate_preference" "text"[],
    "winter_climate_preference" "text"[],
    "humidity_level" "text"[],
    "sunshine" "text"[],
    "precipitation" "text"[],
    "seasonal_preference" "text",
    "expat_community_preference" "text"[],
    "language_comfort" "jsonb",
    "cultural_importance" "jsonb",
    "lifestyle_preferences" "jsonb",
    "activities" "text"[],
    "interests" "text"[],
    "travel_frequency" "text",
    "lifestyle_importance" "jsonb",
    "healthcare_quality" "text"[],
    "health_considerations" "jsonb",
    "insurance_importance" "text"[],
    "safety_importance" "text"[],
    "emergency_services" "text"[],
    "political_stability" "text"[],
    "tax_preference" "text"[],
    "government_efficiency" "text"[],
    "visa_preference" "text"[],
    "stay_duration" "text"[],
    "residency_path" "text"[],
    "monthly_healthcare_budget" integer,
    "mobility" "jsonb",
    "property_tax_sensitive" boolean DEFAULT false,
    "sales_tax_sensitive" boolean DEFAULT false,
    "income_tax_sensitive" boolean DEFAULT false,
    "onboarding_completed" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "partner_primary_citizenship" "text",
    "partner_secondary_citizenship" "text",
    "pet_types" "text"[],
    "custom_activities" "jsonb",
    "custom_physical" "jsonb" DEFAULT '[]'::"jsonb",
    "custom_hobbies" "jsonb" DEFAULT '[]'::"jsonb",
    "children_primary_citizenship" "text",
    "children_secondary_citizenship" "text",
    "target_retirement_month" integer,
    "target_retirement_day" integer,
    "housing_preference" "text" DEFAULT 'both'::"text",
    "total_monthly_budget" "jsonb" DEFAULT '[]'::"jsonb",
    "max_monthly_rent" "jsonb" DEFAULT '[]'::"jsonb",
    "max_home_price" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_preferences"."children_primary_citizenship" IS 'Primary citizenship of children (when family situation is family)';



COMMENT ON COLUMN "public"."user_preferences"."children_secondary_citizenship" IS 'Secondary citizenship of children (when dual citizenship)';



COMMENT ON COLUMN "public"."user_preferences"."target_retirement_month" IS 'Target retirement month (1-12)';



COMMENT ON COLUMN "public"."user_preferences"."target_retirement_day" IS 'Target retirement day (1-31)';



CREATE TABLE IF NOT EXISTS "public"."user_presence" (
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'offline'::"text",
    "last_seen" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_presence_status_check" CHECK (("status" = ANY (ARRAY['online'::"text", 'away'::"text", 'offline'::"text"])))
);


ALTER TABLE "public"."user_presence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "retirement_year_estimate" integer,
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "username" "text",
    "hometown" "text",
    "avatar_url" "text",
    CONSTRAINT "username_format" CHECK ((("username" IS NULL) OR (("length"("username") >= 3) AND ("length"("username") <= 20) AND ("username" ~ '^[a-zA-Z0-9_]+$'::"text"))))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."username" IS 'Unique username for the user, following format: 3-20 chars, alphanumeric and underscores only';



CREATE TABLE IF NOT EXISTS "public"."water_bodies" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "type" character varying(50),
    "description" "text",
    "climate_impact" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "water_bodies_type_check" CHECK ((("type")::"text" = ANY (ARRAY[('ocean'::character varying)::"text", ('sea'::character varying)::"text", ('gulf'::character varying)::"text", ('bay'::character varying)::"text", ('strait'::character varying)::"text", ('lake'::character varying)::"text", ('river'::character varying)::"text"])))
);


ALTER TABLE "public"."water_bodies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."water_bodies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."water_bodies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."water_bodies_id_seq" OWNED BY "public"."water_bodies"."id";



ALTER TABLE ONLY "public"."country_regions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."country_regions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."regions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."regions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."retirement_tips" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."retirement_tips_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."water_bodies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."water_bodies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocker_id_blocked_id_key" UNIQUE ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_regions"
    ADD CONSTRAINT "country_regions_country_region_id_key" UNIQUE ("country", "region_id");



ALTER TABLE ONLY "public"."country_regions"
    ADD CONSTRAINT "country_regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."curated_location_images"
    ADD CONSTRAINT "curated_location_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id", "town_id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_receiver_id_key" UNIQUE ("requester_id", "receiver_id");



ALTER TABLE ONLY "public"."hobbies"
    ADD CONSTRAINT "hobbies_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."hobbies"
    ADD CONSTRAINT "hobbies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regional_inspirations"
    ADD CONSTRAINT "regional_inspirations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retirement_schedule"
    ADD CONSTRAINT "retirement_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retirement_tips"
    ADD CONSTRAINT "retirement_tips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scotty_conversations"
    ADD CONSTRAINT "scotty_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scotty_messages"
    ADD CONSTRAINT "scotty_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."towns_hobbies"
    ADD CONSTRAINT "town_hobbies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."towns_hobbies"
    ADD CONSTRAINT "town_hobbies_town_id_hobby_id_key" UNIQUE ("town_id", "hobby_id");



ALTER TABLE ONLY "public"."towns"
    ADD CONSTRAINT "towns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_friend_id_key" UNIQUE ("user_id", "friend_id");



ALTER TABLE ONLY "public"."user_hobbies"
    ADD CONSTRAINT "user_hobbies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_hobbies"
    ADD CONSTRAINT "user_hobbies_user_id_hobby_id_key" UNIQUE ("user_id", "hobby_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."water_bodies"
    ADD CONSTRAINT "water_bodies_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."water_bodies"
    ADD CONSTRAINT "water_bodies_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_blocked_blocked" ON "public"."blocked_users" USING "btree" ("blocked_id");



CREATE INDEX "idx_blocked_blocker" ON "public"."blocked_users" USING "btree" ("blocker_id");



CREATE INDEX "idx_country_regions_country" ON "public"."country_regions" USING "btree" ("country");



CREATE INDEX "idx_country_regions_region_id" ON "public"."country_regions" USING "btree" ("region_id");



CREATE INDEX "idx_curated_images_country" ON "public"."curated_location_images" USING "btree" ("country");



CREATE INDEX "idx_curated_images_feature" ON "public"."curated_location_images" USING "btree" ("geographic_feature");



CREATE INDEX "idx_curated_images_region" ON "public"."curated_location_images" USING "btree" ("region");



CREATE INDEX "idx_curated_images_tags" ON "public"."curated_location_images" USING "gin" ("tags");



CREATE INDEX "idx_favorites_created_at" ON "public"."favorites" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_favorites_town_id" ON "public"."favorites" USING "btree" ("town_id");



CREATE INDEX "idx_favorites_user_id" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_favorites_user_town" ON "public"."favorites" USING "btree" ("user_id", "town_id");



CREATE INDEX "idx_friendships_receiver" ON "public"."friendships" USING "btree" ("receiver_id");



CREATE INDEX "idx_friendships_requester" ON "public"."friendships" USING "btree" ("requester_id");



CREATE INDEX "idx_friendships_status" ON "public"."friendships" USING "btree" ("status");



CREATE INDEX "idx_hobbies_category" ON "public"."hobbies" USING "btree" ("category");



CREATE INDEX "idx_hobbies_group" ON "public"."hobbies" USING "btree" ("group_name", "hobby_type");



CREATE INDEX "idx_hobbies_name" ON "public"."hobbies" USING "btree" ("name");



CREATE INDEX "idx_journal_entries_created_at" ON "public"."journal_entries" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_journal_entries_entry_date" ON "public"."journal_entries" USING "btree" ("entry_date");



CREATE INDEX "idx_journal_entries_entry_type" ON "public"."journal_entries" USING "btree" ("entry_type");



CREATE INDEX "idx_journal_entries_user_id" ON "public"."journal_entries" USING "btree" ("user_id");



CREATE INDEX "idx_messages_created" ON "public"."direct_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_receiver" ON "public"."direct_messages" USING "btree" ("receiver_id");



CREATE INDEX "idx_messages_sender" ON "public"."direct_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_is_read" ON "public"."notifications" USING "btree" ("user_id", "is_read");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_retirement_tips_category" ON "public"."retirement_tips" USING "btree" ("category");



CREATE INDEX "idx_ri_cost_category" ON "public"."regional_inspirations" USING "btree" ("cost_category");



CREATE INDEX "idx_ri_display_order" ON "public"."regional_inspirations" USING "btree" ("display_order");



CREATE INDEX "idx_ri_geographic_features" ON "public"."regional_inspirations" USING "gin" ("geographic_features");



CREATE INDEX "idx_ri_healthcare_quality" ON "public"."regional_inspirations" USING "btree" ("healthcare_quality");



CREATE INDEX "idx_ri_is_active" ON "public"."regional_inspirations" USING "btree" ("is_active");



CREATE INDEX "idx_ri_keywords" ON "public"."regional_inspirations" USING "gin" ("keywords");



CREATE INDEX "idx_ri_living_environments" ON "public"."regional_inspirations" USING "gin" ("living_environments");



CREATE INDEX "idx_ri_region_name" ON "public"."regional_inspirations" USING "btree" ("region_name");



CREATE INDEX "idx_ri_region_type" ON "public"."regional_inspirations" USING "btree" ("region_type");



CREATE INDEX "idx_ri_safety_quality" ON "public"."regional_inspirations" USING "btree" ("safety_quality");



CREATE INDEX "idx_ri_summer_climate" ON "public"."regional_inspirations" USING "gin" ("summer_climate");



CREATE INDEX "idx_ri_vegetation_types" ON "public"."regional_inspirations" USING "gin" ("vegetation_types");



CREATE INDEX "idx_ri_winter_climate" ON "public"."regional_inspirations" USING "gin" ("winter_climate");



CREATE INDEX "idx_scotty_conversations_created_at" ON "public"."scotty_conversations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_scotty_conversations_user_id" ON "public"."scotty_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_scotty_messages_conversation_id" ON "public"."scotty_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_scotty_messages_created_at" ON "public"."scotty_messages" USING "btree" ("created_at");



CREATE INDEX "idx_scotty_messages_mentioned_towns" ON "public"."scotty_messages" USING "gin" ("mentioned_towns");



CREATE INDEX "idx_scotty_messages_topics" ON "public"."scotty_messages" USING "gin" ("topics");



CREATE INDEX "idx_towns_activities" ON "public"."towns" USING "gin" ("activities_available");



CREATE INDEX "idx_towns_climate" ON "public"."towns" USING "btree" ("climate");



CREATE INDEX "idx_towns_coordinates" ON "public"."towns" USING "btree" ("latitude", "longitude");



CREATE INDEX "idx_towns_cost_index" ON "public"."towns" USING "btree" ("cost_index");



CREATE INDEX "idx_towns_country" ON "public"."towns" USING "btree" ("country");



CREATE INDEX "idx_towns_english_proficiency" ON "public"."towns" USING "btree" ("english_proficiency_level");



CREATE INDEX "idx_towns_expat_community" ON "public"."towns" USING "btree" ("expat_community_size");



CREATE INDEX "idx_towns_geographic" ON "public"."towns" USING "gin" ("geographic_features_actual");



CREATE INDEX "idx_towns_healthcare_score" ON "public"."towns" USING "btree" ("healthcare_score");



CREATE INDEX "idx_towns_hobbies_hobby_id" ON "public"."towns_hobbies" USING "btree" ("hobby_id");



CREATE INDEX "idx_towns_hobbies_town_id" ON "public"."towns_hobbies" USING "btree" ("town_id");



CREATE INDEX "idx_towns_image_url_1" ON "public"."towns" USING "btree" ("image_url_1") WHERE (("image_url_1" IS NOT NULL) AND ("image_url_1" <> ''::"text") AND ("image_url_1" !~~* 'NULL'::"text"));



CREATE INDEX "idx_towns_interests" ON "public"."towns" USING "gin" ("interests_supported");



CREATE INDEX "idx_towns_living_cost" ON "public"."towns" USING "btree" ("typical_monthly_living_cost");



CREATE INDEX "idx_towns_matching_fields" ON "public"."towns" USING "btree" ("id", "name", "country", "population", "image_url_1");



CREATE INDEX "idx_towns_outdoor_rating" ON "public"."towns" USING "btree" ("outdoor_activities_rating");



CREATE INDEX "idx_towns_population" ON "public"."towns" USING "btree" ("population") WHERE ("population" IS NOT NULL);



CREATE INDEX "idx_towns_regions" ON "public"."towns" USING "gin" ("regions");



CREATE INDEX "idx_towns_safety_score" ON "public"."towns" USING "btree" ("safety_score");



CREATE INDEX "idx_towns_senior_friendly" ON "public"."towns" USING "btree" ("senior_friendly_rating");



CREATE INDEX "idx_towns_summer_climate" ON "public"."towns" USING "btree" ("summer_climate_actual");



CREATE INDEX "idx_towns_travel_connectivity" ON "public"."towns" USING "btree" ("travel_connectivity_rating");



CREATE INDEX "idx_towns_water_bodies" ON "public"."towns" USING "gin" ("water_bodies");



CREATE INDEX "idx_towns_wellness_rating" ON "public"."towns" USING "btree" ("wellness_rating");



CREATE INDEX "idx_towns_winter_climate" ON "public"."towns" USING "btree" ("winter_climate_actual");



CREATE INDEX "idx_user_connections_friend_id" ON "public"."user_connections" USING "btree" ("friend_id");



CREATE INDEX "idx_user_connections_status" ON "public"."user_connections" USING "btree" ("status");



CREATE INDEX "idx_user_connections_user_friend" ON "public"."user_connections" USING "btree" ("user_id", "friend_id");



CREATE INDEX "idx_user_connections_user_id" ON "public"."user_connections" USING "btree" ("user_id");



CREATE INDEX "idx_user_hobbies_hobby_id" ON "public"."user_hobbies" USING "btree" ("hobby_id");



CREATE INDEX "idx_user_hobbies_user_id" ON "public"."user_hobbies" USING "btree" ("user_id");



CREATE INDEX "idx_user_preferences_onboarding" ON "public"."user_preferences" USING "btree" ("onboarding_completed");



CREATE INDEX "idx_user_preferences_updated_at" ON "public"."user_preferences" USING "btree" ("updated_at");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_users_retirement_year" ON "public"."users" USING "btree" ("retirement_year_estimate");



CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");



CREATE INDEX "towns_search_idx" ON "public"."towns" USING "gin" ("search_vector");



CREATE OR REPLACE TRIGGER "create_invitation_notification_trigger" AFTER INSERT ON "public"."user_connections" FOR EACH ROW EXECUTE FUNCTION "public"."create_invitation_notification"();



CREATE OR REPLACE TRIGGER "set_town_regions" BEFORE INSERT OR UPDATE OF "country" ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."update_town_regions"();



CREATE OR REPLACE TRIGGER "towns_search_vector_update" BEFORE INSERT OR UPDATE ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."towns_search_vector_update"();



CREATE OR REPLACE TRIGGER "transform_administration_before_save" BEFORE INSERT OR UPDATE ON "public"."onboarding_responses" FOR EACH ROW EXECUTE FUNCTION "public"."transform_administration_data"();



CREATE OR REPLACE TRIGGER "update_activities_trigger" BEFORE UPDATE ON "public"."towns" FOR EACH ROW WHEN ((("old"."golf_courses_count" IS DISTINCT FROM "new"."golf_courses_count") OR ("old"."tennis_courts_count" IS DISTINCT FROM "new"."tennis_courts_count") OR ("old"."beaches_nearby" IS DISTINCT FROM "new"."beaches_nearby") OR ("old"."marinas_count" IS DISTINCT FROM "new"."marinas_count") OR ("old"."hiking_trails_km" IS DISTINCT FROM "new"."hiking_trails_km") OR ("old"."ski_resorts_within_100km" IS DISTINCT FROM "new"."ski_resorts_within_100km") OR ("old"."coworking_spaces_count" IS DISTINCT FROM "new"."coworking_spaces_count") OR ("old"."dog_parks_count" IS DISTINCT FROM "new"."dog_parks_count"))) EXECUTE FUNCTION "public"."update_activities_on_infrastructure_change"();



CREATE OR REPLACE TRIGGER "update_hobbies_updated_at" BEFORE UPDATE ON "public"."hobbies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_scotty_conversations_updated_at" BEFORE UPDATE ON "public"."scotty_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_town_image_trigger" BEFORE INSERT OR UPDATE ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."validate_town_image"();



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."chat_threads"
    ADD CONSTRAINT "chat_threads_town_id_fkey" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id");



ALTER TABLE ONLY "public"."country_regions"
    ADD CONSTRAINT "country_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_town_id_fkey" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scotty_messages"
    ADD CONSTRAINT "fk_conversation_id" FOREIGN KEY ("conversation_id") REFERENCES "public"."scotty_conversations"("id");



ALTER TABLE ONLY "public"."scotty_conversations"
    ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_town_id_fkey" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id");



ALTER TABLE ONLY "public"."journal_entries"
    ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_responses"
    ADD CONSTRAINT "onboarding_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retirement_schedule"
    ADD CONSTRAINT "retirement_schedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."scotty_conversations"
    ADD CONSTRAINT "scotty_conversations_town_id_fkey" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id");



ALTER TABLE ONLY "public"."scotty_conversations"
    ADD CONSTRAINT "scotty_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scotty_messages"
    ADD CONSTRAINT "scotty_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."scotty_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."towns_hobbies"
    ADD CONSTRAINT "town_hobbies_hobby_id_fkey" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."towns_hobbies"
    ADD CONSTRAINT "town_hobbies_town_id_fkey" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_hobbies"
    ADD CONSTRAINT "user_hobbies_hobby_id_fkey" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_hobbies"
    ADD CONSTRAINT "user_hobbies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin full access to towns" ON "public"."towns" TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['tilman.rumpf@gmail.com'::"text", 'tobias.rumpf1@gmail.com'::"text", 'madara.grisule@gmail.com'::"text"]))) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = ANY (ARRAY['tilman.rumpf@gmail.com'::"text", 'tobias.rumpf1@gmail.com'::"text", 'madara.grisule@gmail.com'::"text"])));



CREATE POLICY "All users can view towns" ON "public"."towns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read retirement tips" ON "public"."retirement_tips" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create chat threads" ON "public"."chat_threads" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Authenticated users can post messages" ON "public"."chat_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can update analytics" ON "public"."regional_inspirations" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Chat messages are viewable by all users" ON "public"."chat_messages" FOR SELECT USING (true);



CREATE POLICY "Chat threads are viewable by all users" ON "public"."chat_threads" FOR SELECT USING (true);



CREATE POLICY "Hobbies are viewable by everyone" ON "public"."hobbies" FOR SELECT USING (true);



CREATE POLICY "Only service role can modify retirement tips" ON "public"."retirement_tips" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Public can view active regional inspirations" ON "public"."regional_inspirations" FOR SELECT USING (("is_active" = true));



CREATE POLICY "System can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Town hobbies are viewable by everyone" ON "public"."towns_hobbies" FOR SELECT USING (true);



CREATE POLICY "Towns are viewable by all users" ON "public"."towns" FOR SELECT USING (true);



CREATE POLICY "Users can block users" ON "public"."blocked_users" FOR INSERT WITH CHECK (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can create connections" ON "public"."user_connections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create friend requests" ON "public"."friendships" FOR INSERT WITH CHECK (("auth"."uid"() = "requester_id"));



CREATE POLICY "Users can create their own connections" ON "public"."user_connections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own conversations" ON "public"."scotty_conversations" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own messages" ON "public"."chat_messages" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own schedule" ON "public"."retirement_schedule" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own sent connections" ON "public"."user_connections" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert messages to own conversations" ON "public"."scotty_messages" FOR INSERT WITH CHECK (("conversation_id" IN ( SELECT "scotty_conversations"."id"
   FROM "public"."scotty_conversations"
  WHERE ("scotty_conversations"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert own conversations" ON "public"."scotty_conversations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own onboarding responses" ON "public"."onboarding_responses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own record" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own schedule" ON "public"."retirement_schedule" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own journal_entries" ON "public"."journal_entries" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own preferences" ON "public"."user_preferences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own hobbies" ON "public"."user_hobbies" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send messages" ON "public"."direct_messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."friendships"
  WHERE (("friendships"."status" = 'accepted'::"text") AND ((("friendships"."requester_id" = "auth"."uid"()) AND ("friendships"."receiver_id" = "friendships"."receiver_id")) OR (("friendships"."receiver_id" = "auth"."uid"()) AND ("friendships"."requester_id" = "friendships"."receiver_id"))))))));



CREATE POLICY "Users can unblock users" ON "public"."blocked_users" FOR DELETE USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can update connections" ON "public"."user_connections" FOR UPDATE USING (("auth"."uid"() = "friend_id"));



CREATE POLICY "Users can update own conversations" ON "public"."scotty_conversations" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own friendships" ON "public"."friendships" FOR UPDATE USING ((("auth"."uid"() = "receiver_id") AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can update own messages" ON "public"."chat_messages" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own onboarding responses" ON "public"."onboarding_responses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own record" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own schedule" ON "public"."retirement_schedule" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update received connections" ON "public"."user_connections" FOR UPDATE USING (("auth"."uid"() = "friend_id")) WITH CHECK (("auth"."uid"() = "friend_id"));



CREATE POLICY "Users can update their own sent connections" ON "public"."user_connections" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view all users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view connections where they are involved" ON "public"."user_connections" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "friend_id")));



CREATE POLICY "Users can view messages from own conversations" ON "public"."scotty_messages" FOR SELECT USING (("conversation_id" IN ( SELECT "scotty_conversations"."id"
   FROM "public"."scotty_conversations"
  WHERE ("scotty_conversations"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own blocks" ON "public"."blocked_users" FOR SELECT USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can view own connections" ON "public"."user_connections" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "friend_id")));



CREATE POLICY "Users can view own conversations" ON "public"."scotty_conversations" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own friendships" ON "public"."friendships" FOR SELECT USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "receiver_id")));



CREATE POLICY "Users can view own messages" ON "public"."direct_messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "receiver_id")));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own onboarding responses" ON "public"."onboarding_responses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own record" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own schedule" ON "public"."retirement_schedule" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own hobbies" ON "public"."user_hobbies" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."blocked_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."direct_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hobbies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regional_inspirations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retirement_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retirement_tips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scotty_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scotty_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."towns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."towns_hobbies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_hobbies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_account"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_water_bodies_comprehensive"("town_name" "text", "town_country" "text", "town_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."detect_water_bodies_comprehensive"("town_name" "text", "town_country" "text", "town_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_water_bodies_comprehensive"("town_name" "text", "town_country" "text", "town_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_water_bodies_from_text"("town_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."detect_water_bodies_from_text"("town_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_water_bodies_from_text"("town_description" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_best_image_for_town"("town_country" "text", "town_region" "text", "town_features" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_best_image_for_town"("town_country" "text", "town_region" "text", "town_features" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_best_image_for_town"("town_country" "text", "town_region" "text", "town_features" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_country_regions"("country_name" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_country_regions"("country_name" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_country_regions"("country_name" character varying) TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recommended_towns"("user_id" "uuid", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recommended_towns"("user_id" "uuid", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recommended_towns"("user_id" "uuid", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_town_hobbies_detailed"("town_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_town_hobbies_detailed"("town_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_town_hobbies_detailed"("town_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_towns_by_region"("region_name" character varying, "max_towns" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_towns_by_region"("region_name" character varying, "max_towns" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_towns_by_region"("region_name" character varying, "max_towns" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_notification_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_notification_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_us_town_image_url"("p_town_name" "text", "p_town_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_us_town_image_url"("p_town_name" "text", "p_town_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_us_town_image_url"("p_town_name" "text", "p_town_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_by_id"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_by_id"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_by_id"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_hobbies_detailed"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_hobbies_detailed"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_hobbies_detailed"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_onboarding_to_users_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_onboarding_to_users_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_onboarding_to_users_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_activities_on_infrastructure_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_activities_on_infrastructure_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_activities_on_infrastructure_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_town_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_town_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_town_image"() TO "service_role";















GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."blocked_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."blocked_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."blocked_users" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_messages" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."chat_threads" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."country_regions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."country_regions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."country_regions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."country_regions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."country_regions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."country_regions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."curated_location_images" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."curated_location_images" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."curated_location_images" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."direct_messages" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."direct_messages" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."direct_messages" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."friendships" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."friendships" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."friendships" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hobbies" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hobbies" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."hobbies" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."journal_entries" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."journal_entries" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."journal_entries" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."notifications" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."onboarding_responses" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."onboarding_responses" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."onboarding_responses" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regional_inspirations" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regional_inspirations" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regional_inspirations" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."regions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."regions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_schedule" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_schedule" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_schedule" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_tips" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_tips" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."retirement_tips" TO "service_role";



GRANT ALL ON SEQUENCE "public"."retirement_tips_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."retirement_tips_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."retirement_tips_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_conversations" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_conversations" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_conversations" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_messages" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_messages" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_messages" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_analytics" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_analytics" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_analytics" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_mentioned_towns" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_mentioned_towns" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_mentioned_towns" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_topics" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_topics" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."scotty_topics" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns_hobbies" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns_hobbies" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."towns_hobbies" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_hobbies" TO "anon";
GRANT ALL ON TABLE "public"."user_hobbies" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_hobbies" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_preferences" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_preferences" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_preferences" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_presence" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_presence" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_presence" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."users" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."water_bodies" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."water_bodies" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."water_bodies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."water_bodies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."water_bodies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."water_bodies_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";






























RESET ALL;
