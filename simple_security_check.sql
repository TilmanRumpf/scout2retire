-- Simple security check queries
-- These should work with Supabase CLI

-- 1. Count users by onboarding status
SELECT 
    onboarding_completed,
    COUNT(*) as count
FROM users
GROUP BY onboarding_completed;

-- 2. Check for users with incomplete onboarding who have favorites
SELECT 
    u.id,
    u.email,
    u.onboarding_completed,
    COUNT(f.id) as favorites_count
FROM users u
LEFT JOIN favorites f ON u.id = f.user_id
WHERE u.onboarding_completed = false
GROUP BY u.id, u.email, u.onboarding_completed
HAVING COUNT(f.id) > 0;

-- 3. Check for users with incomplete onboarding who have journal entries
SELECT 
    u.id,
    u.email,
    u.onboarding_completed,
    COUNT(j.id) as journal_count
FROM users u
LEFT JOIN journal_entries j ON u.id = j.user_id
WHERE u.onboarding_completed = false
GROUP BY u.id, u.email, u.onboarding_completed
HAVING COUNT(j.id) > 0;