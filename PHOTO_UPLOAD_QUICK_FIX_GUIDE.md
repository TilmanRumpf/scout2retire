# PHOTO UPLOAD QUICK FIX GUIDE
## 2-Hour Emergency Fix for Broken Upload

**Problem**: Users cannot upload photos (HTTP 403 error)
**Root Cause**: Missing RLS policies on storage.objects table
**Status**: Migration exists but needs verification/application

---

## DIAGNOSIS COMPLETE ✅

**Test Results** (from database-utilities/test-town-image-upload.js):
```
✅ Bucket exists: town-images
✅ Admin can upload: SUCCESS
❌ User cannot upload: "new row violates row-level security policy"
```

**Exact Failure Point**:
- File: `src/components/admin/TownPhotoUpload.jsx`
- Line: 78-85 (storage.upload call)
- Error: HTTP 403 RLS violation

---

## IMMEDIATE FIX (2 HOURS)

### Step 1: Verify Migration Applied (15 min)

**Check if policies exist**:
```sql
-- In Supabase SQL Editor
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND definition LIKE '%town-images%';
```

**Expected Results**:
```
"Anyone can view town images" (SELECT)
"Authenticated users can upload town images" (INSERT)
"Authenticated users can update town images" (UPDATE)
"Authenticated users can delete town images" (DELETE)
```

**If NO results found** → Policies missing, continue to Step 2
**If results found** → Policies exist, skip to Step 3

### Step 2: Apply Migration (15 min)

**Migration file**: `supabase/migrations/20251103000000_fix_town_images_storage_policies.sql`

**Option A: Via Supabase Dashboard**
1. Open Supabase dashboard
2. Navigate to SQL Editor
3. Copy entire contents of migration file
4. Execute SQL
5. Verify no errors

**Option B: Via Supabase CLI** (if installed)
```bash
supabase db push
```

**Option C: Manual SQL Execution**
```sql
-- Copy/paste this into Supabase SQL Editor:

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('town-images', 'town-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Anyone can view town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update town images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete town images" ON storage.objects;

-- SELECT: Anyone can view
CREATE POLICY "Anyone can view town images"
ON storage.objects FOR SELECT
USING (bucket_id = 'town-images');

-- INSERT: Authenticated users can upload
CREATE POLICY "Authenticated users can upload town images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'town-images');

-- UPDATE: Authenticated users can update/replace
CREATE POLICY "Authenticated users can update town images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'town-images');

-- DELETE: Authenticated users can delete
CREATE POLICY "Authenticated users can delete town images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'town-images');
```

### Step 3: Test Fix (30 min)

**A. Run Diagnostic Script**:
```bash
cd /Users/tilmanrumpf/Desktop/scout2retire
node database-utilities/test-town-image-upload.js
```

**Expected Output After Fix**:
```
✅ Bucket exists
✅ Admin can upload
✅ User (anon) can upload  ← SHOULD NOW PASS
✅ Everything works! Upload should function correctly.
```

**B. Test via UI**:
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173/scotty
3. Login as admin (tilman.rumpf@gmail.com)
4. Select any town
5. Click "Photos" section
6. Upload a test image to slot 1
7. Verify success toast appears
8. Verify image appears in preview

**C. Verify Database**:
```sql
-- Check that image URL was saved
SELECT id, town_name, image_url_1
FROM towns
WHERE image_url_1 IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;
```

### Step 4: Improve Error Messages (45 min)

**File**: `src/components/admin/TownPhotoUpload.jsx`

**Location**: Lines 116-118

**BEFORE**:
```javascript
} catch (error) {
  console.error('Error uploading photo:', error);
  toast.error(`Failed to upload photo: ${error.message}`);
}
```

