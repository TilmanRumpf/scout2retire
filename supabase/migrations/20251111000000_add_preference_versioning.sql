-- Migration: Add Preference Versioning System
-- Date: 2025-11-11
-- Purpose: Add preference hash and timestamp tracking for cache invalidation
--
-- Problem: Algorithm Manager and User UI can show different match scores
-- because cached scores don't invalidate when preferences change.
--
-- Solution: Track preference version via hash. When hash changes, cache keys
-- change automatically, forcing fresh score calculation.
--
-- Files modified:
-- - user_preferences: Add preferences_hash, preferences_updated_at
-- - users: Add preferences_updated_at for quick access

-- ============================================================================
-- STEP 1: Add columns to user_preferences table
-- ============================================================================

-- Add preferences_hash column (8-char SHA-256 hash of preference data)
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS preferences_hash TEXT DEFAULT '00000000';

COMMENT ON COLUMN user_preferences.preferences_hash IS
  'Deterministic hash of preference values. Changes when preferences change. Used for cache invalidation.';

-- Add preferences_updated_at column (timestamp of last preference change)
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN user_preferences.preferences_updated_at IS
  'Timestamp of last preference modification. Synced to users table for quick access.';

-- ============================================================================
-- STEP 2: Add timestamp to users table for quick access
-- ============================================================================

-- Add preferences_updated_at column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferences_updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN users.preferences_updated_at IS
  'Timestamp of last preference change. Synced from user_preferences. Used for cache freshness validation.';

-- ============================================================================
-- STEP 3: Create index for performance
-- ============================================================================

-- Index on (user_id, preferences_hash) for fast cache key validation
CREATE INDEX IF NOT EXISTS idx_user_preferences_hash
ON user_preferences(user_id, preferences_hash);

-- ============================================================================
-- STEP 4: Backfill existing records with initial timestamps
-- ============================================================================

-- Set preferences_updated_at to updated_at for existing records
UPDATE user_preferences
SET preferences_updated_at = COALESCE(updated_at, created_at, NOW())
WHERE preferences_updated_at IS NULL;

-- Sync to users table
UPDATE users u
SET preferences_updated_at = (
  SELECT COALESCE(up.preferences_updated_at, up.updated_at, up.created_at, NOW())
  FROM user_preferences up
  WHERE up.user_id = u.id
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM user_preferences up WHERE up.user_id = u.id
);

-- ============================================================================
-- STEP 5: Create trigger to auto-sync timestamp to users table
-- ============================================================================

-- Function to sync preferences_updated_at from user_preferences to users
CREATE OR REPLACE FUNCTION sync_preference_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When user_preferences.preferences_updated_at changes, sync to users table
  UPDATE users
  SET preferences_updated_at = NEW.preferences_updated_at
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_preference_timestamp() IS
  'Auto-sync preferences_updated_at from user_preferences to users table for quick access';

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS sync_preference_timestamp_trigger ON user_preferences;

-- Create trigger on user_preferences
CREATE TRIGGER sync_preference_timestamp_trigger
  AFTER UPDATE OF preferences_updated_at ON user_preferences
  FOR EACH ROW
  WHEN (OLD.preferences_updated_at IS DISTINCT FROM NEW.preferences_updated_at)
  EXECUTE FUNCTION sync_preference_timestamp();

COMMENT ON TRIGGER sync_preference_timestamp_trigger ON user_preferences IS
  'Keeps users.preferences_updated_at in sync with user_preferences.preferences_updated_at';

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Verify columns exist
DO $$
DECLARE
  hash_exists BOOLEAN;
  timestamp_exists_prefs BOOLEAN;
  timestamp_exists_users BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'preferences_hash'
  ) INTO hash_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'preferences_updated_at'
  ) INTO timestamp_exists_prefs;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferences_updated_at'
  ) INTO timestamp_exists_users;

  IF hash_exists AND timestamp_exists_prefs AND timestamp_exists_users THEN
    RAISE NOTICE '✅ Preference versioning migration completed successfully';
    RAISE NOTICE '   - user_preferences.preferences_hash: %', hash_exists;
    RAISE NOTICE '   - user_preferences.preferences_updated_at: %', timestamp_exists_prefs;
    RAISE NOTICE '   - users.preferences_updated_at: %', timestamp_exists_users;
  ELSE
    RAISE WARNING '⚠️ Migration incomplete! Check column creation.';
  END IF;
END $$;

-- ============================================================================
-- ROLLBACK SCRIPT (for emergency use only)
-- ============================================================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS sync_preference_timestamp_trigger ON user_preferences;
-- DROP FUNCTION IF EXISTS sync_preference_timestamp();
-- DROP INDEX IF EXISTS idx_user_preferences_hash;
-- ALTER TABLE user_preferences DROP COLUMN IF EXISTS preferences_hash;
-- ALTER TABLE user_preferences DROP COLUMN IF EXISTS preferences_updated_at;
-- ALTER TABLE users DROP COLUMN IF EXISTS preferences_updated_at;
