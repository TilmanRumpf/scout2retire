# Budget & Costs Matching Algorithm (20% of total score)
**Date: August 25, 2025**

## Overview
The budget matching algorithm evaluates financial compatibility using ratio-based scoring that compares user budgets to actual town costs across multiple expense categories, with additional consideration for tax implications and property investment potential.

## Database Fields Referenced

### User Preferences Table
- `total_monthly_budget` (Number): Total monthly budget in USD
- `max_monthly_rent` (Number): Maximum rent budget in USD
- `max_home_price` (Number): Maximum home purchase price in USD
- `monthly_healthcare_budget` (Number): Healthcare budget in USD
- `income_tax_sensitive` (Boolean): Sensitivity to income tax
- `property_tax_sensitive` (Boolean): Sensitivity to property tax
- `sales_tax_sensitive` (Boolean): Sensitivity to sales tax
- `tax_preference` (Array): Tax optimization preferences ["minimize", "optimize", "not_concerned"]
- `lifestyle_importance.shopping` (Number): Shopping importance (1-5)

### Towns Table
- `cost_of_living_usd` (Number): Monthly cost of living ($536-$4,500)
- `cost_index` (Number): Cost index (20-90, lower is cheaper)
- `rent_1bed` (Number): 1-bedroom apartment rent ($240-$2,800)
- `rent_2bed_usd` (Number): 2-bedroom apartment rent ($300-$3,500)
- `rent_house_usd` (Number): House rental cost ($400-$5,000)
- `purchase_apartment_sqm_usd` (Number): Price per sqm ($800-$12,000)
- `purchase_house_avg_usd` (Number): Average house price ($75,000-$1,500,000)
- `typical_home_price` (Number): Typical home price ($50,000-$1,200,000)
- `typical_rent_1bed` (Number): Typical 1-bed rent ($200-$2,500)
- `typical_monthly_living_cost` (Number): Typical monthly expenses ($400-$4,000)
- `groceries_cost` (Number): Monthly groceries ($100-$600)
- `meal_cost` (Number): Average restaurant meal ($5-$50)
- `utilities_cost` (Number): Monthly utilities ($50-$350)
- `healthcare_cost` (Number): Basic healthcare cost ($10-$400)
- `healthcare_cost_monthly` (Number): Monthly healthcare ($20-$500)
- `income_tax_rate_pct` (Number): Income tax rate (0-55%)
- `property_tax_rate_pct` (Number): Property tax rate (0-10%)
- `sales_tax_rate_pct` (Number): Sales tax rate (0-25%)
- `property_appreciation_rate_pct` (Number): Annual appreciation (-5% to 15%)
- `private_healthcare_cost_index` (Number): Private healthcare index (20-90)

## Scoring Breakdown (100 points total)

### 1. Overall Cost of Living Match (30 points)
```javascript
// Field references: user_preferences.total_monthly_budget vs towns.cost_of_living_usd
```

**Ratio-Based Scoring Method:**
```javascript
const userBudget = preferences.total_monthly_budget || 3000;
const townCost = town.cost_of_living_usd || town.typical_monthly_living_cost || 1500;

const costRatio = townCost / userBudget;

if (costRatio <= 0.5) {
  // Town costs 50% or less of budget
  score = 30; // Perfect - lots of cushion
} else if (costRatio <= 0.7) {
  // Town costs 70% or less
  score = 28; // Excellent - comfortable margin
} else if (costRatio <= 0.85) {
  // Town costs 85% or less
  score = 25; // Good - reasonable margin
} else if (costRatio <= 1.0) {
  // Town costs up to 100% of budget
  score = 20; // Adequate - tight but doable
} else if (costRatio <= 1.15) {
  // Town costs up to 115% of budget
  score = 12; // Stretched - need adjustments
} else if (costRatio <= 1.3) {
  // Town costs up to 130% of budget
  score = 5; // Difficult - major compromises
} else {
  // Town costs over 130% of budget
  score = 0; // Unaffordable
}
```

