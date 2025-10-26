-- Enable RLS on exposed tables
-- Priority: CRITICAL SECURITY FIX

-- 1. group_chat_members (has policies but RLS not enabled!)
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;

-- 2. audit_log tables (contains sensitive data)
ALTER TABLE public.audit_log_2025_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log_2025_11 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log_2025_12 ENABLE ROW LEVEL SECURITY;

-- 3. Other exposed tables
ALTER TABLE public.curated_location_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_regions ENABLE ROW LEVEL SECURITY;