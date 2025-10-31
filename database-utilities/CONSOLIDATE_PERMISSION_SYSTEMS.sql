-- ============================================================================
-- PERMISSION SYSTEM CONSOLIDATION
-- Fixes the three overlapping permission systems
-- ============================================================================
-- BEFORE RUNNING: Run PERMISSION_SYSTEM_AUDIT.sql to see current state
--
-- Changes:
-- 1. Migrates account_tier admin values → admin_role
-- 2. Sets account_tier to subscription tier (not admin role)
-- 3. Updates is_admin boolean to match admin_role
-- 4. Deprecates account_tier enum admin values
-- 5. Documents the correct usage going forward
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: BACKUP CURRENT STATE (in case we need to rollback)
-- ============================================================================
CREATE TEMP TABLE users_backup_permission_consolidation AS
SELECT
  id,
  email,
  admin_role,
  account_tier,
  category_id,
  is_admin,
  community_role
FROM users;

SELECT 'Backed up ' || COUNT(*) || ' users' as backup_status
FROM users_backup_permission_consolidation;

-- ============================================================================
-- STEP 2: MIGRATE account_tier admin values to admin_role
-- ============================================================================

-- execadmin → executive_admin
UPDATE users
SET
  admin_role = 'executive_admin',
  account_tier = 'free',  -- Admins get free account (they're staff)
  is_admin = true,
  roles_updated_at = NOW(),
  roles_updated_by = id  -- Self-update during migration
WHERE account_tier = 'execadmin'
  AND (admin_role IS NULL OR admin_role = 'user');

-- assistant_admin → admin
UPDATE users
SET
  admin_role = 'admin',
  account_tier = 'free',
  is_admin = true,
  roles_updated_at = NOW(),
  roles_updated_by = id
WHERE account_tier = 'assistant_admin'
  AND (admin_role IS NULL OR admin_role = 'user');

-- town_manager → moderator (or keep as user with special community_role)
UPDATE users
SET
  admin_role = 'moderator',
  account_tier = 'free',
  is_admin = true,
  community_role = 'town_ambassador',  -- Reflect their role
  roles_updated_at = NOW(),
  roles_updated_by = id
WHERE account_tier = 'town_manager'
  AND (admin_role IS NULL OR admin_role = 'user');

-- ============================================================================
-- STEP 3: FIX MISMATCHES - admin_role takes precedence
-- ============================================================================

-- If someone has executive_admin role but wrong account_tier, fix it
UPDATE users
SET
  account_tier = 'free',
  is_admin = true
WHERE admin_role = 'executive_admin'
  AND account_tier != 'free';

-- If someone has admin role but wrong account_tier, fix it
UPDATE users
SET
  account_tier = 'free',
  is_admin = true
WHERE admin_role = 'admin'
  AND account_tier != 'free';

-- If someone has moderator role but wrong account_tier, fix it
UPDATE users
SET
  account_tier = 'free',
  is_admin = true
WHERE admin_role = 'moderator'
  AND account_tier != 'free';

-- ============================================================================
-- STEP 4: SYNC is_admin BOOLEAN with admin_role
-- ============================================================================

-- Set is_admin = true for anyone with admin privileges
UPDATE users
SET is_admin = true
WHERE admin_role IN ('executive_admin', 'admin', 'moderator', 'auditor')
  AND (is_admin IS NULL OR is_admin = false);

-- Set is_admin = false for regular users
UPDATE users
SET is_admin = false
WHERE (admin_role IS NULL OR admin_role = 'user')
  AND (is_admin IS NULL OR is_admin = true);

-- ============================================================================
-- STEP 5: SHOW WHAT WAS CHANGED
-- ============================================================================
SELECT
  '=== MIGRATION RESULTS ===' as section,
  old.email,
  old.admin_role as old_admin_role,
  old.account_tier::text as old_account_tier,
  old.is_admin as old_is_admin,
  '→' as arrow,
  new.admin_role as new_admin_role,
  new.account_tier::text as new_account_tier,
  new.is_admin as new_is_admin
FROM users_backup_permission_consolidation old
JOIN users new ON old.id = new.id
WHERE
  old.admin_role IS DISTINCT FROM new.admin_role
  OR old.account_tier IS DISTINCT FROM new.account_tier
  OR old.is_admin IS DISTINCT FROM new.is_admin;

-- ============================================================================
-- STEP 6: VERIFICATION
-- ============================================================================

-- Count executive admins
SELECT 'Executive admins' as metric, COUNT(*)::text as count
FROM users
WHERE admin_role = 'executive_admin';

-- Count regular admins
SELECT 'Regular admins' as metric, COUNT(*)::text as count
FROM users
WHERE admin_role = 'admin';

-- Count moderators
SELECT 'Moderators' as metric, COUNT(*)::text as count
FROM users
WHERE admin_role = 'moderator';

-- Check for remaining account_tier admin values
SELECT
  'Remaining account_tier admin values (should be 0)' as check_name,
  COUNT(*)::text as count
FROM users
WHERE account_tier IN ('execadmin', 'assistant_admin', 'town_manager');

-- Check for is_admin mismatches
SELECT
  'is_admin mismatches (should be 0)' as check_name,
  COUNT(*)::text as count
FROM users
WHERE
  (admin_role IN ('executive_admin', 'admin', 'moderator', 'auditor') AND is_admin != true)
  OR
  (admin_role IN ('user', NULL) AND is_admin != false);

-- ============================================================================
-- STEP 7: ADD DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.admin_role IS 'Admin hierarchy: user (default) | moderator | admin | executive_admin | auditor. THIS is the source of truth for admin permissions.';

COMMENT ON COLUMN users.account_tier IS 'Subscription tier: free (default) | freemium | premium | enterprise. For billing/paywall features only. DO NOT use town_manager/assistant_admin/execadmin - use admin_role instead.';

COMMENT ON COLUMN users.is_admin IS 'Convenience boolean: true if admin_role IN (moderator, admin, executive_admin, auditor). Synced automatically.';

COMMENT ON COLUMN users.category_id IS 'FK to user_categories table. Defines feature limits for subscription tier. Prefer this over account_tier for feature checks.';

-- ============================================================================
-- STEP 8: CREATE HELPER VIEW (Read-only convenience)
-- ============================================================================

CREATE OR REPLACE VIEW user_permissions AS
SELECT
  u.id,
  u.email,
  u.admin_role,
  u.account_tier,
  u.is_admin,
  u.community_role,
  uc.display_name as subscription_name,
  uc.price_monthly,
  CASE u.admin_role
    WHEN 'executive_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'moderator' THEN 2
    WHEN 'auditor' THEN 1
    ELSE 0
  END as admin_level,
  -- Computed permissions
  u.admin_role IN ('executive_admin', 'admin', 'moderator', 'auditor') as can_access_admin_panel,
  u.admin_role = 'executive_admin' as can_manage_templates,
  u.admin_role IN ('executive_admin', 'admin') as can_manage_users,
  u.account_tier IN ('premium', 'enterprise') OR u.is_admin = true as can_create_sensitive_groups
FROM users u
LEFT JOIN user_categories uc ON u.category_id = uc.id;

COMMENT ON VIEW user_permissions IS 'Read-only view showing consolidated user permissions. Use this for permission checks in application code.';

GRANT SELECT ON user_permissions TO authenticated;

-- ============================================================================
-- SHOW FINAL STATE
-- ============================================================================
SELECT '=== FINAL STATE ===' as section;

SELECT * FROM user_permissions
WHERE admin_role != 'user' OR account_tier != 'free'
ORDER BY admin_level DESC, email;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Permission system consolidated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Migrated account_tier admin values to admin_role';
  RAISE NOTICE '  - Set admin accounts to account_tier = free';
  RAISE NOTICE '  - Synced is_admin boolean with admin_role';
  RAISE NOTICE '  - Created user_permissions view for easy permission checks';
  RAISE NOTICE '';
  RAISE NOTICE 'Going forward:';
  RAISE NOTICE '  - Use admin_role for ALL admin permissions';
  RAISE NOTICE '  - Use account_tier ONLY for subscription tier (free/freemium/premium/enterprise)';
  RAISE NOTICE '  - Use category_id for feature limit checks';
  RAISE NOTICE '  - Query user_permissions view for consolidated permissions';
END $$;

COMMIT;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If something went wrong, run this to restore from backup:
/*
BEGIN;

UPDATE users u
SET
  admin_role = b.admin_role,
  account_tier = b.account_tier,
  is_admin = b.is_admin,
  community_role = b.community_role
FROM users_backup_permission_consolidation b
WHERE u.id = b.id;

DROP VIEW IF EXISTS user_permissions;

COMMIT;
*/