**Fallback Calculations:**
```javascript
// If cost_of_living_usd missing, calculate from components
if (!town.cost_of_living_usd) {
  estimated_cost = (
    (town.rent_1bed || 500) +
    (town.groceries_cost || 200) +
    (town.utilities_cost || 100) +
    (town.healthcare_cost_monthly || 50) +
    300 // Miscellaneous expenses estimate
  );
}
```

### 2. Housing Affordability Match (25 points)

#### Rental Scenario:
```javascript
// Field references: user_preferences.max_monthly_rent vs towns.rent_1bed, rent_2bed_usd
```

**Rental Scoring:**
```javascript
const maxRent = preferences.max_monthly_rent || 1000;
const townRent = town.rent_1bed || town.typical_rent_1bed || 600;

const rentRatio = townRent / maxRent;

if (rentRatio <= 0.6) {
  score = 25; // Well under budget
} else if (rentRatio <= 0.8) {
  score = 22; // Comfortably affordable
} else if (rentRatio <= 1.0) {
  score = 18; // At budget limit
} else if (rentRatio <= 1.2) {
  score = 10; // Over budget
} else {
  score = 3; // Significantly over
}
```

#### Purchase Scenario:
```javascript
// Field references: user_preferences.max_home_price vs towns.purchase_house_avg_usd
```

**Purchase Scoring:**
```javascript
const maxPrice = preferences.max_home_price || 300000;
const townPrice = town.purchase_house_avg_usd || town.typical_home_price || 200000;

const priceRatio = townPrice / maxPrice;

if (priceRatio <= 0.5) {
  score = 25; // Excellent value
} else if (priceRatio <= 0.75) {
  score = 22; // Good value
} else if (priceRatio <= 1.0) {
  score = 18; // At budget
} else if (priceRatio <= 1.25) {
  score = 10; // Stretched
} else {
  score = 3; // Unaffordable
}

// Property appreciation bonus
if (town.property_appreciation_rate_pct > 5) {
  score += 3; // Good investment potential
}
```

### 3. Tax Burden Assessment (20 points)
```javascript
// Field references: user tax sensitivities vs towns tax rates
```

**Tax Scoring Components:**

#### Income Tax (8 points):
```javascript
if (preferences.income_tax_sensitive) {
  const incomeTax = town.income_tax_rate_pct || 20;
  
  if (incomeTax === 0) {
    incomeScore = 8; // No income tax
  } else if (incomeTax <= 10) {
    incomeScore = 7; // Very low
  } else if (incomeTax <= 20) {
    incomeScore = 5; // Low
  } else if (incomeTax <= 30) {
    incomeScore = 3; // Moderate
  } else if (incomeTax <= 40) {
    incomeScore = 1; // High
  } else {
    incomeScore = 0; // Very high
  }
} else {
  incomeScore = 8; // Not sensitive
}
```

#### Property Tax (6 points):
```javascript
if (preferences.property_tax_sensitive) {
  const propertyTax = town.property_tax_rate_pct || 1;
  
  if (propertyTax <= 0.5) {
    propertyScore = 6; // Very low
  } else if (propertyTax <= 1.0) {
    propertyScore = 5; // Low
  } else if (propertyTax <= 2.0) {
    propertyScore = 4; // Moderate
  } else if (propertyTax <= 3.0) {
    propertyScore = 2; // High
  } else {
    propertyScore = 0; // Very high
  }
} else {
  propertyScore = 6; // Not sensitive
}
```

#### Sales Tax (6 points):
```javascript
if (preferences.sales_tax_sensitive) {
  const salesTax = town.sales_tax_rate_pct || 10;
  
  if (salesTax === 0) {
    salesScore = 6; // No sales tax
  } else if (salesTax <= 5) {
    salesScore = 5; // Very low
  } else if (salesTax <= 10) {
    salesScore = 4; // Low
  } else if (salesTax <= 15) {
    salesScore = 2; // Moderate
  } else if (salesTax <= 20) {
    salesScore = 1; // High
  } else {
    salesScore = 0; // Very high
  }
} else {
  salesScore = 6; // Not sensitive
}
```

