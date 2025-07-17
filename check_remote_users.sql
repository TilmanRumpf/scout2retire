-- Check users in the remote database
SELECT 
  id,
  email,
  full_name,
  onboarding_completed,
  created_at
FROM users
ORDER BY created_at DESC;