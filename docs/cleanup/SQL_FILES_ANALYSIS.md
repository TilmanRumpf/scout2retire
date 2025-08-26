# SQL Files Analysis
**Date: August 25, 2025**

## Summary
Found **55 SQL files** in the codebase. Most can be safely removed or archived.

## Categories & Recommendations

### 1. ✅ **KEEP: Supabase Migrations** (18 files)
**Location:** `supabase/migrations/`
**Purpose:** Official database migrations tracked by Supabase
**Recommendation:** **KEEP ALL** - These are essential for database schema versioning

Examples:
- `20250815_add_housing_preference_column.sql`
- `20250714054000_create_delete_user_account_function.sql`
- `20250713070809_zero_memory_user_deletion.sql`

### 2. 🗄️ **ARCHIVE: Root Level SQL Files** (9 files)
**Location:** Root directory
**Purpose:** One-off scripts, mostly already executed
**Recommendation:** **MOVE TO ARCHIVE**

Files to archive:
- `db_schema.sql` - Schema documentation (might be outdated)
- `online_schema.sql` - Another schema file
- `create_scotty_conversations_table.sql` - Already created
- `create_hobbies_tables.sql` - Already created
- `create_all_hobbies.sql` - Already created
- `hobbies_complete_setup.sql` - Already executed
- `add_universal_hobbies.sql` - Already executed
- `create-activities-trigger.sql` - Already created
- `create-delete-function.sql` - Already created

### 3. 🗄️ **ARCHIVE: SQL Directory** (16 files)
**Location:** `sql/`
**Purpose:** Fix scripts, mostly already applied
**Recommendation:** **MOVE TO ARCHIVE**

These appear to be fixes that have already been applied:
- `fix_*.sql` files (11 files) - Already applied fixes
- `check_*.sql` files (4 files) - Diagnostic queries
- `analyze_*.sql` files (1 file) - Analysis scripts

### 4. 🗄️ **ARCHIVE: Cleanup Migrations** (3 files)
**Location:** `cleanup_migrations/`
**Purpose:** Old cleanup scripts
**Recommendation:** **MOVE TO ARCHIVE**

- `01_drop_nationality.sql`
- `02_drop_avatar_favorites.sql`
- `03_drop_retirement_status.sql`

### 5. 🗄️ **ARCHIVE: Towns Updater SQL** (8 files)
**Location:** `towns-updater/`
**Purpose:** Data fix scripts
**Recommendation:** **MOVE TO ARCHIVE**

- `fix_double_slash_urls.sql` - Already applied
- `fix_foreign_key_cascade.sql` - Already applied
- `check_image_urls.sql` - Diagnostic query
- `get_town_images.sql` - Query script
- `delete_user.sql` - Utility script
- `delete_user_with_relations.sql` - Utility script

### 6. ⚠️ **REVIEW: Potentially Useful** (1 file)
**Location:** `scripts/`
- `add-hobby-capabilities.sql` - Might be needed for future hobby additions

## Action Plan

### Step 1: Create Archive Structure
```bash
mkdir -p archive/sql-scripts/root
mkdir -p archive/sql-scripts/fixes
mkdir -p archive/sql-scripts/cleanup-migrations
mkdir -p archive/sql-scripts/towns-updater
```

### Step 2: Move Non-Essential SQL Files
```bash
# Move root SQL files
mv *.sql archive/sql-scripts/root/ 2>/dev/null

# Move sql directory
mv sql/ archive/sql-scripts/fixes/ 2>/dev/null

# Move cleanup migrations
mv cleanup_migrations/*.sql archive/sql-scripts/cleanup-migrations/ 2>/dev/null

# Move towns-updater SQL
mv towns-updater/*.sql archive/sql-scripts/towns-updater/ 2>/dev/null
```

### Step 3: Keep Only Essential Files
- Keep `supabase/migrations/` intact (official migrations)
- Keep `scripts/add-hobby-capabilities.sql` if needed

## Impact Assessment

**Risk Level:** LOW ✅
- These SQL files are not imported or executed by the application
- They're mostly one-off scripts that have already been run
- Supabase migrations (the important ones) will be preserved

**Benefits:**
- Cleaner root directory
- Clear separation between migrations and utility scripts
- Easier to identify what's actually in use

## Files Summary

| Category | Count | Action | Risk |
|----------|-------|--------|------|
| Supabase Migrations | 18 | KEEP | Essential |
| Root SQL Files | 9 | ARCHIVE | Low |
| SQL Directory | 16 | ARCHIVE | Low |
| Cleanup Migrations | 3 | ARCHIVE | Low |
| Towns Updater | 8 | ARCHIVE | Low |
| Scripts | 1 | REVIEW | Low |
| **TOTAL** | **55** | **37 to archive** | **Low** |

---

**Recommendation:** Archive 37 non-essential SQL files, keeping only the 18 official Supabase migrations.