### 4. Healthcare Costs Match (10 points)
```javascript
// Field references: user_preferences.monthly_healthcare_budget vs towns.healthcare_cost_monthly
```

**Healthcare Cost Scoring:**
```javascript
const healthBudget = preferences.monthly_healthcare_budget || 200;
const healthCost = town.healthcare_cost_monthly || town.healthcare_cost || 100;

const healthRatio = healthCost / healthBudget;

if (healthRatio <= 0.5) {
  score = 10; // Well under budget
} else if (healthRatio <= 0.75) {
  score = 8; // Affordable
} else if (healthRatio <= 1.0) {
  score = 6; // At budget
} else if (healthRatio <= 1.25) {
  score = 3; // Over budget
} else {
  score = 0; // Significantly over
}

// Private healthcare consideration
if (town.private_healthcare_cost_index) {
  if (private_healthcare_cost_index <= 40) {
    score += 2; // Very affordable private option
  }
}
```

### 5. Daily Expenses Assessment (10 points)
```javascript
// Field references: towns.groceries_cost, meal_cost, utilities_cost
```

**Component Scoring:**

#### Groceries (4 points):
```javascript
const groceries = town.groceries_cost || 200;
if (groceries <= 150) score = 4; // Very cheap
else if (groceries <= 250) score = 3; // Affordable
else if (groceries <= 350) score = 2; // Moderate
else if (groceries <= 450) score = 1; // Expensive
else score = 0; // Very expensive
```

#### Dining Out (3 points):
```javascript
const mealCost = town.meal_cost || 15;
if (mealCost <= 10) score = 3; // Very affordable
else if (mealCost <= 20) score = 2; // Reasonable
else if (mealCost <= 30) score = 1; // Expensive
else score = 0; // Very expensive
```

#### Utilities (3 points):
```javascript
const utilities = town.utilities_cost || 100;
if (utilities <= 75) score = 3; // Very low
else if (utilities <= 150) score = 2; // Reasonable
else if (utilities <= 250) score = 1; // High
else score = 0; // Very high
```

### 6. Cost Index Validation (5 points)
```javascript
// Field reference: towns.cost_index
```

**Index-Based Scoring:**
```javascript
const costIndex = town.cost_index || 50;

if (costIndex <= 30) {
  score = 5; // Very low cost
} else if (costIndex <= 45) {
  score = 4; // Low cost
} else if (costIndex <= 60) {
  score = 3; // Moderate cost
} else if (costIndex <= 75) {
  score = 1; // High cost
} else {
  score = 0; // Very high cost
}
```

## Special Cases and Fallbacks

### No Budget = Flexible Scoring
```javascript
if (!preferences.total_monthly_budget) {
  // User hasn't specified budget - use cost index only
  if (town.cost_index <= 50) {
    return 100; // Affordable locations get full score
  } else {
    return 100 - town.cost_index; // Gradual reduction
  }
}
```

### Tax Haven Benefits
```javascript
if (town.tax_haven_status && preferences.tax_preference?.includes('minimize')) {
  bonusPoints += 10; // Significant tax advantages
}

if (town.foreign_income_taxed === false) {
  bonusPoints += 5; // Foreign income exemption
}

if (town.tax_treaty_us && preferences.primary_citizenship === 'USA') {
  bonusPoints += 3; // Treaty benefits
}
```

### Currency Considerations
```javascript
// All costs normalized to USD in database
// Future: Add currency volatility risk scoring
```

### Investment Potential
```javascript
if (preferences.max_home_price && town.property_appreciation_rate_pct > 0) {
  // Calculate 10-year appreciation
  const futureValue = townPrice * Math.pow(1 + appreciation/100, 10);
  const potentialGain = futureValue - townPrice;
  
  if (potentialGain > townPrice * 0.5) {
    investmentScore = 5; // Excellent growth potential
  }
}
```

