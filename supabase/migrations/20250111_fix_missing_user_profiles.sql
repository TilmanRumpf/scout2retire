-- Fix missing user profiles for auth users
-- This creates user profiles for any auth users that don't have them

-- First, let's see which auth users are missing profiles
WITH auth_users AS (
  SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
  FROM auth.users
),
missing_profiles AS (
  SELECT 
    au.id,
    au.email,
    au.full_name,
    au.created_at
  FROM auth_users au
  LEFT JOIN public.users u ON au.id = u.id
  WHERE u.id IS NULL
)
-- Insert missing profiles
INSERT INTO public.users (
  id,
  email,
  full_name,
  nationality,
  retirement_year_estimate,
  onboarding_completed,
  created_at
)
SELECT 
  id,
  email,
  COALESCE(full_name, split_part(email, '@', 1)) as full_name,
  'usa' as nationality,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer + 5 as retirement_year_estimate,
  false as onboarding_completed,
  created_at
FROM missing_profiles;

-- Show the results
SELECT 
  'Created profiles for ' || COUNT(*) || ' users' as result
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;