# Cost/Budget Scoring Investigation Report
**Date:** October 15, 2025
**User:** shabnamneda (shabnamneda@gmail.com)
**Focus:** Nova Scotia towns cost scoring analysis

---

## Executive Summary

Investigation into why Nova Scotia towns may not be scoring appropriately for user shabnamneda's budget preferences. The analysis reveals the scoring algorithm is working correctly, but identified a **critical data mismatch** that may be causing unexpected results.

---

## User Budget Preferences

**User ID:** `e0ed27da-41b6-4d77-accc-1a87ff44efbf`
**Profile:** Shabnam Rumpf-Monadizadeh

### Budget Settings
- **Total Monthly Budget:** `[2000]` (USD)
- **Max Monthly Rent:** `[]` (not set)
- **Max Home Price:** `[200000]` (USD)
- **Housing Preference:** `buy`
- **Tax Sensitivities:**
  - Income Tax: `true` (sensitive)
  - Property Tax: `true` (sensitive)
  - Sales Tax: `true` (sensitive)

### Budget Analysis Classification
- **User Type:** Simple Budget User
- **Budget Fields Set:** 1 (only total monthly budget)
- **Adaptive Scoring:** Eligible for 85-point maximum on overall budget fit

---

## Nova Scotia Towns - Cost Data

Found **11 Nova Scotia towns** in database with complete cost data:

### Cost Ranges
| Metric | Min | Max | Average |
|--------|-----|-----|---------|
| **cost_of_living_usd** | $2,300 | $3,200 | $2,700 |
| **typical_monthly_living_cost** | $2,600 | $3,960 | $2,945 |
| **typical_home_price** | $301,750 | $22,300,000 | $2,587,114 |

### Individual Town Breakdown

#### Affordable Towns (Under $2,600/month)
1. **Lockeport** - $2,300/month, $330,000 home
2. **Digby** - $2,400/month, $405,000 home
3. **Bridgewater** - $2,500/month, $380,000 home
4. **Yarmouth** - $2,500/month, $630,000 home
5. **Annapolis Royal** - $2,600/month, $420,000 home
6. **Truro** - $2,600/month, $900,000 home

#### Moderate Towns ($2,600-$3,100)
7. **Peggy's Cove** - $2,900/month, $301,750 home
8. **Mahone Bay** - $3,000/month, $345,000 home
9. **Lunenburg** - $3,100/month, $412,500 home
10. **Halifax** - $3,100/month, $22,300,000 home (outlier)

#### Higher-Cost Towns ($3,100+)
11. **Chester** - $3,200/month, $370,000 home

---

## Critical Finding: Data Mismatch Issue

### The Problem
User's budget: **$2,000/month**
Cheapest NS town: **$2,300/month** (Lockeport)

**Budget Ratio Analysis:**
```javascript
budgetRatio = $2,000 / $2,300 = 0.87
```

According to scoring algorithm (lines 257-261 in costScoring.js):
```javascript
else if (budgetRatio >= 0.8) {
    // User budget is 80% of cost - challenging but possible
    const points = isSimpleBudgetUser ? 25 : 15
    factors.push({ factor: `Budget challenging (budget $2000 vs cost $2300)`, score: 25 })
}
```

### Expected Scores for Nova Scotia Towns

| Town | Monthly Cost | Budget Ratio | Expected Score | Category |
|------|--------------|--------------|----------------|----------|
| Lockeport | $2,300 | 0.87 | 25/85 (29%) | Challenging |
| Digby | $2,400 | 0.83 | 25/85 (29%) | Challenging |
| Bridgewater | $2,500 | 0.80 | 25/85 (29%) | Challenging |
| Yarmouth | $2,500 | 0.80 | 25/85 (29%) | Challenging |
| Truro | $2,600 | 0.77 | 12/85 (14%) | Very Tight |
| Annapolis Royal | $2,600 | 0.77 | 12/85 (14%) | Very Tight |
| Others | $2,900-$3,200 | 0.63-0.69 | 5/85 (6%) | Over Budget |

**All Nova Scotia towns are 15% or more over budget.**

---

