-- Delete user and all related data in the correct order
-- This respects foreign key constraints by deleting child records first

-- 1. Delete from child tables first
DELETE FROM onboarding_responses WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';
DELETE FROM favorites WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';
DELETE FROM user_preferences WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';

-- 2. Now delete from users table
DELETE FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea';

-- 3. Verify deletion was successful
SELECT 'User deleted successfully' as status 
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea');