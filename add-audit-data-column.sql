-- Add audit_data column to towns table if it doesn't exist
-- This stores audit approval information for each field

-- Check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'towns' 
        AND column_name = 'audit_data'
    ) THEN
        -- Add the audit_data column as JSONB to store field audit information
        ALTER TABLE towns 
        ADD COLUMN audit_data JSONB DEFAULT '{}';
        
        -- Add a comment to document the column
        COMMENT ON COLUMN towns.audit_data IS 'Stores audit approval information for each field. Structure: {fieldName: {approved: boolean, approvedBy: email, approvedByName: string, approvedByAvatar: url, approvedAt: ISO string}}';
        
        RAISE NOTICE 'audit_data column added successfully';
    ELSE
        RAISE NOTICE 'audit_data column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'towns' 
AND column_name = 'audit_data';