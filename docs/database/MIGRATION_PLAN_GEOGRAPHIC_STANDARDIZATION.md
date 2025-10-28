# Geographic Standardization Migration Plan

## Overview
This migration renames `name` → `town_name` and adds ISO standard country/subdivision codes to improve AI search efficiency and prepare for duplicate town names (e.g., multiple Gainesvilles).

## Database Changes

### Phase 1: Add Columns (SAFE - Non-Breaking)
```sql
ALTER TABLE towns
ADD COLUMN town_name VARCHAR(255),
ADD COLUMN country_code VARCHAR(2),
ADD COLUMN subdivision_code VARCHAR(10);

UPDATE towns SET town_name = name;
```

**Status**: SQL migration created at `supabase/migrations/20251028_geographic_standardization.sql`

### Phase 2: Update Code (Breaking Changes)
Update all references from `.name` to `.town_name`

### Phase 3: Verify & Test
Comprehensive testing of all features

### Phase 4: Clean Up (Optional)
Drop old `name` column after 100% verification

---

## Code Updates Required

### Priority 1: High-Traffic Town Files (CRITICAL)

#### 1. `src/utils/townUtils.jsx` ✅ CORE UTILITY
**Lines to update**: 176, 256
**Changes**:
```javascript
// Before
.select('name, country')

// After
.select('town_name, country')
```

#### 2. `src/utils/scoring/matchingAlgorithm.js` ✅ SCORING ENGINE
**Lines to update**: 115, 235, 205
**Changes**:
```javascript
// Line 115, 235
const gainesville = data.towns?.find(t => t.town_name?.toLowerCase().includes('gainesville'));

// SELECT query - need to add town_name to column list
// Check current SELECT statement and add town_name
```

#### 3. `src/utils/scoring/unifiedScoring.js` ✅ UNIFIED SCORING
**Lines to update**: 230, 242, 299
**Changes**:
```javascript
// Before
if (town.name?.toLowerCase().includes('gainesville'))

// After
if (town.town_name?.toLowerCase().includes('gainesville'))
```

#### 4. `src/pages/admin/TownsManager.jsx` ⚠️  COMPLEX - 28 matches
**Strategy**: Systematic replacement
- Replace all `town.name` with `town.town_name`
- Update SELECT queries
- Update validation logic
- Update display components

**Key areas**:
```javascript
// SELECT queries (lines 363, etc.)
.order('town_name')

// Object references
town.town_name

// Validation
if (town.town_name && town.town_name.toLowerCase().startsWith(...))
```

#### 5. `src/pages/admin/AlgorithmManager.jsx` ✅ ALGORITHM MANAGER
**Lines to update**: 99, 129, 133, and 11 more
**Changes**:
```javascript
// SELECT query
.select('id, town_name, country')

// Search filter
town.town_name.toLowerCase().startsWith(searchLower)

// Display
{town.town_name}, {town.country}
```

### Priority 2: Display Components (USER-FACING)

#### 6. `src/components/DailyTownCard.jsx`
```javascript
// toggleFavorite call
await toggleFavorite(user.id, town.id, town.town_name, town.country)

// alt text
alt={town.town_name}
```

#### 7. `src/components/TownCard.jsx`
```javascript
<h4>{town.town_name}</h4>
alt={town.town_name}
```

#### 8. `src/pages/Favorites.jsx`
```javascript
const gainesville = townsResult.towns.find(t => t.town_name?.toLowerCase().includes('gainesville'))
town.town_name?.toLowerCase().includes(searchTerm.toLowerCase())
```

#### 9. `src/pages/Daily.jsx`
```javascript
console.log('Clicked top match:', town.town_name, 'ID:', town.id)
{town.town_name}, {town.country}
```

#### 10. `src/pages/TownDiscovery.jsx`
```javascript
town.town_name || ''
title={`View details for ${town.town_name}`}
```

#### 11. `src/pages/TownComparison.jsx`
```javascript
<span>{town.town_name || fav.town_name}</span>
aria-label={`Select ${town.town_name}`}
```

### Priority 3: Scotty AI Components

#### 12. `src/components/ScottyGuide.jsx` - 17 matches
```javascript
// Line 266
.select('town_name, country')

// Line 71 - This one shows defensive coding!
const name = town.town_name || town.name; // Keep fallback during migration

// Search queries
return `${town.town_name} immigration`
```

#### 13. `src/components/ScottyGuideEnhanced.jsx` - 10 matches
```javascript
.select('id, town_name, country')
return `${town.town_name} visa info`
```

#### 14. `src/utils/scottyGeographicKnowledge.js`
```javascript
.select('id, town_name, country, region, latitude, longitude...')
parts.push(`  • ${town.town_name}${score}${rent}${pop}`)
```

### Priority 4: Chat & Social Features

