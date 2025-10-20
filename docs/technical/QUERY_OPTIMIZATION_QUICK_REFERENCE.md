# Database Query Optimization - Quick Reference
## Scout2Retire Performance Issues Summary

**Full Analysis**: See `DATABASE_QUERY_OPTIMIZATION.md`

---

## 🔴 TOP 5 CRITICAL ISSUES TO FIX

### 1. Duplicate Town Lookups (5 min fix)
**File**: `src/utils/townUtils.jsx` lines 171-182, 250-264
**Problem**: Fetches town details twice per favorite toggle
**Impact**: 686+ unnecessary queries per user per session
**Fix**: Make `townName`/`townCountry` required parameters

```javascript
// Before: Optional, causes 2 lookups
export const toggleFavorite = async (userId, townId, townName = null, townCountry = null) => {

// After: Required, eliminates lookups
export const toggleFavorite = async (userId, townId, townName, townCountry) => {
  if (!townName || !townCountry) throw new Error('Town details required');
```

---

### 2. SELECT * with 170+ Columns (10 min fix)
**File**: `src/pages/admin/PaywallManager.jsx` line 110
**Problem**: Loads all user data just to count by tier
**Impact**: 170,000+ fields sent for simple aggregation
**Fix**: Use database aggregation RPC instead

```javascript
// Before: Loads 1000 users × 170 columns
const { data } = await supabase.from('users').select(...);
const stats = {};
data.forEach(user => stats[...] = ...);

// After: 1 RPC call returns pre-aggregated counts
const { data: stats } = await supabase.rpc('get_user_tier_counts');
```

---

### 3. Chat Subscriptions Fire Per Message (20 min fix)
**File**: `src/hooks/useChatSubscriptions.js` lines 18-146
**Problem**: 3 subscriptions trigger `loadUnreadCounts` on every message
**Impact**: 3,000+ queries per hour in active chats
**Fix**: Consolidate into 1 subscription with debounced updates

```javascript
// Before: 3 separate subscriptions
supabase.channel('...').on('INSERT', ...).subscribe();
supabase.channel('...').on('INSERT', ...).subscribe();  // Duplicate!
supabase.channel('...').on('INSERT', ...).subscribe();  // Duplicate!

// After: 1 smart subscription with routing
supabase.channel('chat_unified')
  .on('INSERT', {table: 'chat_messages'}, (payload) => {
    if (payload.new.thread_id === activeThread?.id) {
      // Append to UI immediately
    } else {
      // Debounce unread count update
    }
  })
  .subscribe();
```

---

### 4. Missing Pagination on Town Lists (1 hour fix)
**File**: `src/utils/townUtils.jsx` + callers
**Problem**: Loads all 343 towns when only 20 needed
**Impact**: 60% of initial page load payload
**Fix**: Add default limits and pagination

```javascript
// Before: No limit specified
await fetchTowns({ userId });  // Returns 500 records

// After: Sensible defaults
await fetchTowns({ userId, limit: 20, offset: 0 });

// callers: src/hooks/useChatDataLoaders.js L225
- await loadAllTowns();
+ await loadAllTowns(20);  // First page only
```

---

### 5. Triple Chat Subscriptions (Already Noted Above)
**File**: `src/hooks/useChatSubscriptions.js`
**Problem**: Same event listened 3 times
**Impact**: Triplicate processing, memory bloat
**Combined Fix**: See #3 above

---

## 📊 QUERY CHECKLIST

Before writing any database query, check:

- [ ] Using `COLUMN_SETS` or specific column list (not `SELECT *`)
- [ ] No N+1 patterns (queries in loops)
- [ ] No sequential queries when parallel possible (use `Promise.all()`)
- [ ] Pagination specified for list queries (`.limit()`, `.range()`)
- [ ] Batch RPC calls used for multiple IDs (e.g., `get_users_by_ids`)
- [ ] Error handling includes retry logic
- [ ] Related data uses proper joins, not separate queries
- [ ] Consider: Is this query needed? Could it be cached?

---

## 📁 FILES REQUIRING FIXES (Priority Order)

### 🚨 Highest (Fixable Today)
1. `src/utils/townUtils.jsx` - 3 issues, ~1 hour total
2. `src/hooks/useChatSubscriptions.js` - 2 issues, ~1 hour total  
3. `src/pages/admin/PaywallManager.jsx` - 1 issue, ~30 min

### ⚠️ High (This Week)
4. `src/hooks/useChatDataLoaders.js` - Multiple issues, ~2 hours
5. `src/hooks/useChatOperations.jsx` - Pattern consistency, ~1 hour
6. `src/utils/townUtils.jsx` - Column set usage, ~30 min

