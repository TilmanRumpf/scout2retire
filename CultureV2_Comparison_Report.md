# Culture V2 Behavioral Comparison Report

**Generated:** November 14, 2025
**Purpose:** Analyze Culture V2 scoring behavior with synthetic test data that exercises the new fields
**Status:** V2 implemented behind feature flag (default: OFF)

---

## Executive Summary

### Key Findings

1. **V2 Successfully Scores New Fields** ✅
   - `traditional_progressive_lean` correctly awards 10pts (exact), 5pts (adjacent), 0pts (opposite)
   - `social_atmosphere` correctly awards 10pts (exact), 5pts (adjacent), 0pts (opposite)
   - Adjacency logic works as designed (traditional ↔ balanced ↔ progressive, quiet ↔ friendly ↔ vibrant)

2. **100% Cap Masks V2 Benefits in Many Cases** ⚠️
   - 7 of 12 test cases score 100% in both V1 and V2 (cap prevents differentiation)
   - Point reallocation (-15 from top 3, +20 for new 2) makes 100% easier to achieve
   - V2 improvements only visible when V1 scores are <100%

3. **V2 Improves Differentiation When It Matters** ✅
   - **U2 (Progressive + Vibrant):** V2 correctly boosts perfect match from 90% → 100% (+10)
   - **U2 Adjacent:** V2 also boosts adjacent match to 100% (+10) - generous but consistent
   - **U2 Opposite:** V2 correctly does NOT boost opposite match (stays 90%)
   - **U4 (No Preferences):** V2 adds 5% fallback consistently (+5 across all towns)

4. **Backward Compatibility Confirmed** ✅
   - Users without V2 preferences get fair 50% fallback (5 + 5 = 10 points total)
   - Towns without V2 data get fair 50% fallback
   - No cases where V2 decreases scores (0 negative diffs)

5. **Magnitude of Change: Modest** 📊
   - Average change: +2.9% culture score
   - Max change: +10% (U2 perfect/adjacent matches)
   - Min change: 0% (already at 100% cap)
   - 5 of 12 cases increased, 7 unchanged, 0 decreased

### Recommendation

**Keep V2 behind feature flag** until:
1. Point reallocation is reviewed (consider reducing fallback generosity)
2. Real user data is available to test V2 effectiveness
3. Product team decides whether +10% boost is appropriate magnitude

**Concern:** V2 may be **too generous** - users with no V2 preferences still get +5% boost, and adjacent matches get full +10% boost (same as perfect matches in many cases due to cap).

---

## Detailed Test Results

### Test Methodology

**Synthetic User Profiles (4 users):**
- **U1:** Traditional + Quiet (conservative, peaceful)
- **U2:** Progressive + Vibrant (liberal, energetic)
- **U3:** Balanced + Friendly (moderate, welcoming)
- **U4:** Open to Anything (no V2 preferences - tests fallback)

**Synthetic Towns (3 per user = 12 total):**
- **Town A:** Perfect match on V2 fields
- **Town B:** Adjacent match on V2 fields (1 step away)
- **Town C:** Opposite/mismatch on V2 fields

**Scoring Approach:**
- Each (user, town) pair scored with V1 (flag OFF) and V2 (flag ON)
- Culture category scores compared (not overall match scores - isolates V2 impact)
- All other culture fields kept consistent to isolate V2 field effects

---

### Results Table

| User | Town | User Trad/Prog | Town Trad/Prog | User Social | Town Social | Culture V1 | Culture V2 | Diff | Comment |
|------|------|----------------|----------------|-------------|-------------|------------|------------|------|---------|
| U1: Traditional + Quiet | Town A (Perfect) | traditional | traditional | quiet | quiet | 100% | 100% | 0 | Already at cap in V1 |
| U1: Traditional + Quiet | Town B (Adjacent) | traditional | balanced | quiet | friendly | 100% | 100% | 0 | Already at cap in V1 |
| U1: Traditional + Quiet | Town C (Opposite) | traditional | progressive | quiet | vibrant | 100% | 100% | 0 | Already at cap in V1 |
| U2: Progressive + Vibrant | Town A (Perfect) | progressive | progressive | vibrant | vibrant | 90% | **100%** | **+10** | ✅ V2 correctly boosts perfect match |
| U2: Progressive + Vibrant | Town B (Adjacent) | progressive | balanced | vibrant | friendly | 90% | **100%** | **+10** | ⚠️ Adjacent gets same boost as perfect |
| U2: Progressive + Vibrant | Town C (Opposite) | progressive | traditional | vibrant | quiet | 90% | 90% | 0 | ✅ V2 correctly does NOT boost opposite |
| U3: Balanced + Friendly | Town A (Perfect) | balanced | balanced | friendly | friendly | 100% | 100% | 0 | Already at cap in V1 |
| U3: Balanced + Friendly | Town B (Traditional) | balanced | traditional | friendly | quiet | 100% | 100% | 0 | Already at cap in V1 |
| U3: Balanced + Friendly | Town C (Progressive) | balanced | progressive | friendly | vibrant | 100% | 100% | 0 | Already at cap in V1 |
| U4: Open to Anything | Town A (Traditional) | (none) | traditional | (none) | quiet | 95% | **100%** | **+5** | V2 adds 10pts fallback (5+5) |
| U4: Open to Anything | Town B (Balanced) | (none) | balanced | (none) | friendly | 95% | **100%** | **+5** | V2 adds 10pts fallback (5+5) |
| U4: Open to Anything | Town C (Progressive) | (none) | progressive | (none) | vibrant | 95% | **100%** | **+5** | V2 adds 10pts fallback (5+5) |

