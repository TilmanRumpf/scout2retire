

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
    "expat_population" "text",
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
    "airport_distance" integer,
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
    "water_bodies" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."towns" OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."update_town_regions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.regions := get_country_regions(NEW.country);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_town_regions"() OWNER TO "postgres";


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
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


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
    "nationality" "text",
    "retirement_year_estimate" integer,
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


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



ALTER TABLE ONLY "public"."towns"
    ADD CONSTRAINT "towns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_friend_id_key" UNIQUE ("user_id", "friend_id");



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "idx_friendships_receiver" ON "public"."friendships" USING "btree" ("receiver_id");



CREATE INDEX "idx_friendships_requester" ON "public"."friendships" USING "btree" ("requester_id");



CREATE INDEX "idx_friendships_status" ON "public"."friendships" USING "btree" ("status");



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



CREATE INDEX "idx_towns_climate" ON "public"."towns" USING "btree" ("climate");



CREATE INDEX "idx_towns_cost_index" ON "public"."towns" USING "btree" ("cost_index");



CREATE INDEX "idx_towns_country" ON "public"."towns" USING "btree" ("country");



CREATE INDEX "idx_towns_healthcare_score" ON "public"."towns" USING "btree" ("healthcare_score");



CREATE INDEX "idx_towns_regions" ON "public"."towns" USING "gin" ("regions");



CREATE INDEX "idx_towns_safety_score" ON "public"."towns" USING "btree" ("safety_score");



CREATE INDEX "idx_towns_water_bodies" ON "public"."towns" USING "gin" ("water_bodies");



CREATE INDEX "idx_user_connections_friend_id" ON "public"."user_connections" USING "btree" ("friend_id");



CREATE INDEX "idx_user_connections_status" ON "public"."user_connections" USING "btree" ("status");



CREATE INDEX "idx_user_connections_user_friend" ON "public"."user_connections" USING "btree" ("user_id", "friend_id");



CREATE INDEX "idx_user_connections_user_id" ON "public"."user_connections" USING "btree" ("user_id");



CREATE INDEX "towns_search_idx" ON "public"."towns" USING "gin" ("search_vector");



CREATE OR REPLACE TRIGGER "create_invitation_notification_trigger" AFTER INSERT ON "public"."user_connections" FOR EACH ROW EXECUTE FUNCTION "public"."create_invitation_notification"();



CREATE OR REPLACE TRIGGER "set_town_regions" BEFORE INSERT OR UPDATE OF "country" ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."update_town_regions"();



CREATE OR REPLACE TRIGGER "towns_search_vector_update" BEFORE INSERT OR UPDATE ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."towns_search_vector_update"();



CREATE OR REPLACE TRIGGER "transform_administration_before_save" BEFORE INSERT OR UPDATE ON "public"."onboarding_responses" FOR EACH ROW EXECUTE FUNCTION "public"."transform_administration_data"();



CREATE OR REPLACE TRIGGER "validate_town_image_trigger" BEFORE INSERT OR UPDATE ON "public"."towns" FOR EACH ROW EXECUTE FUNCTION "public"."validate_town_image"();



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



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
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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
    ADD CONSTRAINT "onboarding_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."retirement_schedule"
    ADD CONSTRAINT "retirement_schedule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_connections"
    ADD CONSTRAINT "user_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_presence"
    ADD CONSTRAINT "user_presence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow authenticated users to read retirement tips" ON "public"."retirement_tips" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can create chat threads" ON "public"."chat_threads" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Authenticated users can post messages" ON "public"."chat_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can update analytics" ON "public"."regional_inspirations" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Chat messages are viewable by all users" ON "public"."chat_messages" FOR SELECT USING (true);



CREATE POLICY "Chat threads are viewable by all users" ON "public"."chat_threads" FOR SELECT USING (true);



CREATE POLICY "Only service role can modify retirement tips" ON "public"."retirement_tips" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Public can view active regional inspirations" ON "public"."regional_inspirations" FOR SELECT USING (("is_active" = true));



CREATE POLICY "System can create notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Towns are viewable by all users" ON "public"."towns" FOR SELECT USING (true);



CREATE POLICY "Users can block users" ON "public"."blocked_users" FOR INSERT WITH CHECK (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can create connections" ON "public"."user_connections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create friend requests" ON "public"."friendships" FOR INSERT WITH CHECK (("auth"."uid"() = "requester_id"));



CREATE POLICY "Users can create their own connections" ON "public"."user_connections" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own messages" ON "public"."chat_messages" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own schedule" ON "public"."retirement_schedule" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own sent connections" ON "public"."user_connections" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own onboarding responses" ON "public"."onboarding_responses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own record" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own schedule" ON "public"."retirement_schedule" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own journal_entries" ON "public"."journal_entries" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send messages" ON "public"."direct_messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."friendships"
  WHERE (("friendships"."status" = 'accepted'::"text") AND ((("friendships"."requester_id" = "auth"."uid"()) AND ("friendships"."receiver_id" = "friendships"."receiver_id")) OR (("friendships"."receiver_id" = "auth"."uid"()) AND ("friendships"."requester_id" = "friendships"."receiver_id"))))))));



CREATE POLICY "Users can unblock users" ON "public"."blocked_users" FOR DELETE USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can update connections" ON "public"."user_connections" FOR UPDATE USING (("auth"."uid"() = "friend_id"));



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



CREATE POLICY "Users can view own blocks" ON "public"."blocked_users" FOR SELECT USING (("auth"."uid"() = "blocker_id"));



CREATE POLICY "Users can view own connections" ON "public"."user_connections" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = "friend_id")));



CREATE POLICY "Users can view own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own friendships" ON "public"."friendships" FOR SELECT USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "receiver_id")));



CREATE POLICY "Users can view own messages" ON "public"."direct_messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "receiver_id")));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own onboarding responses" ON "public"."onboarding_responses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own record" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own schedule" ON "public"."retirement_schedule" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."blocked_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."direct_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journal_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regional_inspirations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retirement_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retirement_tips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."towns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_invitation_notification"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_user_by_email"("search_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."towns_search_vector_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."transform_administration_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_town_regions"() TO "service_role";



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



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."town_summaries" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_connections" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_favorites_with_towns" TO "service_role";



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
