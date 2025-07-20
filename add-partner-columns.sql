-- Add missing partner citizenship columns to user_preferences table
-- This fixes the issue where partner citizenship data cannot be saved

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,
ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT;

-- Add helpful comments
COMMENT ON COLUMN user_preferences.partner_primary_citizenship IS 'Partner/spouse primary citizenship (only for couple/family)';
COMMENT ON COLUMN user_preferences.partner_secondary_citizenship IS 'Partner/spouse secondary citizenship if dual citizen';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_pref_partner_primary_citizenship 
ON user_preferences(partner_primary_citizenship)
WHERE partner_primary_citizenship IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_pref_partner_secondary_citizenship 
ON user_preferences(partner_secondary_citizenship)
WHERE partner_secondary_citizenship IS NOT NULL;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_preferences'
AND column_name IN ('partner_primary_citizenship', 'partner_secondary_citizenship')
ORDER BY column_name;