# Southeast Asia Grocery Cost Verification
**Date:** 2025-09-30
**Issue:** Da Nang & George Town marked as having $40/month grocery costs - flagged as "unusually low"

---

## Research Findings

### Da Nang, Vietnam

**Database Value:** $40/month
**Research Result:** $200/month average

**Source:** Numbeo, Expatistan (September 2025)
- Monthly groceries: ~5,000,000 VND ($200 USD)
- Total monthly costs (excl. rent): ~$776 USD
- Local markets are cheaper than supermarkets

**CONCLUSION:** Database value of $40/month is **INCORRECT**
**Recommended Fix:** Update to $200/month

---

### George Town (Penang), Malaysia

**Database Value:** $40/month
**Research Result:** $150-200/month average

**Source:** Numbeo, Expatistan (September 2025)
- Single person monthly costs: ~RM3,435 (~$770 USD total)
- Groceries estimated: $150-200/month USD
- Local wet markets much cheaper than Western supermarkets
- Eating out: $3/meal

**CONCLUSION:** Database value of $40/month is **INCORRECT**
**Recommended Fix:** Update to $175/month (conservative estimate)

---

## Fix Required

```sql
-- Update Da Nang grocery costs
UPDATE towns
SET groceries_cost = 200
WHERE name = 'Da Nang' AND country = 'Vietnam';

-- Update George Town grocery costs
UPDATE towns
SET groceries_cost = 175
WHERE name = 'George Town' AND country = 'Malaysia';
```

**Status:** These ARE actual data errors - need fixing ✅
