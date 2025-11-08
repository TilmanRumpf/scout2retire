# Photo System Migration - Verification Procedures

**Created**: 2025-11-09
**Migration File**: `supabase/migrations/20251109000000_create_town_images_table.sql`
**Rollback File**: `supabase/migrations/20251109000001_rollback_town_images.sql`

---

## 🎯 Migration Overview

**Purpose**: Move from 10 scattered image columns in `towns` table to normalized `town_images` table

**Before**:
- 10 columns in towns table: `image_url_1`, `image_url_2`, `image_url_3`, `image_source`, `image_photographer`, `image_license`, `image_is_fallback`, `image_validated_at`, `image_validation_note`, `image_urls`
- No support for >3 images per town
- Metadata only on first image
- No proper normalization

**After**:
- New `town_images` table with all image data
- `towns.image_url_1` remains as cache field (backward compatibility)
- Trigger keeps cache in sync with display_order=1 image
- Support for unlimited images per town
- Proper metadata on each image

---

## ✅ Pre-Migration Verification

Run these queries BEFORE migration to establish baseline:

```sql
-- Count towns with images in each slot
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) as towns_with_url1,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) as towns_with_url2,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) as towns_with_url3,
  COUNT(*) FILTER (WHERE image_source IS NOT NULL) as towns_with_source,
  COUNT(*) FILTER (WHERE image_photographer IS NOT NULL) as towns_with_photographer,
  COUNT(*) FILTER (WHERE image_license IS NOT NULL) as towns_with_license,
  COUNT(*) FILTER (WHERE image_is_fallback = true) as towns_with_fallback_flag,
  COUNT(*) FILTER (WHERE image_validated_at IS NOT NULL) as towns_validated
FROM public.towns;

-- Sample of image data (for spot checking later)
SELECT
  id,
  town_name,
  image_url_1,
  image_url_2,
  image_url_3,
  image_source,
  image_photographer,
  image_is_fallback
FROM public.towns
WHERE image_url_1 IS NOT NULL
ORDER BY id
LIMIT 10;

-- Total image count across all slots
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) +
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) +
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) as total_images
FROM public.towns;
```

**Expected Results** (as of 2025-11-08):
- ~351 towns with image_url_1
- ~20-30 towns with image_url_2
- ~5-10 towns with image_url_3
- Total images: ~375-390

---

## 🚀 Running the Migration

```bash
# Apply migration
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000000_create_town_images_table.sql

# Check output for verification messages
# Should see:
# ✅ image_url_1 migration complete
# ✅ image_url_2 migration complete
# ✅ image_url_3 migration complete
```

---

## ✅ Post-Migration Verification

### 1. Count Verification

```sql
-- Compare counts: towns columns vs town_images table
SELECT
  'image_url_1' as source,
  (SELECT COUNT(*) FROM towns WHERE image_url_1 IS NOT NULL) as towns_count,
  (SELECT COUNT(*) FROM town_images WHERE display_order = 1) as migrated_count
UNION ALL
SELECT
  'image_url_2',
  (SELECT COUNT(*) FROM towns WHERE image_url_2 IS NOT NULL),
  (SELECT COUNT(*) FROM town_images WHERE display_order = 2)
UNION ALL
SELECT
  'image_url_3',
  (SELECT COUNT(*) FROM towns WHERE image_url_3 IS NOT NULL),
  (SELECT COUNT(*) FROM town_images WHERE display_order = 3);
```

**Expected**: `towns_count` = `migrated_count` for all rows

### 2. Data Integrity Verification

```sql
-- Check that all migrated images have valid town_id references
SELECT COUNT(*)
FROM town_images ti
LEFT JOIN towns t ON ti.town_id = t.id
WHERE t.id IS NULL;
```

**Expected**: 0 (no orphaned records)

```sql
-- Check for duplicate display_order values (should be impossible due to constraint)
SELECT town_id, display_order, COUNT(*)
FROM town_images
GROUP BY town_id, display_order
HAVING COUNT(*) > 1;
```

**Expected**: 0 rows (no duplicates)

### 3. Metadata Migration Verification

```sql
-- Verify metadata migrated correctly for display_order=1 images
SELECT
  t.id,
  t.town_name,
  t.image_source as old_source,
  ti.source as new_source,
  t.image_photographer as old_photographer,
  ti.photographer as new_photographer,
  t.image_license as old_license,
  ti.license as new_license,
  t.image_is_fallback as old_fallback,
  ti.is_fallback as new_fallback
FROM towns t
JOIN town_images ti ON t.id = ti.town_id AND ti.display_order = 1
WHERE
  t.image_source IS DISTINCT FROM ti.source
  OR t.image_photographer IS DISTINCT FROM ti.photographer
  OR t.image_license IS DISTINCT FROM ti.license
  OR COALESCE(t.image_is_fallback, false) IS DISTINCT FROM ti.is_fallback;
```

**Expected**: 0 rows (all metadata matches)

### 4. Cache Sync Verification

```sql
-- Verify towns.image_url_1 matches town_images display_order=1
SELECT
  t.id,
  t.town_name,
  t.image_url_1 as cache_url,
  ti.image_url as source_url
FROM towns t
LEFT JOIN town_images ti ON t.id = ti.town_id AND ti.display_order = 1
WHERE t.image_url_1 IS DISTINCT FROM ti.image_url;
```

**Expected**: 0 rows (cache perfectly in sync)

### 5. Trigger Test

