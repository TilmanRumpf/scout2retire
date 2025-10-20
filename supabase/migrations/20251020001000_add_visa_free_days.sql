-- Add visa_free_days column for easy filtering
-- This is CRITICAL for retirees planning their travel

ALTER TABLE towns
ADD COLUMN IF NOT EXISTS visa_free_days INTEGER;

COMMENT ON COLUMN towns.visa_free_days IS 'Number of days US citizens can stay visa-free. NULL means visa required on arrival or in advance. 999 means no visa needed (domestic/US territory).';