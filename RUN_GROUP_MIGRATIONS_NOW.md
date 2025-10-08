# 🚀 RUN THESE MIGRATIONS NOW

## Quick Links

**Supabase SQL Editor**: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new

---

## Migration 1 of 4: Group Tier System

**File**: `supabase/migrations/20251007040000_group_tier_system.sql`

**What it does**:
- Creates 4 enum types (group_type, invite_policy, member_role, dormancy_state)
- Adds columns to chat_threads table
- Updates group_chat_members with role enum
- Creates group_role_audit table
- Sets defaults for existing groups

**Status**: ⏳ READY TO RUN

---

## Migration 2 of 4: Governance Functions

**File**: `supabase/migrations/20251007041000_group_governance_functions.sql`

**What it does**:
- Creates `ensure_executive_admin()` function
- Creates `enforce_admin_ratio()` function
- Creates `update_member_count()` trigger
- Creates `update_group_activity()` trigger
- Creates `update_dormancy_states()` function
- Creates `handle_creator_departure()` function

**Status**: ⏳ READY TO RUN (after migration 1)

---

## Migration 3 of 4: RLS Policies

**File**: `supabase/migrations/20251007042000_group_rls_policies.sql`

**What it does**:
- Drops old creator-based policies
- Creates role-based SELECT/INSERT/DELETE/UPDATE policies
- Enables RLS on all tables
- Prevents posting to archived groups

**Status**: ⏳ READY TO RUN (after migration 2)

---

## Migration 4 of 4: Account Tiers

**File**: `supabase/migrations/20251007043000_add_account_tier.sql`

**What it does**:
- Creates account_tier enum (7 tiers)
- Adds account_tier column to users table
- Creates `can_create_sensitive_groups()` function
- Creates helper functions for tier display/ranking
- Updates `ensure_executive_admin()` to use account_tier

**Status**: ⏳ READY TO RUN (after migration 3)

---

## How to Run (Copy/Paste Each File)

### Step 1: Open SQL Editor
Go to: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new

### Step 2: Run Migration 1
```bash
# Copy entire contents of this file:
cat supabase/migrations/20251007040000_group_tier_system.sql

# Paste into SQL Editor
# Click "Run"
# Wait for "Success"
```

### Step 3: Run Migration 2
```bash
# Copy entire contents of this file:
cat supabase/migrations/20251007041000_group_governance_functions.sql

# Paste into SQL Editor
# Click "Run"
# Wait for "Success"
```

### Step 4: Run Migration 3
```bash
# Copy entire contents of this file:
cat supabase/migrations/20251007042000_group_rls_policies.sql

# Paste into SQL Editor
# Click "Run"
# Wait for "Success"
```

### Step 5: Run Migration 4
```bash
# Copy entire contents of this file:
cat supabase/migrations/20251007043000_add_account_tier.sql

# Paste into SQL Editor
# Click "Run"
# Wait for "Success"
```

---

## After Migrations Complete

### Create Executive Admin Account

```sql
-- Option A: Update existing user
UPDATE users
SET account_tier = 'execadmin'
WHERE email = 'your-admin@email.com';

-- Option B: Sign up executive@scout2retire.com, then run:
UPDATE users
SET account_tier = 'execadmin'
WHERE email = 'executive@scout2retire.com';
```

### Verify Everything Works

```sql
-- Check enum types created
SELECT typname FROM pg_type WHERE typname IN ('group_type', 'invite_policy', 'member_role', 'dormancy_state', 'account_tier');

-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'chat_threads'
AND column_name IN ('group_type', 'invite_policy', 'succession_enabled', 'dormancy_state');

-- Check account_tier column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'account_tier';

-- Check functions exist
SELECT proname FROM pg_proc
WHERE proname IN ('ensure_executive_admin', 'enforce_admin_ratio', 'can_create_sensitive_groups');

-- Check audit table exists
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_role_audit');
```

---

## Why We Can't Run Programmatically

**Database schema migrations (DDL)** like `CREATE TYPE`, `ALTER TABLE`, `CREATE FUNCTION` **cannot** be executed via Supabase JavaScript client - they require direct SQL execution with elevated privileges.

This is the **standard migration workflow** for Supabase:
1. Write SQL migration files
2. Run in SQL Editor OR use Supabase CLI
3. Track in migration history

**Not a workaround - this is the correct way!**

---

## Estimated Time

- **Total**: 3-5 minutes
- **Per migration**: 30-60 seconds

---

## Rollback (If Needed)

```sql
-- Drop all new types (cascades to columns/functions)
DROP TYPE IF EXISTS account_tier CASCADE;
DROP TYPE IF EXISTS group_type CASCADE;
DROP TYPE IF EXISTS invite_policy CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS dormancy_state CASCADE;

-- Drop audit table
DROP TABLE IF EXISTS group_role_audit CASCADE;

-- Remove columns from chat_threads
ALTER TABLE chat_threads
DROP COLUMN IF EXISTS group_type,
DROP COLUMN IF EXISTS discoverability,
DROP COLUMN IF EXISTS invite_policy,
DROP COLUMN IF EXISTS invite_policy_locked,
DROP COLUMN IF EXISTS succession_enabled,
DROP COLUMN IF EXISTS admin_min_count,
DROP COLUMN IF EXISTS archived,
DROP COLUMN IF EXISTS archived_reason,
DROP COLUMN IF EXISTS archived_at,
DROP COLUMN IF EXISTS dormancy_state,
DROP COLUMN IF EXISTS last_activity_at,
DROP COLUMN IF EXISTS last_admin_activity_at,
DROP COLUMN IF EXISTS member_count,
DROP COLUMN IF EXISTS security;

-- Remove account_tier from users
ALTER TABLE users DROP COLUMN IF EXISTS account_tier;
```

---

**Ready?** Open https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new and run migrations 1-4 in order!