```sql
-- Test trigger: Update display_order=1 image
BEGIN;

-- Find a town with an image
SELECT id, town_name, image_url_1
FROM towns
WHERE image_url_1 IS NOT NULL
LIMIT 1;

-- Note the town_id from above (e.g., 123)
-- Update its display_order=1 image
UPDATE town_images
SET image_url = 'https://example.com/test-trigger.jpg'
WHERE town_id = 123 AND display_order = 1;

-- Check that towns.image_url_1 was updated automatically
SELECT id, town_name, image_url_1
FROM towns
WHERE id = 123;

-- Should show: image_url_1 = 'https://example.com/test-trigger.jpg'

-- Rollback test
ROLLBACK;
```

**Expected**: Cache field updates automatically via trigger

---

## 🔍 Spot Check Sample Towns

Manually verify a few specific towns with known image data:

```sql
-- Check a few well-known towns
SELECT
  t.id,
  t.town_name,
  t.country,
  t.image_url_1,
  (SELECT COUNT(*) FROM town_images WHERE town_id = t.id) as image_count,
  (SELECT image_url FROM town_images WHERE town_id = t.id AND display_order = 1) as migrated_primary
FROM towns t
WHERE t.town_name IN ('Valencia', 'Porto', 'Lisbon', 'Málaga', 'Alicante')
ORDER BY t.town_name;
```

**Expected**:
- image_url_1 = migrated_primary for all towns
- image_count >= 1 for towns with photos

---

## 🚨 Orphaned Records Check

Check for any image URLs that didn't migrate:

```sql
-- Find towns with image_url_1 but NO display_order=1 in town_images
SELECT
  t.id,
  t.town_name,
  t.image_url_1
FROM towns t
WHERE t.image_url_1 IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM town_images ti
  WHERE ti.town_id = t.id AND ti.display_order = 1
);
```

**Expected**: 0 rows

```sql
-- Find towns with image_url_2 but NO display_order=2 in town_images
SELECT
  t.id,
  t.town_name,
  t.image_url_2
FROM towns t
WHERE t.image_url_2 IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM town_images ti
  WHERE ti.town_id = t.id AND ti.display_order = 2
);
```

**Expected**: 0 rows

```sql
-- Find towns with image_url_3 but NO display_order=3 in town_images
SELECT
  t.id,
  t.town_name,
  t.image_url_3
FROM towns t
WHERE t.image_url_3 IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM town_images ti
  WHERE ti.town_id = t.id AND ti.display_order = 3
);
```

**Expected**: 0 rows

---

## 🔐 RLS Policy Verification

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'town_images';
```

**Expected**: `rowsecurity = true`

```sql
-- List policies on town_images
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'town_images';
```

**Expected**: 2 policies
1. "Public can view town images" - SELECT for public
2. "Admins can manage town images" - ALL for admins

---

## 📊 Performance Check

```sql
-- Check indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'town_images'
ORDER BY indexname;
```

**Expected**: At least 3 indexes
1. Primary key on `id`
2. `idx_town_images_town_id` on `town_id`
3. `idx_town_images_display_order` on `(town_id, display_order)`

```sql
-- Test query performance (should use index)
EXPLAIN ANALYZE
SELECT * FROM town_images
WHERE town_id = 123
ORDER BY display_order;
```

**Expected**: Index scan, not sequential scan

---

## 🔄 Rollback Verification

If rollback is needed:

```bash
# Run rollback
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000001_rollback_town_images.sql
```

After rollback, verify:

```sql
-- town_images table should not exist
SELECT tablename
FROM pg_tables
WHERE tablename = 'town_images';
```

**Expected**: 0 rows

```sql
-- Original columns should still have data
SELECT COUNT(*)
FROM towns
WHERE image_url_1 IS NOT NULL;
```

**Expected**: Same count as pre-migration (~351)

---

## ✅ Final Checklist

Before considering migration complete:

- [ ] All counts match (towns columns vs town_images rows)
- [ ] No orphaned records in either direction
- [ ] Metadata migrated correctly for display_order=1 images
- [ ] Cache sync verified (towns.image_url_1 matches town_images)
- [ ] Trigger tested and working
- [ ] RLS policies enabled and correct
- [ ] Indexes created and performing well
- [ ] No duplicate display_order values per town
- [ ] Spot check of 5+ towns confirms data integrity

---

## 🐛 Troubleshooting

### Issue: Count mismatch after migration

**Diagnosis**:
```sql
-- Find which towns have mismatches
SELECT
  t.id,
  t.town_name,
  t.image_url_1,
  ti.image_url
FROM towns t
LEFT JOIN town_images ti ON t.id = ti.town_id AND ti.display_order = 1
WHERE t.image_url_1 IS NOT NULL AND ti.image_url IS NULL;
```

**Fix**: Re-run migration (idempotent - safe to run multiple times)

### Issue: Trigger not firing

**Diagnosis**:
```sql
-- Check trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'town_images';
```

**Fix**: Re-create trigger manually from migration file

### Issue: Duplicate display_order error

**This should be impossible** due to UNIQUE constraint. If you see this:
1. Check for race conditions in concurrent inserts
2. Verify constraint exists: `\d town_images` in psql
3. Report as critical bug

---

## 📞 Support

If migration fails or verification shows issues:
1. DO NOT proceed with dropping old columns
2. Document exact error/mismatch
3. Take database snapshot: `node create-database-snapshot.js`
4. Run rollback if necessary
5. Investigate root cause before re-migrating

**Migration is IDEMPOTENT** - safe to run multiple times if needed.
