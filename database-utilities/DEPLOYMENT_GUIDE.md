# Template Infrastructure - Deployment Guide

## 🎯 Overview

This guide walks you through cleaning up the permission system mess, then deploying the production-grade template infrastructure.

---

## 📋 Pre-Flight Checklist

- [ ] Supabase SQL Editor open: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new
- [ ] Database backup recent (optional but recommended)
- [ ] You have executive admin access

---

## 🔥 STEP 1: Audit Current Permission System

**What:** See what mess we're dealing with
**File:** `database-utilities/PERMISSION_SYSTEM_AUDIT.sql`

**Actions:**
1. Copy the contents of `PERMISSION_SYSTEM_AUDIT.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Review the output, especially:
   - How many executive admins?
   - Are there mismatches between `admin_role` and `account_tier`?
   - How many users have each permission?

**Expected Output:**
- Multiple result tabs showing distributions
- "MISMATCHES" section showing conflicts
- "EXECUTIVE ADMINS" section showing who has exec access
- "MIGRATION PREVIEW" showing what the fix will do

**Decision Point:**
- Review the migration preview carefully
- Make sure you're happy with the proposed changes
- If anything looks wrong, STOP and ask Claude

---

## 🛠️ STEP 2: Consolidate Permission Systems

**What:** Fix the three overlapping systems (admin_role, account_tier, category_id)
**File:** `database-utilities/CONSOLIDATE_PERMISSION_SYSTEMS.sql`

**What It Does:**
1. Backs up current state (temp table for rollback)
2. Migrates `account_tier` admin values → `admin_role`
   - `execadmin` → `executive_admin` + `account_tier = 'free'`
   - `assistant_admin` → `admin` + `account_tier = 'free'`
   - `town_manager` → `moderator` + `account_tier = 'free'`
3. Fixes any mismatches (admin_role takes precedence)
4. Syncs `is_admin` boolean with `admin_role`
5. Creates `user_permissions` view for easy permission checks
6. Shows what changed

**Actions:**
1. Copy the contents of `CONSOLIDATE_PERMISSION_SYSTEMS.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Review output - should see migration results and verification

**Expected Output:**
```
Backed up X users
=== MIGRATION RESULTS ===
(shows before → after for changed users)

Executive admins: 3
Regular admins: 0
Moderators: 0
Remaining account_tier admin values (should be 0): 0
is_admin mismatches (should be 0): 0

✅ Permission system consolidated successfully!
```

**If Something Goes Wrong:**
The SQL includes rollback instructions at the bottom. Uncomment and run to restore.

---

## 🏗️ STEP 3: Deploy Template Infrastructure

**What:** Create production tables for template storage
**File:** `database-utilities/CREATE_TEMPLATE_INFRASTRUCTURE.sql`

**What It Creates:**
1. `field_search_templates` table (main storage)
2. `field_search_templates_history` table (audit trail)
3. RLS policies (executive admin write, everyone read)
4. Triggers for auto-tracking changes
5. Indexes for performance

**Actions:**
1. Copy the contents of `CREATE_TEMPLATE_INFRASTRUCTURE.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"

**Expected Output:**
```
✅ Template infrastructure created successfully!

Tables created:
  - field_search_templates (main table)
  - field_search_templates_history (audit trail)

Security:
  - RLS enabled on both tables
  - Executive admins: INSERT, UPDATE
  - Everyone: SELECT active templates
  - Admins: SELECT history
  - DELETE: Not allowed (archive instead)

Features:
  - Auto-updated timestamps
  - Full audit trail (who, when, what)
  - Version tracking
  - 2-person approval ready
```

**Verification:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%template%';

-- Check seed data
SELECT * FROM field_search_templates;

-- Check history
SELECT * FROM field_search_templates_history;
```

---

## ✅ STEP 4: Verify Everything Works

**Test Permission Checks:**
```sql
-- Check the new view works
SELECT * FROM user_permissions;

-- Check RPC still works
SELECT check_admin_access('executive_admin');
```

**Test Template System:**
1. Open http://localhost:5173/admin/towns-manager
2. Select a town
3. Click on any field
4. Try to save a template
5. Check it saves to database (not localStorage fallback)

---

## 📊 Final State (After All Steps)

**Permission System:**
- `admin_role` = Source of truth for admin permissions
- `account_tier` = Subscription tier ONLY (free/freemium/premium/enterprise)
- `category_id` = FK to user_categories for feature limits
- `is_admin` = Convenience boolean (synced with admin_role)

**Template System:**
- `field_search_templates` = Main storage
- `field_search_templates_history` = Audit trail
- RLS policies working correctly
- Auto-generator includes subdivision

---

## 🚨 Troubleshooting

### Error: "column users.is_executive_admin does not exist"
**Fixed!** The CONSOLIDATE script fixes this. Make sure you run Step 2 before Step 3.

### Error: "permission denied for table users"
You're using anon key. Run the SQL directly in Supabase SQL Editor (not via JavaScript).

### Templates save to localStorage instead of database
RPC function not deployed. Make sure Step 3 (CREATE_TEMPLATE_INFRASTRUCTURE.sql) completed successfully.

### "No executive admin account found"
Run Step 2 (CONSOLIDATE_PERMISSION_SYSTEMS.sql) to fix admin accounts.

---

## 🔄 Rollback Instructions

**If Step 2 (Consolidation) goes wrong:**
```sql
-- Uncomment the rollback code at bottom of CONSOLIDATE_PERMISSION_SYSTEMS.sql
-- It restores from the backup table
```

**If Step 3 (Template Infrastructure) goes wrong:**
```sql
DROP TABLE IF EXISTS field_search_templates_history CASCADE;
DROP TABLE IF EXISTS field_search_templates CASCADE;
DROP VIEW IF EXISTS user_permissions CASCADE;
```

---

## 📝 Next Steps (After Deployment)

Once all steps complete:

1. ✅ Run audit-permission-system.js locally to verify (will work now)
2. ✅ Import 215 production templates
3. ✅ Update EditableDataField.jsx to use database
4. ✅ Test with duplicate town names (e.g., Springfield)
5. ✅ Create checkpoint

---

**Questions? Run into issues?**

Check the error message carefully. Most issues are:
1. RLS blocking query (use SQL Editor, not JS)
2. Column name mismatch (Step 2 fixes this)
3. Missing RPC function (Step 3 creates it)

**Ready to start? Begin with Step 1: PERMISSION_SYSTEM_AUDIT.sql**