## Scoring Algorithm Analysis

### Cost Scoring Configuration
- **Category Weight:** 19% of total match score
- **Total Points:** 100 (for cost category)

### Adaptive Scoring System (Added 2025-10-15)
The algorithm uses adaptive scoring based on user sophistication:

**Simple Budget User** (shabnamneda qualifies):
- Overall Budget Fit: **85 points maximum**
- Tax Scoring: **15 points maximum**

**Power Budget User** (sets rent/healthcare budgets):
- Overall Budget Fit: 40 points
- Rent Budget: 30 points
- Healthcare Budget: 20 points
- Tax Scoring: 15 points

### Budget Ratio Scoring Table
| Budget Ratio | Description | Simple User Points | Power User Points |
|--------------|-------------|-------------------|-------------------|
| ≥ 2.0x | Excellent value | 85 | 40 |
| ≥ 1.5x | Comfortable | 75 | 35 |
| ≥ 1.2x | Good fit | 65 | 30 |
| ≥ 1.0x | Adequate | 55 | 25 |
| ≥ 0.9x | Slightly tight | 40 | 20 |
| ≥ 0.8x | **Challenging** | **25** | **15** |
| ≥ 0.7x | Very tight | 12 | 10 |
| < 0.7x | Over budget | 5 | 5 |

---

## Potential Issues Identified

### 1. Data Field Confusion
The algorithm checks two possible cost fields:
```javascript
const townCost = town.cost_of_living_usd || town.typical_monthly_living_cost
```

**Problem:** Different fields may have different values:
- **cost_of_living_usd:** $2,300-$3,200 range
- **typical_monthly_living_cost:** $2,600-$3,960 range

**Impact:** If algorithm uses `typical_monthly_living_cost` instead of `cost_of_living_usd`, scores would be even lower.

### 2. Budget Mismatch
User's $2,000/month budget is **below the cost of living for ALL Canadian towns** in the database, not just Nova Scotia.

