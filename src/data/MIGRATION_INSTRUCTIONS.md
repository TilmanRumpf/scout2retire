# Supabase Migration Instructions

## Overview
These migrations implement comprehensive data consistency improvements and image validation to align with onboarding questions.

## Migration Files

### 1. Combined Migration (Run First)
**File**: `combined_migration_v2.sql`
- Creates `regional_inspirations` table with exact onboarding alignment
- Adds image validation fields to towns table
- Creates `curated_location_images` table
- Sets up image validation triggers

### 2. Insert Regional Inspirations Data
**File**: `insert_regional_inspirations_v2.sql`
- Inserts 20 regional inspirations with complete data
- All fields align with onboarding categories
- Includes high-quality Unsplash images

### 3. Insert Curated Images
**File**: `add_image_validation_fields.sql` (lines 110-220)
- Contains INSERT statements for curated fallback images
- One primary image per country
- Multiple backup images for variety

### 4. Update Towns Table Structure
**File**: `update_towns_table_v2.sql`
- Adds 40+ missing fields to align with onboarding
- Creates triggers to derive categories from scores
- Adds proper indexes for performance

## Execution Order

### Step 1: Run Combined Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `combined_migration_v2.sql`
3. Run the query
4. Verify tables created: `regional_inspirations`, `curated_location_images`

### Step 2: Insert Regional Inspirations
1. Copy contents of `insert_regional_inspirations_v2.sql`
2. Run in SQL Editor
3. Verify 20 rows inserted

### Step 3: Insert Curated Images
1. Copy INSERT statements from `add_image_validation_fields.sql` (lines 110-220)
2. Run in SQL Editor
3. Verify images inserted for all countries

### Step 4: Update Towns Table (Optional - Large Change)
**Warning**: This makes significant changes to the towns table structure.
1. BACKUP your towns table first
2. Copy contents of `update_towns_table_v2.sql`
3. Run in batches if needed (it's a large migration)
4. Verify new columns added

## Verification Queries

```sql
-- Check regional inspirations
SELECT COUNT(*) FROM regional_inspirations;
-- Should return 20

-- Check curated images
SELECT country, COUNT(*) 
FROM curated_location_images 
GROUP BY country;
-- Should show images for each country

-- Check towns with bad images
SELECT id, name, country, image_url_1 
FROM towns 
WHERE image_url_1 ~* 'rabbit|bunny|animal|placeholder'
   OR image_url_1 IS NULL
LIMIT 10;

-- Test image validation function
SELECT get_best_image_for_town('Panama', NULL, ARRAY['mountains']);
-- Should return a Panama image URL
```

## Rollback Plan

If issues occur:

```sql
-- Rollback regional inspirations
DROP TABLE IF EXISTS regional_inspirations CASCADE;

-- Rollback image tables
DROP TABLE IF EXISTS curated_location_images CASCADE;
DROP FUNCTION IF EXISTS get_best_image_for_town CASCADE;
DROP FUNCTION IF EXISTS validate_town_image CASCADE;

-- Remove image columns from towns
ALTER TABLE towns 
DROP COLUMN IF EXISTS image_validation_note,
DROP COLUMN IF EXISTS image_validated_at,
DROP COLUMN IF EXISTS image_is_fallback,
DROP COLUMN IF EXISTS image_source;
```

## Post-Migration Tasks

1. **Update Frontend Components**:
   - Replace `LazyImage` with `LazyImageValidated` in key components
   - Ensure `location` prop is passed for context

2. **Monitor Image Quality**:
   ```sql
   -- Find towns still using fallback images
   SELECT COUNT(*) FROM towns WHERE image_is_fallback = true;
   ```

3. **Test Regional Inspirations**:
   - Check Daily page shows appropriate regional content
   - Verify images load correctly
   - Test "Show Another" functionality

## Notes

- Image validation runs automatically on INSERT/UPDATE
- Bad images (animals, placeholders) are auto-replaced
- Missing images get country-appropriate fallbacks
- All new fields align with onboarding questions exactly