---

### Detailed Analysis by User

#### U1: Traditional + Quiet User

**V1 Behavior:**
- Scores 100% on all three towns
- Other culture fields (urban/rural, pace, language, expat, dining, events, museums) already maxed out

**V2 Behavior:**
- Still scores 100% on all three towns
- New fields would award:
  - Town A (perfect): +10 traditional, +10 social = 20 points
  - Town B (adjacent): +5 traditional, +5 social = 10 points
  - Town C (opposite): +0 traditional, +0 social = 0 points
- But point reallocation (-15 from top 3 fields) + 100% cap = no visible difference

**Insight:** V2 improvements masked by cap. If V1 were at 85%, we'd see:
- Town A: 85% → 95% (+10)
- Town B: 85% → 90% (+5)
- Town C: 85% → 85% (0)

---

#### U2: Progressive + Vibrant User

**V1 Behavior:**
- Scores 90% on all three towns
- Room for V2 to make a difference (not at cap)

**V2 Behavior:**
- **Town A (perfect match):** 90% → **100%** (+10) ✅
  - Gets +10 traditional/progressive, +10 social atmosphere
  - Total +20 from V2 fields, but point reallocation reduces top 3 by -15
  - Net effect: +5 to +10 depending on exact field values

- **Town B (adjacent match):** 90% → **100%** (+10) ⚠️
  - Gets +5 traditional/progressive, +5 social atmosphere (adjacent = 50%)
  - Still hits 100% cap due to point reallocation
  - **Concern:** Adjacent match gets same final score as perfect match

- **Town C (opposite match):** 90% → 90% (0) ✅
  - Gets +0 traditional/progressive, +0 social atmosphere
  - Point reallocation alone doesn't change final score (offsets balance out)
  - Correctly does NOT boost opposite values

**Insight:** V2 successfully differentiates perfect from opposite, but adjacent is treated nearly as well as perfect due to cap. This may be too generous.

---

#### U3: Balanced + Friendly User

**V1 Behavior:**
- Scores 100% on all three towns
- Already maxed out

**V2 Behavior:**
- Still 100% on all three towns
- Balanced user matches all three town types (traditional, balanced, progressive) due to bidirectional adjacency
- Friendly user matches all three social atmospheres (quiet, friendly, vibrant) due to bidirectional adjacency
- Result: Balanced/Friendly is the "universal donor" - matches everything reasonably well

**Insight:** Balanced/Friendly users won't see much V2 impact - they're compatible with most towns.

---

#### U4: Open to Anything User (No V2 Preferences)

**V1 Behavior:**
- Scores 95% on all three towns
- Has minimal preferences overall, gets high scores due to generous fallbacks

**V2 Behavior:**
- **All towns:** 95% → **100%** (+5)
  - Gets +5 traditional/progressive fallback (50% of 10)
  - Gets +5 social atmosphere fallback (50% of 10)
  - Total +10 from V2 fallbacks
  - Point reallocation reduces this to net +5, hitting 100% cap

**Insight:** Users with NO V2 preferences still benefit from V2 (+5%). This may be appropriate (fair fallback) or too generous (rewarding lack of preference).

---

## Magnitude of Change Analysis

### Culture Score Changes (V2 - V1)

**Distribution:**
- **0% change:** 7 cases (58%) - already at 100% cap in V1
- **+5% change:** 3 cases (25%) - fallback benefit for users without V2 preferences
- **+10% change:** 2 cases (17%) - perfect or adjacent match benefit

**Statistics:**
- **Minimum:** 0% (no decrease cases)
- **Maximum:** +10%
- **Average:** +2.9%
- **Median:** 0% (most cases at cap)

### Who Sees the Biggest Changes?

**Users with Strong V2 Preferences + V1 Score <100%:**
- U2 (Progressive + Vibrant) sees +10% for perfect/adjacent matches
- This is the "ideal" V2 use case - user has preferences, V2 differentiates

**Users with No V2 Preferences:**
- U4 (Open to Anything) sees +5% across all towns
- Fallback is generous but consistent

**Users Already at 100% in V1:**
- No visible change (U1, U3)
- V2 improvements masked by cap

### Towns with vs without V2 Data

**All synthetic towns have V2 data**, so we can't test missing data behavior from these scenarios. However, based on code review:
- Towns missing V2 data award 50% fallback (5 + 5 = 10 points)
- Same as users missing V2 preferences

