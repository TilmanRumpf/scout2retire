-- Force delete user and all related data
-- User ID: 2441b980-2f30-4986-a86d-c32c18c781ea

-- Delete from related tables first (to handle foreign key constraints)
DELETE FROM favorites WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';
DELETE FROM onboarding_responses WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';
DELETE FROM user_preferences WHERE user_id = '2441b980-2f30-4986-a86d-c32c18c781ea';

-- Finally delete from users table
DELETE FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea';

-- Verify deletion
SELECT id, email FROM users WHERE id = '2441b980-2f30-4986-a86d-c32c18c781ea';