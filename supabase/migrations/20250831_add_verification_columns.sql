-- Add verification columns to hobbies table for admin-friendly management
-- These columns make verification data visible and editable in the Supabase dashboard

ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_method TEXT;
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_query TEXT;
ALTER TABLE hobbies ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add comments to describe each column
COMMENT ON COLUMN hobbies.verification_method IS 'How to verify this hobby: universal, database_infrastructure, database_geographic, ai_terrain, ai_facilities, ai_community, manual';
COMMENT ON COLUMN hobbies.verification_query IS 'SQL query for database methods or AI prompt for AI methods';
COMMENT ON COLUMN hobbies.verification_notes IS 'Admin notes about verification requirements or special considerations';