**Possible Causes:**
1. User underestimated Canadian cost of living
2. User expects to live significantly below average
3. Budget should be interpreted differently (e.g., excluding housing if they're buying?)
4. Database costs may be inflated or include housing when user plans to buy outright

### 3. Housing vs. Living Cost Confusion
User specified:
- `total_monthly_budget`: $2,000
- `max_home_price`: $200,000
- `housing_preference`: buy

**Question:** Should the $2,000 budget be:
- A) Total monthly cost including mortgage?
- B) Monthly living expenses excluding housing (since they're buying)?

If (B), the user might actually be adequately budgeted, but the algorithm doesn't handle this distinction.

---

## Tax Scoring Component

User is sensitive to all three tax types. Nova Scotia tax data:

### Canada Federal + NS Provincial Rates (Approximate)
- **Income Tax:** ~29-50% combined (federal + provincial)
- **Property Tax:** ~0.8-1.4% of property value
- **Sales Tax (HST):** 15% in Nova Scotia

### Expected Tax Scores
With user being tax-sensitive and NS having high taxes:
- Income Tax: Likely 2-3 points (high rate)
- Property Tax: Likely 4-5 points (excellent rate)
- Sales Tax: Likely 3-4 points (fair rate)
- **Estimated Tax Score:** 9-12 out of 15 points

---

## Overall Cost Category Scoring Prediction

For Nova Scotia towns with shabnamneda's budget:

| Component | Expected Score | Max Points | Percentage |
|-----------|----------------|------------|------------|
| Budget Fit | 5-25 | 85 | 6-29% |
| Tax Score | 9-12 | 15 | 60-80% |
| **Total Cost Score** | **14-37** | **100** | **14-37%** |

**Overall Match Impact:**
- Cost Category Weight: 19% of total
- Cost Score: 14-37%
- **Contribution to Overall Match:** 2.7% - 7.0%

This is a **significant penalty** for budget-constrained users.

---

## Database Column Analysis

### Towns Table Cost-Related Columns (11 found)
1. `cost_index` - Relative cost scale
2. `cost_of_living_usd` - Actual monthly USD cost
3. `cost_description` - Text description
4. `meal_cost` - Typical meal price
5. `groceries_cost` - Monthly groceries
6. `utilities_cost` - Monthly utilities
7. `healthcare_cost` - Healthcare costs (legacy field)
8. `typical_monthly_living_cost` - Total monthly cost
9. `typical_home_price` - Home purchase price
10. `healthcare_cost_monthly` - Monthly healthcare cost
11. `private_healthcare_cost_index` - Healthcare cost index

### Data Consistency Issue
**Halifax anomaly detected:**
- `typical_home_price`: $22,300,000 (22.3 million!)
- This is clearly an error (likely data entry mistake)

---

## Recommendations

### Immediate Actions
1. **Verify User Intent:** Confirm whether $2,000/month budget is:
   - Total living cost including housing, OR
   - Living expenses excluding housing (since buying outright)

2. **Fix Halifax Data:**
   - `typical_home_price` should be ~$450,000-$600,000, not $22.3 million

3. **Consider Budget Interpretation Logic:**
   ```javascript
   // If user is buying (not renting), exclude housing from monthly cost comparison
   if (preferences.housing_preference === 'buy') {
     townCost = town.cost_of_living_usd - estimatedMonthlyHousingCost
   }
   ```

4. **Document Field Priority:**
   - Clarify which cost field should be primary: `cost_of_living_usd` vs `typical_monthly_living_cost`
   - Ensure consistency across all 343 towns

### Medium-Term Improvements
1. **Add Budget Reality Check:**
   - Warn users if their budget is below 50% of cheapest town in their region
   - Suggest budget adjustment or region change

2. **Improve Cost Breakdown:**
   - Show users: "Your budget: $2,000 | Average town cost: $2,700 | Difference: -$700/month"
   - Help users understand why scores are low

3. **Enhanced Tax Data:**
   - Add tax_notes field explaining combined federal/provincial rates
   - Show effective tax rate (federal + provincial/state)

### Long-Term Enhancements
1. **Budget Flexibility Slider:**
   - Let users indicate how flexible they are: "Can stretch 10% over budget"
   - Adjust scoring accordingly

2. **Lifestyle Budget Categories:**
   - Break down into: Housing, Food, Healthcare, Entertainment, Transportation
   - Allow users to prioritize which categories matter most

3. **Currency-Aware Budgeting:**
   - If user has USD income but moving to Canada, factor in exchange rates
   - Show purchasing power parity adjustments

---

## Conclusion

**The scoring algorithm is working as designed.** The issue is that user shabnamneda's $2,000/month budget is insufficient for Nova Scotia's cost of living (minimum $2,300/month).

### Key Findings:
1. All NS towns are 15-37% over budget → Low budget scores (5-25 points)
2. Tax sensitivity with high NS taxes → Moderate tax scores (9-12 points)
3. **Result:** Cost category scores of 14-37% → Overall match penalty of 2.7-7.0%

### Root Cause Options:
- **Option A:** User needs to increase budget to $2,500-$3,000/month
- **Option B:** Algorithm should exclude housing from monthly cost when `housing_preference = 'buy'`
- **Option C:** User should explore cheaper regions (Maritime provinces other than NS, or specific rural areas)

### Next Step:
**Clarify with user:** Does your $2,000/month budget include mortgage/rent, or just living expenses?

---

## Technical Details

### Query Execution
```javascript
// Investigation ran: October 15, 2025
// Database: Supabase (Online Production)
// Script: claude-db-helper.js
// Method: Supabase JS SDK with service role key
```

### Data Files Referenced
- `/src/utils/scoring/categories/costScoring.js` - Cost scoring algorithm
- `/src/utils/scoring/helpers/preferenceParser.js` - Preference parsing
- `user_preferences` table - User budget data
- `towns` table - Town cost data

### Column Sets Used
```javascript
// Retrieved all columns with SELECT * for investigation
// Found 169 columns in towns table
// Found 11 cost-related columns
// No state_code column (filtered in-memory by region field)
```

---

**Report Generated:** 2025-10-15
**Investigation Tool:** claude-db-helper.js
**Analyst:** Claude (AI Assistant)