### 📋 Medium (Next Sprint)
7. `src/pages/Daily.jsx` - Add pagination, ~1 hour
8. `src/hooks/useChatDataLoaders.js` - Implement caching, ~2 hours
9. Database indices missing - ~30 min SQL

---

## 💡 COLUMN SET REFERENCE

**Current Defined Sets** (from `src/utils/townColumnSets.js`):
```javascript
COLUMN_SETS = {
  minimal: 'id, name, country, region',
  basic: 'id, name, country, region, quality_of_life, image_url_1, description',
  climate: '...8 climate columns...',
  cost: '...9 cost columns...',
  lifestyle: '...8 community columns...',
  infrastructure: '...11 service columns...',
  scoring: 'id, name, quality_of_life, healthcare_score, safety_score, cost_index',
  fullDetail: '...38 columns...'
}
```

**Use these. Don't invent new ones. Don't use SELECT ***

---

## 🔧 QUICK FIXES (Do These First)

### Fix 1: Add Missing Database Index (1 min)
```sql
CREATE INDEX idx_chat_threads_town_id ON chat_threads(town_id);
```

### Fix 2: Parallel Queries Template (Copy/Paste)
```javascript
// Replace sequential awaits with:
const [result1, result2] = await Promise.all([
  supabase.from('table1').select(...),
  supabase.from('table2').select(...)
]);
```

### Fix 3: Use RPC for Aggregation
```javascript
// Instead of loading 1000 records to count:
const { data } = await supabase.rpc('aggregate_function_name', {
  param1: value1,
  param2: value2
});
```

---

## 📈 PERFORMANCE BUDGET

**Per Page Load Goals**:
- Homepage: < 3 database requests
- Chat: < 5 database requests (not counting real-time subscriptions)
- Town Comparison: < 2 database requests
- Daily Page: < 4 database requests

**Current**: Most pages are 1.5-2x over budget due to duplicate queries

---

## 🎯 IMPLEMENTATION ORDER

**Week 1 - Eliminate Duplicates (3-4 hours)**
1. Fix town lookup duplicates
2. Consolidate chat subscriptions
3. Replace PaywallManager SELECT *

**Week 2 - Optimize Queries (2-3 hours)**
4. Add pagination to town/country loads
5. Convert sequential→parallel queries
6. Standardize COLUMN_SETS usage

**Week 3 - Polish (2-3 hours)**
7. Add React Query caching layer
8. Implement message pagination
9. Add performance monitoring

---

## 🚨 PREVENT REGRESSIONS

Add this to code reviews:
- "Does this query use COLUMN_SETS or specify columns?"
- "Could this use `.in()` instead of loop?"
- "Are related queries parallelized?"
- "Is pagination applied?"
- "Any N+1 patterns?"

---

## 📊 ESTIMATED GAINS

| Fix | Impact | Time |
|---|---|---|
| Eliminate duplicates | -30% API calls | 1 hour |
| Consolidate subscriptions | -66% unread updates | 1 hour |
| Fix SELECT * | -90% admin payload | 30 min |
| Add pagination | -60% initial load | 1 hour |
| Parallel queries | -25% load time | 1 hour |
| COLUMN_SETS consistency | -40% avg payload | 2 hours |
| **TOTAL** | **~50-60% improvement** | **~6.5 hours** |

---

## ✅ DONE RIGHT (Examples to Copy)

**Good - Friends loading with batch RPC**:
```javascript
// src/hooks/useChatDataLoaders.js L32-34
const { data: friendsData } = await supabase.rpc('get_users_by_ids', {
  p_user_ids: friendIds
});
```

**Good - COLUMN_SETS usage pattern**:
```javascript
// src/utils/townColumnSets.js
import { COLUMN_SETS } from './townColumnSets'
const { data } = await supabase
  .from('towns')
  .select(COLUMN_SETS.basic)  // ← Use this!
```

**Good - Parallel loading**:
```javascript
// src/hooks/useChatDataLoader.js L73
const [...results] = await Promise.all([
  query1,
  query2,
  query3
]);
```

---

## ❌ DONE WRONG (What NOT To Do)

**Bad - SELECT * with unions**:
```javascript
const { data } = await supabase
  .from('favorites')
  .select(`*, towns:town_id(*)`)  // ← Avoid! Use COLUMN_SETS instead
```

**Bad - Sequential queries**:
```javascript
const sent = await supabase.from(...).select(...);
const received = await supabase.from(...).select(...);  // ← Wait, parallelizable!
```

**Bad - N+1 in subscriptions**:
```javascript
.on('INSERT', () => {
  loadUnreadCounts(threads);  // ← Called per message!
})
```

---

**Last Updated**: October 20, 2025
**Full Report**: `docs/technical/DATABASE_QUERY_OPTIMIZATION.md`
**Status**: Ready for implementation

