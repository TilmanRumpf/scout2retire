-- 🧩 SCOUT2RETIRE GROUP CHAT TIER SYSTEM
-- Implements 4-tier privacy model with auto-succession, dormancy lifecycle, and executive admin oversight

-- ============================================================================
-- 1. CREATE ENUM TYPES
-- ============================================================================

CREATE TYPE group_type AS ENUM (
  'sensitive_private',  -- 🔒 Premium-only, creator controls, no auto-succession
  'semi_private',       -- 🪶 Vetted, admin approval, auto-succession ≥10
  'private_open',       -- 🌗 Social private, relaxes at ≥50 members
  'public'              -- 🌐 Searchable, anyone joins
);

CREATE TYPE invite_policy AS ENUM (
  'creator_only',              -- Only creator invites
  'two_key',                   -- Creator + co-creator both approve
  'admins_only',               -- Admins control invites
  'members_with_approval',     -- Members propose, admins approve
  'council',                   -- N-of-M stewards approve
  'vouch_plus_approval',       -- N vouches + admin approval
  'application_plus_approval', -- Form submission + admin review
  'all_members'                -- Members invite freely (public groups)
);

CREATE TYPE member_role AS ENUM (
  'creator',         -- Original creator (1 per group)
  'admin',           -- Can manage members, edit settings
  'admin_executive', -- Platform-assigned oversight (≥10 members)
  'moderator',       -- Can remove disruptive members
  'member'           -- Regular participant
);

CREATE TYPE dormancy_state AS ENUM (
  'active',    -- Activity within 30 days
  'dormant',   -- 60 days inactive (warning shown)
  'inactive',  -- 90 days inactive (recovery protocol)
  'archived'   -- 120 days inactive (read-only)
);

-- ============================================================================
-- 2. ALTER chat_threads TABLE
-- ============================================================================

ALTER TABLE chat_threads
  ADD COLUMN IF NOT EXISTS group_type group_type DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS discoverability TEXT
    CHECK (discoverability IN ('hidden', 'link_only', 'searchable'))
    DEFAULT 'searchable',
  ADD COLUMN IF NOT EXISTS invite_policy invite_policy DEFAULT 'all_members',
  ADD COLUMN IF NOT EXISTS invite_policy_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS succession_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS admin_min_count INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_reason TEXT,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dormancy_state dormancy_state DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_admin_activity_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS security JSONB DEFAULT '{}'::jsonb; -- TTL, geo restrictions, etc.

COMMENT ON COLUMN chat_threads.group_type IS 'Privacy tier: sensitive_private, semi_private, private_open, or public';
COMMENT ON COLUMN chat_threads.invite_policy IS 'Who can invite new members to this group';
COMMENT ON COLUMN chat_threads.succession_enabled IS 'Whether auto-succession is enabled (disabled for sensitive_private)';
COMMENT ON COLUMN chat_threads.security IS 'JSON config for invite links: {ttl, single_use, verify_phone, geo_allowlist}';

-- ============================================================================
-- 3. UPDATE group_chat_members TABLE
-- ============================================================================

-- Drop existing policies that depend on role column (if they exist)
DROP POLICY IF EXISTS "Admins can remove members from groups" ON group_chat_members;
DROP POLICY IF EXISTS "Admins can remove members" ON group_chat_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_chat_members;
DROP POLICY IF EXISTS "Members can view group membership" ON group_chat_members;

-- Drop old role column if it exists (we're replacing with enum)
ALTER TABLE group_chat_members DROP COLUMN IF EXISTS role CASCADE;

-- Add new role column with enum type
ALTER TABLE group_chat_members
  ADD COLUMN role member_role DEFAULT 'member';

-- ============================================================================
-- 4. CREATE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_role_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'promote', 'demote', 'remove', 'invite', 'leave', 'archive'
  target_user_id UUID REFERENCES auth.users(id),
  old_role member_role,
  new_role member_role,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_group_role_audit_thread ON group_role_audit(thread_id);
CREATE INDEX idx_group_role_audit_actor ON group_role_audit(actor_id);
CREATE INDEX idx_group_role_audit_created ON group_role_audit(created_at DESC);

COMMENT ON TABLE group_role_audit IS 'Immutable audit log for all admin actions in groups';

-- ============================================================================
-- 5. CREATE EXECUTIVE ADMIN ACCOUNT (Platform Oversight)
-- ============================================================================

-- This account is automatically added to groups with ≥10 members
-- Create placeholder user for executive admin (you'll need to create actual account)
-- For now, we'll reference this in functions

COMMENT ON TABLE group_role_audit IS 'Executive admin user_id will be inserted via migration or manual setup';

-- ============================================================================
-- 6. UPDATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_chat_threads_group_type ON chat_threads(group_type);
CREATE INDEX IF NOT EXISTS idx_chat_threads_dormancy_state ON chat_threads(dormancy_state);
CREATE INDEX IF NOT EXISTS idx_chat_threads_last_activity ON chat_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_member_count ON chat_threads(member_count);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_role ON group_chat_members(role);

-- ============================================================================
-- 7. SET DEFAULT VALUES FOR EXISTING GROUPS
-- ============================================================================

-- Set sensible defaults for existing groups based on is_public flag
UPDATE chat_threads
SET
  group_type = CASE
    WHEN is_public = true THEN 'public'::group_type
    ELSE 'private_open'::group_type
  END,
  discoverability = CASE
    WHEN is_public = true THEN 'searchable'
    ELSE 'link_only'
  END,
  invite_policy = CASE
    WHEN is_public = true THEN 'all_members'::invite_policy
    ELSE 'members_with_approval'::invite_policy
  END,
  last_activity_at = created_at,
  member_count = (
    SELECT COUNT(*)
    FROM group_chat_members
    WHERE group_chat_members.thread_id = chat_threads.id
  )
WHERE is_group = true;

-- Set creator role for existing group creators
UPDATE group_chat_members
SET role = 'creator'::member_role
WHERE user_id IN (
  SELECT created_by
  FROM chat_threads
  WHERE chat_threads.id = group_chat_members.thread_id
  AND is_group = true
);

-- Set admin role for other existing admins (if any marked in old system)
-- For now, everyone else is 'member' (default)
