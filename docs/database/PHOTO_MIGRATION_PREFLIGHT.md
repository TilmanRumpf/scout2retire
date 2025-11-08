# Photo Migration Pre-Flight Safety Checklist

**Date**: 2025-11-09
**Migration**: `20251109000000_create_town_images_table.sql`
**Risk Level**: MEDIUM (affects production image data)

---

## 🔴 CRITICAL: DO NOT PROCEED WITHOUT THESE STEPS

### 1. Database Snapshot (MANDATORY)

```bash
# Create snapshot BEFORE migration
node create-database-snapshot.js
```

**Verify snapshot created**:
```bash
ls -la database-snapshots/ | head -5
# Should show new snapshot with today's date
```

### 2. Git Checkpoint (MANDATORY)

```bash
git add -A
git commit -m "🔒 CHECKPOINT: Pre-photo-migration safety point"
git push origin main
```

---

## ✅ Pre-Flight Checks

### Check 1: Database Connection

```bash
# Verify you can connect to database
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -c "SELECT COUNT(*) FROM towns;"
```

**Expected**: Returns count (should be ~351)

### Check 2: No Active Users

```bash
# Check for active sessions (run during low-traffic time)
psql "..." -c "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'postgres' AND state = 'active';"
```

**Expected**: <5 active connections (ideally 1-2)

**Best Time to Migrate**: Late night / early morning (low traffic)

### Check 3: Baseline Data Counts

Run and SAVE these results:

```sql
-- SAVE THESE NUMBERS!
SELECT
  COUNT(*) FILTER (WHERE image_url_1 IS NOT NULL) as url1_count,
  COUNT(*) FILTER (WHERE image_url_2 IS NOT NULL) as url2_count,
  COUNT(*) FILTER (WHERE image_url_3 IS NOT NULL) as url3_count,
  COUNT(*) FILTER (WHERE image_source IS NOT NULL) as source_count,
  COUNT(*) FILTER (WHERE image_photographer IS NOT NULL) as photographer_count
FROM public.towns;
```

**Write down results here**:
```
url1_count: _______
url2_count: _______
url3_count: _______
source_count: _______
photographer_count: _______
```

### Check 4: No Existing town_images Table

```sql
-- Should return 0 rows (table doesn't exist yet)
SELECT tablename FROM pg_tables WHERE tablename = 'town_images';
```

**Expected**: 0 rows

**If table exists**: Either old migration exists, or someone already migrated. STOP and investigate.

### Check 5: Migration File Integrity

```bash
# Check file exists and is readable
cat supabase/migrations/20251109000000_create_town_images_table.sql | head -20
```

**Expected**: Should show migration header comments

```bash
# Check file size (should be ~10-15KB)
wc -l supabase/migrations/20251109000000_create_town_images_table.sql
```

**Expected**: ~350-400 lines

### Check 6: Verify No Image Data Loss Risk

```sql
-- Check for any weird/corrupted image URLs
SELECT id, town_name, image_url_1
FROM towns
WHERE image_url_1 IS NOT NULL
AND (
  image_url_1 = ''
  OR image_url_1 LIKE '%undefined%'
  OR image_url_1 LIKE '%null%'
  OR LENGTH(image_url_1) < 10
)
LIMIT 10;
```

**Expected**: 0 rows (no corrupted URLs)

**If found**: Document these towns, may need manual cleanup

---

## 🚨 Risk Assessment

### What Could Go Wrong

1. **Trigger fails to create** → Cache field doesn't sync
   - Impact: Low - can recreate trigger manually
   - Mitigation: Rollback script included

2. **Migration partially completes** → Some images not migrated
   - Impact: Medium - missing images on some towns
   - Mitigation: Migration is idempotent, can re-run

3. **RLS policies fail** → Security issue
   - Impact: High - unauthorized access or no access
   - Mitigation: Verify policies immediately after migration

4. **Data corruption during migration** → Lost image URLs
   - Impact: CRITICAL - data loss
   - Mitigation: Snapshot + rollback script + original columns preserved

### Safety Nets in Place

✅ **Database snapshot** - Can restore entire database
✅ **Git checkpoint** - Can revert code changes
✅ **Rollback script** - Can drop new table and keep original
✅ **Idempotent migration** - Safe to run multiple times
✅ **Original columns preserved** - Data not deleted, only copied
✅ **ON CONFLICT clauses** - Won't create duplicates if re-run

---

## 🎯 Migration Execution Plan

### Step 1: Pre-Flight (15 minutes)

- [ ] Create database snapshot
- [ ] Create git checkpoint
- [ ] Run all pre-flight checks above
- [ ] Save baseline counts
- [ ] Verify migration file integrity
- [ ] Choose low-traffic time window

