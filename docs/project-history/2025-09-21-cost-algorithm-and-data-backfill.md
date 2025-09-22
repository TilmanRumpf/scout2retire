# Cost Algorithm and Data Backfill Strategy Session
**Date:** September 21, 2025  
**Session Duration:** ~1 hour  
**Participants:** Tilman & Claude  
**Status:** 🔍 DISCOVERY PHASE - Need Strategy

## Session Summary

### What We Discovered

#### 1. Existing Cost Data Infrastructure
We found multiple scripts in `database-utilities/` that were previously used to populate cost data:
- `fill-cost-of-living.js` - Fills cost_of_living_usd field
- `fill-monthly-living-cost.js` - Calculates typical monthly living costs
- `fill-rent-data.js` - Populates rent_1bed field
- `fill-groceries-utilities.js` - Handles grocery and utility costs
- `calculate-cost-of-living.js` - Comprehensive calculation with multiple factors

#### 2. The Current Calculation Method
The existing system uses a **multiplier-based approach**:
```
Total Living Cost = Rent × Country-Specific Multiplier
```

**Country Multipliers Found:**
- High-cost countries (USA, Canada): 2.6-2.8x rent
- Medium-cost countries (France, Germany): 2.2-2.3x rent
- Low-cost countries (Thailand, Vietnam): 1.7-1.8x rent
- Island nations: +0.2-0.3x (import costs)

#### 3. Comprehensive Cost Components
From `calculate-cost-of-living.js`, we learned the system considers:
- **Base:** Rent (1-bedroom)
- **Transport:** $50-400/month (varies by country & city size)
- **Groceries/Utilities:** Country-specific
- **Healthcare:** Monthly healthcare costs
- **Entertainment:** Based on lifestyle ratings (restaurants, nightlife, cultural)
- **Personal/Household:** $100-250 based on country
- **Insurance:** Additional insurances beyond health
- **Rounding:** Always UP to nearest $50 (conservative approach)

#### 4. Data Fields in Towns Table
- `cost_of_living_usd` - Single monthly estimate
- `typical_monthly_living_cost` - Full living cost
- `rent_1bed` - One bedroom rent
- `cost_data` - JSON field with detailed breakdown
- `healthcare_cost_monthly` - Healthcare specific costs

### The Core Problem Identified

**We couldn't determine how many towns currently have cost data** because:
1. API key issues with direct Supabase queries
2. The claude-db-helper is hardcoded for Alicante debugging
3. System reminders lying about process status (unrelated but annoying)

However, based on the existence of multiple "fill" scripts, it's clear that:
- Cost data was incomplete at some point
- Multiple attempts were made to backfill
- Different approaches were tried (hence multiple scripts)

### Key Insights

1. **Consistency is Critical**: Any new cost data MUST use the same methodology as existing data for true comparability
2. **Source Alignment**: We need to identify the original data sources to maintain consistency
3. **The Multiplier Method Works**: It's simple, scalable, and country-appropriate
4. **Conservative Estimates**: Always rounding UP protects users from underestimating costs

## Action Items for Next Session

### 🔴 HIGH PRIORITY - Data Audit

1. **Determine Current Coverage**
   - [ ] Get actual counts of towns with each cost field filled
   - [ ] Identify which towns are missing cost data
   - [ ] Check if cost_data JSON is consistently structured

2. **Analyze Data Quality**
   - [ ] Sample 10 towns with cost data - verify multipliers make sense
   - [ ] Check if island nations have appropriate premiums
   - [ ] Verify USA towns have higher transport costs

3. **Identify Data Sources**
   - [ ] Find where original rent data came from
   - [ ] Determine healthcare cost sources
   - [ ] Document grocery/utility data origins

### 🟡 MEDIUM PRIORITY - Strategy Development

4. **Standardize the Algorithm**
   - [ ] Document the EXACT formula for each component
   - [ ] Create decision tree for country/city classifications
   - [ ] Define when to use which multiplier

5. **Create Data Validation Rules**
   - [ ] Minimum/maximum ranges per country
   - [ ] Sanity checks (e.g., Thailand shouldn't cost more than Switzerland)
   - [ ] Consistency checks between related fields

6. **Plan the Backfill**
   - [ ] Prioritize which towns need data most urgently
   - [ ] Decide on data sources for missing information
   - [ ] Create rollback strategy if data looks wrong

### 🟢 IMPLEMENTATION PREP

7. **Consolidate Scripts**
   - [ ] Merge the 5+ cost scripts into ONE authoritative script
   - [ ] Add proper logging and error handling
   - [ ] Include validation and sanity checks

8. **Create Documentation**
   - [ ] Write clear explanation of cost algorithm
   - [ ] Document all data sources used
   - [ ] Create examples showing calculations

9. **Testing Strategy**
   - [ ] Select 5 towns we KNOW well for validation
   - [ ] Compare our estimates with actual expat reports
   - [ ] Adjust multipliers if needed

## Questions to Answer Next Session

### Critical Questions
1. **What percentage of towns currently have cost data?**
2. **Are the existing cost calculations accurate?** (Spot check 5-10 towns)
3. **What data sources are available for missing towns?**
4. **Should we use APIs (expensive) or estimation (less accurate)?**

### Strategic Questions
1. **Should cost_data JSON be the source of truth?** (vs individual fields)
2. **How do we handle seasonal variations?** (tourist towns)
3. **Should we differentiate urban vs rural within countries?**
4. **How often should cost data be updated?**

### Technical Questions
1. **Why are there so many separate fill scripts?**
2. **Is the multiplier approach sufficient or do we need more granular calculations?**
3. **Should we store cost confidence scores?**

## Proposed Approach for Normalization

### Phase 1: Audit & Understand (Next Session)
- Map current data coverage
- Validate existing calculations
- Document all assumptions

### Phase 2: Standardize & Document
- Create ONE authoritative cost algorithm
- Write comprehensive documentation
- Build validation rules

### Phase 3: Backfill Missing Data
- Use consistent methodology
- Apply same data sources
- Validate against known costs

### Phase 4: Quality Assurance
- Cross-check with external sources
- User feedback on accuracy
- Adjust multipliers as needed

## Session Frustrations to Address

1. **Tool Limitations**: Can't query database easily without proper helper
2. **Misleading System Status**: Background processes showing as "running" when dead
3. **claude-db-helper**: Hardcoded for Alicante, needs generalization

## Success Criteria

We'll know we've succeeded when:
- ✅ 100% of towns have cost data
- ✅ All costs use same methodology
- ✅ Users report costs as "accurate" (>80% satisfaction)
- ✅ Cost differences between towns make logical sense
- ✅ One consolidated script handles all cost calculations

## Next Session Preparation

Before next session, we need:
1. Working database query tool (fix claude-db-helper or create new one)
2. List of 5 towns to use as validation benchmarks
3. Access to any external cost APIs we might use

## Key Takeaway

**The infrastructure exists but needs consolidation and completion.** We have good algorithms and approaches scattered across multiple scripts. The challenge is not inventing a new system but rather:
1. Understanding what was already built
2. Consolidating the best parts
3. Completing the missing data
4. Ensuring consistency across all towns

The multiplier approach is solid and should be retained, but we need to ensure all towns use the same methodology for true comparability.