## Algorithm Priority Order

1. **Overall cost of living** (30% - highest)
   - Most comprehensive affordability measure
   
2. **Housing costs** (25%)
   - Largest single expense category
   
3. **Tax burden** (20%)
   - Significant long-term impact
   
4. **Healthcare costs** (10%)
   - Critical for retirees
   
5. **Daily expenses** (10%)
   - Quality of life factors
   
6. **Cost index** (5%)
   - Overall validation metric

## Integration with Other Systems

### Lifestyle Correlation
```javascript
// Shopping importance affects daily expense weighting
if (preferences.lifestyle_importance?.shopping >= 4) {
  // User values shopping - weight retail costs higher
  shoppingCostWeight = 1.5;
}
```

### Healthcare Budget Sync
- Healthcare costs counted in both Admin and Budget algorithms
- Ensures comprehensive healthcare affordability assessment

### Quality vs Cost Tradeoff
- High-cost towns may score well if quality justifies expense
- Algorithm notes value proposition in insights

## Recent Improvements (August 2025)

1. **Ratio-Based Scoring**
   - Moved from absolute to relative comparisons
   - Fairer for different budget levels

2. **Component Fallbacks**
   - Estimate total costs from available components
   - Reduces impact of missing aggregate data

3. **Tax Sensitivity Recognition**
   - Only penalizes high taxes if user sensitive
   - Personalized tax impact assessment

## Performance Considerations

- Cost fields indexed for range queries
- Tax rates stored as integers (percentage * 100)
- Pre-calculated cost aggregates where possible

## Validation Rules

1. All costs must be positive numbers
2. Tax rates must be 0-100%
3. Cost index must be 0-100
4. Property appreciation can be negative (depreciation)
5. All currency values in USD

## Data Coverage Statistics

- Towns with cost of living data: ~320/341 (94%)
- Towns with housing costs: ~310/341 (91%)
- Towns with tax data: ~290/341 (85%)
- Towns with complete budget data: ~280/341 (82%)

## Cost Ranges by Category (August 2025)

### Monthly Living Costs:
- **Very Low**: <$1,000 (Rural Asia, Eastern Europe)
- **Low**: $1,000-$1,500 (Small European towns)
- **Moderate**: $1,500-$2,500 (Mid-size cities)
- **High**: $2,500-$3,500 (Major cities)
- **Very High**: >$3,500 (Premium locations)

### Housing Costs (1-bedroom):
- **Very Low**: <$400 (Rural areas)
- **Low**: $400-$700 (Small towns)
- **Moderate**: $700-$1,200 (Cities)
- **High**: $1,200-$2,000 (Major cities)
- **Very High**: >$2,000 (Premium markets)

### Property Prices:
- **Very Low**: <$100,000
- **Low**: $100,000-$200,000
- **Moderate**: $200,000-$400,000
- **High**: $400,000-$700,000
- **Very High**: >$700,000

## Future Enhancement Opportunities

1. **Dynamic Budget Allocation**
   - Adjust category weights based on spending patterns
   - Personalized expense profiling

2. **Inflation Adjustment**
   - Project future costs based on inflation rates
   - Long-term affordability modeling

3. **Currency Risk Assessment**
   - Exchange rate volatility impact
   - Hedging strategy recommendations

4. **Retirement Income Optimization**
   - Social Security maximization
   - Pension portability analysis
   - Investment income planning

5. **Hidden Cost Detection**
   - Import duties on household goods
   - Vehicle registration costs
   - Club membership requirements

6. **Seasonal Cost Variations**
   - High/low season pricing
   - Heating/cooling seasonal costs
   - Tourist season impact

---

*Algorithm Version: 2.1*  
*Last Major Update: August 24, 2025 (Ratio-based scoring)*  
*Database Fields Verified: August 25, 2025*  
*Budget Data Coverage: 82% complete*  
*All costs normalized to USD*