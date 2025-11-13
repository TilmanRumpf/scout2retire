# Sparse Fields Report - Data Quality Issues

**Generated:** 2025-11-13
**Purpose:** Track fields with incomplete data coverage for future population

---

## Critical Sparse Fields

### 1. social_atmosphere
**Coverage:** 80 / 352 towns (23%)
**Missing:** 272 towns (77%)

**Current Values:**
- friendly: 68 towns (85%)
- vibrant: 8 towns (10%)
- quiet: 4 towns (5%)

**Impact:**
- Matching algorithm gives partial credit (5 points) when NULL
- Users don't see social atmosphere in town details for 77% of towns
- Reduces match accuracy for culture scoring

**Priority:** Medium
**Action Required:** Populate remaining 272 towns with social_atmosphere values

**Recommended Population Method:**
1. AI research using town descriptions
2. Manual review for high-priority towns
3. User crowdsourcing (future feature)

---

## Other Sparse Fields to Investigate

### cultural_events_frequency
**Coverage:** 59 / 352 towns (17%)
**Missing:** 293 towns (83%)
**Priority:** High (user-facing field, affects matching)

### traditional_progressive_lean
**Coverage:** 80 / 352 towns (23%)
**Missing:** 272 towns (77%)
**Priority:** Medium (town characteristic, not user-facing)

### To Be Audited
- retirement_community_presence
- english_proficiency_level
- Other town characteristic fields

---

## Recommended Workflow

**Phase 1: Audit All Town Fields**
1. Run coverage report for all town fields
2. Identify critical user-facing fields
3. Prioritize based on matching algorithm impact

**Phase 2: Population Strategy**
1. High-priority: cultural_events_frequency, social_atmosphere
2. Medium-priority: retirement_community_presence
3. Low-priority: Nice-to-have descriptive fields

**Phase 3: Tooling**
1. Create AI population script for batch updates
2. Admin UI for manual review/override
3. Validation checks before saving

---

## Database Query for Coverage Report

```sql
-- Run this to check coverage for any field
SELECT
  COUNT(*) FILTER (WHERE field_name IS NOT NULL) as with_data,
  COUNT(*) FILTER (WHERE field_name IS NULL) as missing,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE field_name IS NOT NULL) / COUNT(*), 1) as coverage_pct
FROM towns;
```

**Last Updated:** 2025-11-13
**Next Review:** After categoricalValues.js audit complete
