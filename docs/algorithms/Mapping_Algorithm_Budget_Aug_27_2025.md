# Budget & Costs Algorithm (20% weight)
**Updated: August 27, 2025**

## Quick Reference
- **Overall Cost of Living**: 30 points
- **Housing Affordability**: 25 points
- **Tax Burden**: 20 points
- **Daily Expenses**: 15 points
- **Value Perception**: 10 points

## 1. Overall Cost of Living (30 points)

| Town Cost / User Budget | Points | Status |
|-------------------------|--------|--------|
| ≤50% | 30 | Perfect cushion |
| ≤70% | 28 | Comfortable |
| ≤85% | 25 | Good margin |
| ≤100% | 20 | Tight but doable |
| ≤115% | 12 | Stretched |
| ≤130% | 5 | Difficult |
| >130% | 0 | Unaffordable |

**Fallback if missing `cost_of_living_usd`:**
```javascript
estimated = rent_1bed + groceries + utilities + healthcare_monthly + 300
```

## 2. Housing Affordability (25 points)

### Rental Scoring
| Rent / Max Budget | Points |
|-------------------|--------|
| ≤60% | 25 |
| ≤80% | 22 |
| ≤100% | 18 |
| ≤120% | 10 |
| >120% | 3 |

### Purchase Scoring
| Price / Max Budget | Points |
|--------------------|--------|
| ≤50% | 25 |
| ≤75% | 22 |
| ≤100% | 18 |
| ≤125% | 10 |
| >125% | 3 |

**Bonus:** +3 if appreciation rate >5% (good investment)

## 3. Tax Burden (20 points)

### Income Tax (8 points)
| Rate | Sensitive Users | Not Sensitive |
|------|----------------|---------------|
| 0% | 8 | 8 |
| ≤10% | 7 | 8 |
| ≤20% | 5 | 8 |
| ≤30% | 3 | 8 |
| ≤40% | 1 | 8 |
| >40% | 0 | 8 |

### Property Tax (6 points)
| Rate | Sensitive | Not Sensitive |
|------|-----------|---------------|
| ≤0.5% | 6 | 6 |
| ≤1.0% | 5 | 6 |
| ≤2.0% | 4 | 6 |
| ≤3.0% | 2 | 6 |
| >3.0% | 0 | 6 |

### Sales Tax (6 points)
| Rate | Sensitive | Not Sensitive |
|------|-----------|---------------|
| ≤5% | 6 | 6 |
| ≤10% | 5 | 6 |
| ≤15% | 3 | 6 |
| ≤20% | 1 | 6 |
| >20% | 0 | 6 |

## 4. Daily Expenses (15 points)

```javascript
const dailyScore = 15 * (1 - (cost_index / 100));
// cost_index ranges 20-90, lower is cheaper
```

### Component Weights:
- Groceries: 40%
- Meals out: 30%
- Utilities: 30%

## 5. Value Perception (10 points)

Quality/Cost ratio assessment:
- High quality + low cost: 10 points
- High quality + moderate cost: 8 points
- Moderate quality + low cost: 7 points
- Moderate quality + moderate cost: 5 points
- Any quality + high cost: 2 points

## Data Fields Used
- `cost_of_living_usd`: Monthly living cost
- `rent_1bed`, `rent_2bed_usd`: Rental costs
- `purchase_house_avg_usd`: Home prices
- `income_tax_rate_pct`: Income tax
- `property_tax_rate_pct`: Property tax
- `sales_tax_rate_pct`: Sales tax
- `cost_index`: Overall cost index (20-90)
- `groceries_cost`, `meal_cost`, `utilities_cost`

## Key Implementation Notes
1. Use ratio-based scoring (cost/budget) not absolute values
2. No budget specified = assume $3000/month
3. Tax sensitivity is binary (check `income_tax_sensitive` flag)
4. Always provide fallback calculations for missing data

---
*Version 2.2 - Simplified*