**AFTER**:
```javascript
} catch (error) {
  console.error('Error uploading photo:', error);

  // Specific error handling
  if (error.message.includes('row-level security')) {
    toast.error(
      'Upload failed: Permission denied. Please ensure you are logged in as an admin.',
      { duration: 5000 }
    );
    console.error('❌ RLS Policy Issue - Check storage.objects policies for town-images bucket');
    console.error('💡 Run: node database-utilities/test-town-image-upload.js');
  } else if (error.message.includes('exceeded')) {
    toast.error(
      'Upload failed: File too large. Maximum size is 10MB.',
      { duration: 4000 }
    );
  } else if (error.message.includes('network')) {
    toast.error(
      'Upload failed: Network error. Please check your connection.',
      { duration: 4000 }
    );
  } else {
    toast.error(`Failed to upload photo: ${error.message}`, { duration: 4000 });
  }
}
```

### Step 5: Test Edge Cases (15 min)

**Test Scenarios**:
- [ ] Upload JPEG file (should work)
- [ ] Upload PNG file (should work)
- [ ] Upload WebP file (should work)
- [ ] Upload 15MB file (should reject with clear message)
- [ ] Upload .pdf file (should reject)
- [ ] Upload to all 3 slots (should all work)
- [ ] Replace existing photo (upsert should work)
- [ ] Remove photo (should set to NULL)
- [ ] Drag-and-drop upload (should work)

---

## VERIFICATION CHECKLIST

After completing all steps:

- [ ] Diagnostic script passes all tests
- [ ] Can upload photo via UI
- [ ] Photo appears in town card
- [ ] Database shows image_url_1 populated
- [ ] Error messages are helpful
- [ ] All 3 slots can be uploaded
- [ ] Can replace existing photos
- [ ] Can remove photos
- [ ] Drag-and-drop works

---

## IF STILL BROKEN

### Common Issues

**Issue 1**: "User still cannot upload"
- **Check**: Is user actually authenticated?
- **Verify**: `supabase.auth.getUser()` returns user object
- **Fix**: Ensure login is working, check session

**Issue 2**: "Policies exist but still failing"
- **Check**: Policy USING/WITH CHECK clauses
- **Verify**: `bucket_id = 'town-images'` (exact match)
- **Fix**: Drop and recreate policies with exact SQL above

**Issue 3**: "Upload succeeds but URL not saved"
- **Check**: Line 97-100 in TownPhotoUpload.jsx
- **Verify**: No errors in database UPDATE query
- **Fix**: Check RLS policies on `towns` table

**Issue 4**: "Image uploads but doesn't display"
- **Check**: Image URL format in database
- **Verify**: URL starts with https://
- **Fix**: Check getPublicUrl() call (line 91-93)

### Emergency Rollback

If fix causes issues:
```bash
# 1. Revert code changes
git checkout src/components/admin/TownPhotoUpload.jsx

# 2. Drop policies if they cause problems
# (In Supabase SQL Editor):
DROP POLICY IF EXISTS "Authenticated users can upload town images" ON storage.objects;
# ... (drop all 4 policies)

# 3. Restore to checkpoint
git checkout 6c7a446  # Pre-photo-upload-refactor checkpoint
node restore-database-snapshot.js 2025-11-08T19-48-03
```

---

## NEXT STEPS (OPTIONAL)

After immediate fix works:

**Short-term** (4 hours):
- Add metadata capture (source, license, photographer)
- Store in new `image_metadata` JSONB column
- See: PHOTO_UPLOAD_REFACTOR_ANALYSIS.md - Phase 2

**Long-term** (40 hours):
- Create `town_images` table
- Migrate from image_url_1/2/3
- Build new PhotoManager component
- Support unlimited photos
- See: PHOTO_UPLOAD_REFACTOR_ANALYSIS.md - Full plan

---

## FILES MODIFIED

**This Quick Fix**:
1. `supabase/migrations/20251103000000_fix_town_images_storage_policies.sql` (verify applied)
2. `src/components/admin/TownPhotoUpload.jsx` (lines 116-118 - better errors)

**No Other Files Changed** - Minimal risk fix!

---

## TESTING COMMAND

```bash
# One-liner to test everything:
node database-utilities/test-town-image-upload.js && \
echo "✅ If all tests passed, upload is fixed!" || \
echo "❌ Tests failed - check output above"
```

---

**Time Required**: 2 hours
**Risk Level**: LOW (only applying migration + improving errors)
**Rollback**: Easy (git checkout)
**User Impact**: HIGH (unblocks photo uploads immediately)
