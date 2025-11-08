# Photo Migration - Execution Guide

**FOR TILMAN**: Simple step-by-step guide to execute the photo migration safely.

---

## 🚦 Before You Start

**Time needed**: 60 minutes
**Best time**: Late night / early morning (low traffic)
**What you need**: Terminal access, database credentials

---

## ✅ Step 1: Safety First (5 minutes)

### Create Database Snapshot

```bash
cd /Users/tilmanrumpf/Desktop/scout2retire
node create-database-snapshot.js
```

**Wait for**: "Snapshot created at: database-snapshots/..."

### Create Git Checkpoint

```bash
git add -A
git commit -m "🔒 CHECKPOINT: Pre-photo-migration safety point"
git push origin main
```

**Verify**: `git status` shows "nothing to commit"

---

## ✅ Step 2: Record Baseline (2 minutes)

Run this query and **WRITE DOWN THE NUMBERS**:

```bash
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -c "
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) as url1_count,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) as url2_count,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) as url3_count
FROM public.towns;
"
```

**Write here**:
```
url1_count: _____ (expect ~351)
url2_count: _____ (expect ~20-30)
url3_count: _____ (expect ~5-10)
```

---

## ✅ Step 3: Run Migration (3 minutes)

```bash
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000000_create_town_images_table.sql
```

**Watch for** these messages at the end:
```
NOTICE:  ✅ image_url_1 migration complete
NOTICE:  ✅ image_url_2 migration complete
NOTICE:  ✅ image_url_3 migration complete
```

**If you see errors**: STOP and check migration-output.log

---

## ✅ Step 4: Verify Migration (5 minutes)

Run the automated verification script:

```bash
node database-utilities/verify-photo-migration.js
```

**Expected output**:
```
✅ ALL CHECKS PASSED - Migration successful!
```

**If you see errors**:
1. Read the error messages
2. Decide: minor issue (continue) or major issue (rollback)
3. If unsure, **ROLLBACK** (better safe than sorry)

---

## ✅ Step 5: Quick Visual Check (2 minutes)

1. Open browser to: http://localhost:5173/
2. Check a few towns display images correctly
3. Verify no broken image icons
4. Check admin photo upload still works

**If images broken**: Proceed to rollback

---

## 🔄 ROLLBACK (Only if needed)

If something went wrong:

```bash
# Run rollback
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000001_rollback_town_images.sql

# Verify original data intact
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -c "
SELECT COUNT(*) FROM towns WHERE image_url_1 IS NOT NULL;
"
```

**Expected**: Same count as Step 2 baseline

**After rollback**:
1. Document what went wrong
2. Check migration-output.log
3. Fix issues
4. Can safely re-run migration

---

## ✅ Step 6: Success Checkpoint (3 minutes)

If all checks passed:

```bash
# Create success snapshot
node create-database-snapshot.js

# Git checkpoint
git add -A
git commit -m "✅ CHECKPOINT: Photo migration successful

MIGRATION COMPLETE:
- Created town_images table
- Migrated 351 image_url_1 records
- Migrated ~25 image_url_2 records
- Migrated ~8 image_url_3 records
- Cache sync trigger working
- RLS policies enabled

DATABASE:
Snapshot: database-snapshots/[timestamp]/
Verified: All counts match, no orphans, cache synced

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

---

## ✅ Step 7: Monitor (24 hours)

After migration:

### Immediate (next hour)
- [ ] Check Supabase logs for errors
- [ ] Test a few towns on live site
- [ ] Verify admin photo upload works

### Next 24 hours
- [ ] Watch for user reports of broken images
- [ ] Monitor error logs
- [ ] Check query performance

**If issues appear**: Document them, may need to rollback

---

## 📊 What Changed

### Before Migration
```
towns table:
  - image_url_1 (used directly)
  - image_url_2 (used directly)
  - image_url_3 (used directly)
  - 7 other image metadata columns
```

### After Migration
```
towns table:
  - image_url_1 (cache, auto-synced via trigger)
  - image_url_2/3 (preserved but unused)

NEW town_images table:
  - All image data properly normalized
  - Support for unlimited images
  - Full metadata per image
```

### Backward Compatibility
- ✅ All existing code still works
- ✅ image_url_1 still accessible
- ✅ No breaking changes
- ✅ Can gradually migrate to new table

---

## 🚨 Troubleshooting

### "Count mismatch" error
**Cause**: Not all images migrated
**Fix**: Re-run migration (it's idempotent, safe to re-run)

### "Cache not syncing" error
**Cause**: Trigger didn't create
**Fix**: Check trigger exists:
```bash
psql "..." -c "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'town_images';"
```

### "RLS policy error"
**Cause**: Policies didn't create
**Fix**: Check policies:
```bash
psql "..." -c "SELECT policyname FROM pg_policies WHERE tablename = 'town_images';"
```

### "Images not loading"
**Cause**: Could be many things
**Fix**:
1. Check browser console for errors
2. Verify RLS policies (above)
3. Test query: `SELECT * FROM town_images LIMIT 5;`

---

## 📞 Emergency Contacts

If migration goes catastrophically wrong:

1. **ROLLBACK IMMEDIATELY** (see Rollback section above)
2. **Restore snapshot**: `node restore-database-snapshot.js [snapshot-name]`
3. **Document what happened**
4. **Review logs**: migration-output.log
5. **Don't retry until you understand what went wrong**

---

## ✅ Success Checklist

Migration successful if:

- [x] Migration ran without errors
- [x] Verification script passed all checks
- [x] Visual check shows images loading
- [x] Counts match baseline (within ±1)
- [x] Success checkpoint created
- [x] No errors in first hour

**If all checked**: 🎉 **MIGRATION SUCCESSFUL!**

---

## 📚 Full Documentation

For details, see:
- **Complete Report**: `docs/database/PHOTO_MIGRATION_COMPLETE_REPORT.md`
- **Verification Guide**: `docs/database/PHOTO_MIGRATION_VERIFICATION.md`
- **Pre-Flight Checklist**: `docs/database/PHOTO_MIGRATION_PREFLIGHT.md`
- **Quick Reference**: `docs/database/PHOTO_MIGRATION_QUICK_REFERENCE.md`

---

## 🎯 TL;DR - Super Quick Version

```bash
# 1. Safety
node create-database-snapshot.js
git add -A && git commit -m "Pre-migration checkpoint" && git push

# 2. Baseline
psql "..." -c "SELECT COUNT(*) FROM towns WHERE image_url_1 IS NOT NULL;"
# Write down the number

# 3. Migrate
psql "..." -f supabase/migrations/20251109000000_create_town_images_table.sql

# 4. Verify
node database-utilities/verify-photo-migration.js

# 5. Success?
# If YES: Create success checkpoint
# If NO: Run rollback script

# 6. Monitor for 24 hours
```

**That's it!**

---

**Good luck, Tilman! This migration is well-prepared and safe.** 🚀
