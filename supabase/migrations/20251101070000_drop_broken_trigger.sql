-- Drop broken trigger that references non-existent function get_country_regions
-- This trigger was preventing town creation with error: "function get_country_regions(text) does not exist"

DROP TRIGGER IF EXISTS set_town_regions ON public.towns;
DROP FUNCTION IF EXISTS public.update_town_regions();
DROP FUNCTION IF EXISTS public.get_country_regions(character varying);

-- Note: The regions column auto-population is no longer needed
-- If we need regions data in the future, it should be manually entered or AI-populated
