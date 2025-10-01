-- Add comparison_towns to user_preferences for persisting comparison page selections
-- Stores array of town IDs that user last selected for comparison

ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS comparison_towns JSONB DEFAULT '[]'::jsonb;

-- Add helpful comment
COMMENT ON COLUMN public.user_preferences.comparison_towns IS 'User''s last selected towns for comparison page (array of town IDs, max 3)';

-- Initialize for existing users (empty array for those with NULL)
UPDATE public.user_preferences
SET comparison_towns = '[]'::jsonb
WHERE comparison_towns IS NULL;