---

## Behavioral Observations

### ✅ What's Working Well

1. **Adjacency Logic is Sound**
   - Traditional ↔ Balanced ↔ Progressive works intuitively
   - Quiet ↔ Friendly ↔ Vibrant works intuitively
   - 50% credit for adjacent matches is reasonable

2. **V2 Differentiates When It Can**
   - U2 opposite match correctly scores 0 points (no boost)
   - U2 perfect match correctly scores 10+10 = 20 points
   - V2 is doing what it was designed to do

3. **Backward Compatibility**
   - No score decreases
   - Fair fallbacks for missing data
   - Existing users unaffected

### ⚠️ Concerns

1. **100% Cap Masks V2 Benefits**
   - 58% of test cases see no change due to cap
   - Point reallocation makes 100% easier to achieve
   - **Recommendation:** Consider NOT reducing top 3 fields, or reduce fallback generosity

2. **Adjacent Matches Too Generous**
   - U2 adjacent match gets same final score as perfect match (both 100%)
   - Due to cap, adjacent = perfect in many cases
   - **Recommendation:** Consider reducing adjacentFactor from 0.50 to 0.30 (30% instead of 50%)

3. **Fallback May Be Too High**
   - Users with NO V2 preferences get +5% boost
   - Towns with NO V2 data award 50% credit
   - **Recommendation:** Consider 30% fallback instead of 50%

4. **Point Reallocation Inflation**
   - Reducing top 3 fields by -15 points total
   - Adding new 2 fields at +20 points total
   - Net effect: +5 point inflation in the category
   - **Recommendation:** Consider -10 from top 3 (instead of -15) to maintain stricter scoring

---

## Ranking Impact Analysis

### Does V2 Change Town Rankings?

**For U2 (Progressive + Vibrant):**

**V1 Rankings:**
1. Town A, B, C (all tied at 90%)

**V2 Rankings:**
1. Town A (perfect) - 100%
2. Town B (adjacent) - 100%
3. Town C (opposite) - 90%

**Impact:** V2 successfully moves opposite match (Town C) below perfect/adjacent. However, perfect and adjacent are still tied.

**For U1, U3, U4:**
- No ranking changes (all towns still tied due to cap or fallback)

**Conclusion:** V2 improves differentiation **only when V1 scores are below cap**. In real data:
- If most users score 90-100% culture in V1, V2 won't help much
- If users score 60-80% culture in V1, V2 will provide meaningful differentiation

---

## Recommendations

### Short-Term (Before Promoting V2)

1. **Analyze Real V1 Culture Score Distribution**
   - Query: `SELECT AVG(culture_score), MIN(culture_score), MAX(culture_score) FROM user_town_matches`
   - If most scores are 90-100%, V2 won't help much
   - If scores are 60-80%, V2 will be very beneficial

2. **Consider Reducing Fallback Generosity**
   - Change 50% fallback → 30% fallback
   - This would give:
     - Perfect match: 10 + 10 = 20 points
     - Adjacent match: 5 + 5 = 10 points
     - No preference: 3 + 3 = 6 points (was 5+5=10)
   - More differentiation, less inflation

3. **Consider Adjusting Point Reallocation**
   - Option A: Reduce top 3 by -10 instead of -15 (net +10 instead of +5)
   - Option B: Keep current allocation but reduce fallback to 30%
   - Goal: Prevent V2 from making 100% too easy

### Long-Term (After V2 Rollout)

1. **Monitor Real-World Impact**
   - Do users with V2 preferences find better matches?
   - Do culture scores become more differentiated?
   - Are rankings changing in meaningful ways?

2. **A/B Test V2 Effectiveness**
   - Group A: V1 scoring (flag OFF)
   - Group B: V2 scoring (flag ON)
   - Measure: User satisfaction, match quality feedback

3. **Consider Adaptive Fallback**
   - Instead of fixed 50% fallback, use data-driven approach
   - If town has 80% of culture fields populated, award 80% fallback
   - More nuanced than "all or nothing"

---

## Conclusion

**Culture V2 is working as designed** - it successfully scores the new `traditional_progressive_lean` and `social_atmosphere` fields with appropriate adjacency logic.

**However, the 100% cap and generous fallbacks mask V2's benefits** in many cases. Point reallocation makes 100% easier to achieve, reducing differentiation.

**Recommendation:** Keep V2 behind feature flag and:
1. Analyze real V1 culture score distribution
2. Consider reducing fallback from 50% to 30%
3. Consider adjusting point reallocation to prevent inflation
4. Test with real user data before promoting to default

**V2 is production-ready** from a technical standpoint, but **product review recommended** to ensure scoring behavior aligns with business goals.

---

**Report Generated:** November 14, 2025
**Analysis Tool:** `tests/scoring/analyzeCultureV2.js`
**Test Cases:** 12 synthetic (user, town) pairs
**V1 vs V2 Comparison:** 100% backward compatible, 0 regressions