### Step 2: Execute Migration (5 minutes)

```bash
# Run migration
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000000_create_town_images_table.sql \
  > migration-output.log 2>&1

# Check output
cat migration-output.log
```

**Watch for**:
- ✅ messages in output
- Any ERROR or WARNING lines
- Count verification messages at end

### Step 3: Immediate Verification (10 minutes)

Run quick checks from `PHOTO_MIGRATION_VERIFICATION.md`:

1. Count verification (must match baseline)
2. Cache sync check
3. Trigger test
4. RLS policy check

### Step 4: Full Verification (20 minutes)

Run complete verification suite from `PHOTO_MIGRATION_VERIFICATION.md`

### Step 5: Rollback Decision Point

**If ANY of these are true, ROLLBACK**:
- [ ] Counts don't match (within ±1 tolerance)
- [ ] >5 orphaned records
- [ ] Cache not syncing
- [ ] RLS policies missing
- [ ] Any ERROR in migration output

**Rollback command**:
```bash
psql "postgresql://postgres.axlruvvsjepsulcbqlho:Dortmund1909!@aws-0-us-west-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251109000001_rollback_town_images.sql
```

---

## 🔄 Rollback Procedure

If migration fails or shows issues:

### 1. Stop immediately
Don't try to "fix" issues during migration

### 2. Run rollback script
```bash
psql "..." -f supabase/migrations/20251109000001_rollback_town_images.sql
```

### 3. Verify rollback
```sql
-- town_images should not exist
SELECT tablename FROM pg_tables WHERE tablename = 'town_images';
-- Expected: 0 rows

-- Original data should be intact
SELECT COUNT(*) FROM towns WHERE image_url_1 IS NOT NULL;
-- Expected: Same as baseline (from Step 3 of pre-flight)
```

### 4. Investigate root cause
- Check migration-output.log for errors
- Review failed verification checks
- Document what went wrong

### 5. Fix and retry
- Update migration file if needed
- Can safely re-run (idempotent design)

---

## 📊 Success Criteria

Migration is successful ONLY if ALL these are true:

✅ **Zero data loss**
- All image_url_1 values migrated
- All image_url_2 values migrated
- All image_url_3 values migrated
- All metadata migrated

✅ **Cache sync working**
- towns.image_url_1 matches town_images display_order=1
- Trigger fires on INSERT/UPDATE/DELETE

✅ **No orphans**
- Every town_images.town_id has valid towns.id
- Every towns.image_url_N has matching town_images row

✅ **Security correct**
- RLS enabled on town_images
- Public can read, only admins can write

✅ **Performance acceptable**
- Indexes created
- Queries use index scans

---

## 🚫 DO NOT Proceed If

- ❌ No database snapshot taken
- ❌ No git checkpoint created
- ❌ During high-traffic hours
- ❌ Baseline counts not recorded
- ❌ Migration file corrupted/missing
- ❌ You don't understand rollback procedure
- ❌ Rollback script not tested/verified

---

## 📞 Emergency Contacts

If migration goes catastrophically wrong:

1. **Immediate**: Run rollback script
2. **Restore snapshot**: `node restore-database-snapshot.js [snapshot-name]`
3. **Git revert**: `git reset --hard [checkpoint-hash]`
4. **Document**: What happened, what was tried, what failed

---

## ✅ Sign-Off Checklist

Before running migration, confirm:

- [ ] I have created a database snapshot
- [ ] I have created a git checkpoint
- [ ] I have recorded baseline counts
- [ ] I understand the rollback procedure
- [ ] I am running during low-traffic hours
- [ ] I have 30+ minutes for full verification
- [ ] I know what to do if it fails

**Signed**: _________________ **Date**: _________

---

## 🎓 Lessons from Past Disasters

### August 24, 2025: 40-Hour Case Sensitivity Bug
- **Mistake**: Assumed data was missing, didn't verify
- **Lesson**: Always check actual data BEFORE assuming problem
- **Applied Here**: Pre-flight baseline counts mandatory

### October 6, 2025: Duplicate Definition Hell
- **Mistake**: Two definitions of same variable, second missing fields
- **Lesson**: Search for duplicates before creating
- **Applied Here**: Check for existing town_images table first

### November 2025: RLS Policy Lockout
- **Mistake**: Forgot to create RLS policies after creating table
- **Lesson**: Verify security immediately after migration
- **Applied Here**: RLS verification in immediate checks

---

**Remember**: This migration is REVERSIBLE. When in doubt, rollback and investigate.

**Better to rollback and retry than to corrupt production data.**