#### 15. `src/components/GroupChatModal.jsx`
```javascript
.select('town_name, country, region')
.ilike('town_name', `%${search}%`)
name: town.town_name,
```

#### 16. `src/hooks/useChatDataLoader.js`
```javascript
.select('id, town_name, country, region')
.ilike('town_name', cityName)
```

#### 17. `src/hooks/useChatOperations.jsx`
```javascript
.select('id, town_name, country')
topic: town.town_name,
```

### Priority 5: Search & Utils

#### 18. `src/utils/searchUtils.js`
```javascript
.select('town_name, country, region')
value: town.town_name,
display: `${town.town_name}, ${town.region || town.country}`,
```

#### 19. `src/components/admin/TownAccessManager.jsx`
```javascript
.select('id, town_name, country, region')
.order('town_name')
{town.town_name}, {town.country}
```

### Priority 6: Misc Components (Low Impact)

#### 20. `src/utils/scoring/core/calculateMatch.js`
```javascript
town_name: town.town_name,
```

#### 21. `src/components/TownImageOverlay.jsx`
```javascript
aria-label={`View ${town.town_name} on Google Maps`}
```

---

## SYSTEMATIC UPDATE STRATEGY

### Step 1: Update TOWN_SELECT_COLUMNS constant
File: `src/utils/townUtils.jsx`

This is the MOST IMPORTANT update - it defines the default columns for town queries.

```javascript
// Before
const TOWN_SELECT_COLUMNS = `
  id, name, country, population, region, geo_region, regions,
  ...
`;

// After
const TOWN_SELECT_COLUMNS = `
  id, town_name, country, population, region, geo_region, regions,
  ...
`;
```

### Step 2: Update matchingAlgorithm.js SELECT query
File: `src/utils/scoring/matchingAlgorithm.js`

```javascript
// Around line 133-166
const selectColumns = `
  id, town_name, country, population, region,
  ...
`;
```

### Step 3: Batch Update Display Components
Use find-and-replace with verification:
- `town.name` → `town.town_name`
- `t.name` → `t.town_name`
- `item.name` → `item.town_name` (only in town contexts)

### Step 4: Update SQL SELECT Queries
Search pattern: `.select('.*name.*')`

Update each to use `town_name` instead of `name`

### Step 5: Test Each Major Feature
- [ ] Discover page (TownDiscovery)
- [ ] Daily town (Daily)
- [ ] Favorites page
- [ ] Town comparison
- [ ] Algorithm Manager
- [ ] Towns Manager
- [ ] Scotty AI chat
- [ ] Group chats
- [ ] Search functionality

---

## VERIFICATION CHECKLIST

### Database Verification
- [ ] Migration ran without errors
- [ ] All 352 towns have town_name populated
- [ ] town_name matches old name column
- [ ] Indexes created successfully

### Code Verification
- [ ] All 30 SELECT queries updated
- [ ] All 163 dot-name references checked
- [ ] No console errors on any page
- [ ] Search works correctly
- [ ] Favorites work correctly
- [ ] Daily town displays correctly

### Feature Testing
- [ ] Can search for towns by name
- [ ] Town cards display names correctly
- [ ] Favorites show town names
- [ ] Daily town shows name
- [ ] Comparison shows town names
- [ ] Algorithm Manager town search works
- [ ] Towns Manager displays correctly
- [ ] Scotty AI references towns correctly
- [ ] Chat town topics work
- [ ] Group chat town selection works

### Performance Testing
- [ ] Page load times unchanged
- [ ] Search is still fast
- [ ] No N+1 query issues
- [ ] Indexes being used

---

## ROLLBACK PLAN

If critical issues occur:

1. **Immediate**: Revert code changes
   ```bash
   git restore .
   ```

2. **Database**: Old `name` column still exists, app will work
   - No urgent database rollback needed
   - Can drop town_name column later if needed

3. **Full Restore**: Use checkpoint
   ```bash
   node restore-database-snapshot.js 2025-10-28T03-40-05
   git restore .
   ```

---

## TIMELINE ESTIMATE

- **Phase 1** (Database): 5 minutes
- **Phase 2** (Code Updates): 45-60 minutes
- **Phase 3** (Testing): 30 minutes
- **Phase 4** (Fixes): 15-30 minutes buffer

**Total**: ~2 hours

---

## SUCCESS CRITERIA

✅ All pages load without errors
✅ Search finds towns by name
✅ Town names display correctly everywhere
✅ No console errors
✅ Performance maintained or improved
✅ All tests pass
✅ User experience unchanged

---

## FILES SUMMARY

**Total files to modify**: ~30 files
**High priority**: 5 files (townUtils, matchingAlgorithm, unifiedScoring, TownsManager, AlgorithmManager)
**Medium priority**: 15 files (display components, pages)
**Low priority**: 10 files (misc utils, chat features)

**Estimated lines changed**: ~150 lines across 30 files
