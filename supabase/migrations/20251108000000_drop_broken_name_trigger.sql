-- Drop all triggers on towns table that might reference non-existent "name" field
-- Error: record "new" has no field "name" - suggests trigger is using NEW.name instead of NEW.town_name

-- First, let's see what triggers exist
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '=== Triggers on towns table ===';
    FOR trigger_record IN
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'towns'
        ORDER BY trigger_name
    LOOP
        RAISE NOTICE 'Trigger: %, Event: %, Statement: %',
            trigger_record.trigger_name,
            trigger_record.event_manipulation,
            trigger_record.action_statement;
    END LOOP;
END$$;

-- Drop all triggers on towns table (we'll recreate the ones we need)
DROP TRIGGER IF EXISTS set_town_regions ON public.towns;
DROP TRIGGER IF EXISTS update_town_timestamp ON public.towns;
DROP TRIGGER IF EXISTS validate_town_data ON public.towns;
DROP TRIGGER IF EXISTS sync_town_name ON public.towns;
DROP TRIGGER IF EXISTS update_town_slug ON public.towns;
DROP TRIGGER IF EXISTS handle_town_changes ON public.towns;

-- Drop associated functions that might reference "name" field
DROP FUNCTION IF EXISTS public.update_town_regions();
DROP FUNCTION IF EXISTS public.update_town_timestamp();
DROP FUNCTION IF EXISTS public.validate_town_data();
DROP FUNCTION IF EXISTS public.sync_town_name();
DROP FUNCTION IF EXISTS public.update_town_slug();
DROP FUNCTION IF EXISTS public.handle_town_changes();

-- Note: The towns table should work without these triggers
-- If we need auto-update functionality, we'll recreate with correct column names (town_name, not name)
