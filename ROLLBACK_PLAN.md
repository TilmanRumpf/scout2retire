# 🔄 ROLLBACK PLAN - Geographic/Vegetation Auto-Population
## Safe Return Point: 2025-08-23T19-57-52

### 📅 Current Checkpoint
- **Date**: August 23, 2025
- **Time**: 19:57:52 UTC
- **Database Snapshot**: `database-snapshots/2025-08-23T19-57-52`
- **Git Commit**: Will be created after this file
- **Issue Being Fixed**: Spanish towns showing 44% region match instead of 100%

### 🎯 Changes to Be Made
1. Convert `geographic_features_actual` to PostgreSQL generated column
2. Convert `vegetation_type_actual` to PostgreSQL generated column
3. Create inference functions for automatic data population
4. Achieve 100% data coverage (no NULLs)

---

## 🚨 EMERGENCY ROLLBACK PROCEDURES

### Method 1: Full Database Restore (Nuclear Option)
```bash
# Restore entire database to pre-change state
node restore-database-snapshot.js 2025-08-23T19-57-52
```

### Method 2: Selective Table Rollback (Recommended)
```bash
# Restore only towns table from snapshot
node restore-database-snapshot.js 2025-08-23T19-57-52 --table=towns
```

### Method 3: Git Code Rollback
```bash
# Return to this exact checkpoint
git checkout rollback-checkpoint-20250823-1957

# Or if you tagged it
git checkout before-geo-veg-autopop
```

---

## 📊 Current State Documentation

### Database State BEFORE Changes
```sql
-- Current data coverage (BEFORE)
-- Total towns: 341
-- Towns with geographic_features_actual: ~140 (41%)
-- Towns with vegetation_type_actual: ~130 (38%)
-- Spanish towns with data: ~5 (10%)
-- Spanish towns region score: 44%
```

### Critical Files BEFORE Changes
- `/src/utils/enhancedMatchingAlgorithm.js` - Contains fallback logic for missing data
- `/src/utils/userPreferences.js` - Handles user preference storage
- `/src/utils/onboardingUtils.js` - Manages onboarding data transformation

### Tables That Will Be Modified
1. **towns** table:
   - `geographic_features_actual` column (will become generated)
   - `vegetation_type_actual` column (will become generated)

---

## 🔧 Rollback SQL Scripts

### Quick Rollback Script
Save this as `emergency-rollback.sql`:
```sql
-- 1. Drop generated columns if they exist
ALTER TABLE towns 
  DROP COLUMN IF EXISTS geographic_features_actual CASCADE,
  DROP COLUMN IF EXISTS vegetation_type_actual CASCADE;

-- 2. Recreate as regular columns
ALTER TABLE towns 
  ADD COLUMN geographic_features_actual TEXT[],
  ADD COLUMN vegetation_type_actual TEXT[];

-- 3. Restore data from snapshot (run from Node.js)
-- node restore-database-snapshot.js 2025-08-23T19-57-52 --table=towns

-- 4. Drop inference functions
DROP FUNCTION IF EXISTS infer_geographic_features CASCADE;
DROP FUNCTION IF EXISTS infer_vegetation_type CASCADE;

-- 5. Drop any backup tables
DROP TABLE IF EXISTS towns_backup_geo_veg;
```

---

## ✅ Validation Checklist BEFORE Rollback

Before rolling back, check if these issues exist:
- [ ] Spanish towns still showing 44% (not fixed)
- [ ] Application crashes or errors
- [ ] Data corruption in towns table
- [ ] Performance severely degraded
- [ ] User matching completely broken

If NONE of these issues exist, rollback may not be necessary.

---

## 📝 Rollback Decision Tree

```
Is the app completely broken?
├─ YES → Method 1: Full Database Restore
└─ NO → Continue
    │
    Are matching scores worse than before?
    ├─ YES → Method 2: Selective Table Rollback
    └─ NO → Continue
        │
        Is there bad data in towns?
        ├─ YES → Method 3: Git + Selective Restore
        └─ NO → Monitor, don't rollback
```

---

## 🎬 Post-Rollback Actions

If rollback is executed:

1. **Notify Team**
   ```
   Subject: Rollback Executed - Geographic/Vegetation Auto-Population
   - Time of rollback: [TIME]
   - Method used: [METHOD]
   - Reason: [SPECIFIC ISSUE]
   - Status: [STABLE/MONITORING]
   ```

2. **Document Lessons Learned**
   - What went wrong?
   - What wasn't tested properly?
   - How to prevent in future?

3. **Re-plan Implementation**
   - Fix identified issues
   - Add more comprehensive tests
   - Schedule new deployment window

---

## 📞 Emergency Contacts

- Database Admin: Check Supabase dashboard
- Git Repository: https://github.com/[your-repo]
- Monitoring: Check Vercel dashboard

---

## 🔍 Monitoring Points

After implementation, monitor these metrics:
1. Spanish towns region scores (should be 90-100%, not 44%)
2. Query performance on /discover page
3. User preference matching accuracy
4. Database CPU/memory usage
5. Error logs for any NULL-related issues

---

## 💾 Backup Locations

1. **Database Snapshot**: `/database-snapshots/2025-08-23T19-57-52/`
   - towns.json (341 records)
   - users.json (12 records)
   - user_preferences.json (12 records)
   - favorites.json (26 records)
   - notifications.json (5 records)

2. **Git Checkpoint**: `rollback-checkpoint-20250823-1957`

3. **Implementation Guide**: `AUTO_POPULATE_GEOGRAPHIC_VEGETATION_GUIDE.md`

---

## ⚡ Quick Commands Reference

```bash
# Check current git status
git status

# Create checkpoint tag
git tag -a before-geo-veg-autopop -m "Before geographic/vegetation auto-population"

# View snapshot contents
ls -la database-snapshots/2025-08-23T19-57-52/

# Test database connection
node claude-db-helper.js "SELECT COUNT(*) FROM towns"

# Check Spanish towns scores (before)
node test-spanish-region-scores.js

# Restore if needed
node restore-database-snapshot.js 2025-08-23T19-57-52
```

---

## ✋ STOP CONDITIONS

DO NOT proceed with implementation if:
- [ ] Database backup failed
- [ ] Git has uncommitted changes
- [ ] Active users on production
- [ ] Snapshot validation shows corruption
- [ ] Team not notified

---

## 🎯 Success Criteria After Implementation

- Spanish towns show 90-100% region match (not 44%)
- All 341 towns have geographic_features_actual populated
- All 341 towns have vegetation_type_actual populated
- No performance degradation
- No errors in logs

---

**Rollback Plan Created**: 2025-08-23 19:57:52
**Ready for Implementation**: YES ✅
**Safe Return Point Established**: YES ✅