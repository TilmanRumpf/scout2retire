# Data Quality Audit Runbook

Quick reference guide for running comprehensive data quality audits on the towns table.

---

## Quick Start

```bash
# Run all audits at once (recommended)
cd /Users/tilmanrumpf/Desktop/scout2retire
node database-utilities/comprehensive-data-audit.js
node database-utilities/detailed-data-audit.js
node database-utilities/specific-column-audit.js
node database-utilities/verify-coastal-distances.js
node database-utilities/generate-fix-script.js
```

---

## Individual Audit Scripts

### 1. Comprehensive Data Audit
**Purpose:** Statistical outlier detection using 3-sigma rule
**Runtime:** ~30-60 seconds
**Output:** Outliers in numeric columns

```bash
node database-utilities/comprehensive-data-audit.js
```

**Checks:**
- Outliers (>3 standard deviations from mean)
- Negative values in cost/distance columns
- Unrealistic percentages (<0 or >100)
- Suspiciously low costs (<$50 for rent/housing)
- Suspiciously high costs (>$10,000)

**Example Output:**
```
🔴 ERRORS: 0
🟡 WARNINGS: 22
🔵 INFO: 0

📍 Column: healthcare_score
   Type: OUTLIER
   1 outlier(s) detected (>3σ from mean=8.01, σ=0.65)
   Examples:
   - Bubaque: 3
```

---

### 2. Detailed Data Audit
**Purpose:** Format consistency, missing data, placeholders
**Runtime:** ~60-90 seconds
**Output:** Format issues, duplicate values, missing data rates

```bash
node database-utilities/detailed-data-audit.js
```

**Checks:**
- Unrealistic zero values
- Round numbers (possible estimates)
- Duplicate values (copy-paste errors)
- Missing data rates per column
- Categorical value consistency
- Text formatting issues
- Placeholder text (TODO, TBD, etc.)

**Example Output:**
```
🔴 ERRORS: 3
🟡 WARNINGS: 66
🔵 INFO: 101

▶ HIGH_MISSING_RATE (63 columns affected)
  📍 Column: image_url_2
     96.6% missing (340/352 towns)
```

---

### 3. Specific Column Audit
**Purpose:** Targeted checks on known problem areas
**Runtime:** ~30 seconds
**Output:** Specific data anomalies with town names

```bash
node database-utilities/specific-column-audit.js
```

**Checks:**
- Humidity = 30 (suspiciously low)
- Healthcare cost = $0 (unrealistic)
- Extremely high costs (>$4000/month)
- Very low healthcare scores (<5)
- Extreme populations (>5M)
- Very high sunshine (>3500 hrs/year)
- Very high rent (>$2000/month)
- Most common duplicate values
- Very high air pollution (AQI >100)
- Very high elevation (>2000m)
- Very far from ocean (>1000km)
- Unique categorical values (possible typos)

**Example Output:**
```
2. HEALTHCARE COST = $0 (Unrealistic)
Found 20 towns with $0 healthcare cost:
  - Charlottetown, Canada (score: 8)
  - Calgary, Canada (score: 9)
  ...
```

---

### 4. Coastal Distance Verification
**Purpose:** Validate distance_to_ocean_km accuracy
**Runtime:** ~15 seconds
**Output:** Geographic data inconsistencies

```bash
node database-utilities/verify-coastal-distances.js
```

**Checks:**
- Coastal towns with high ocean distance (>50km)
- Island towns far from ocean (>10km)
- Beach towns far from ocean (>5km)
- Coastal towns with NULL distance
- Non-coastal towns close to ocean (<10km)
- Distance statistics (min/max/avg)

**Example Output:**
```
1. COASTAL TOWNS WITH SUSPICIOUSLY HIGH OCEAN DISTANCE (>50km)
Found 0 coastal towns >50km from ocean:
```

---

### 5. Generate Fix Script
**Purpose:** Create SQL to fix identified issues
**Runtime:** ~20 seconds
**Output:** Ready-to-execute SQL statements

```bash
node database-utilities/generate-fix-script.js
```

**Generates:**
- Canadian healthcare cost fix
- Empty column drop script
- Duplicate value reviews
- Quality of life distribution analysis

**Example Output:**
```sql
-- Fix 1: Canadian Healthcare Cost (20 items)
UPDATE towns
SET healthcare_cost_monthly = 75, healthcare_cost = 75
WHERE country = 'Canada' AND healthcare_cost_monthly = 0;
```

---

## Complete Audit Workflow

### Step 1: Pre-Audit (5 minutes)
```bash
# Create database snapshot
node create-database-snapshot.js

# Verify dev server is running
lsof -ti:5173
```

### Step 2: Run All Audits (3 minutes)
```bash
# Save output for review
node database-utilities/comprehensive-data-audit.js > /tmp/audit-comprehensive.txt
node database-utilities/detailed-data-audit.js > /tmp/audit-detailed.txt
node database-utilities/specific-column-audit.js > /tmp/audit-specific.txt
node database-utilities/verify-coastal-distances.js > /tmp/audit-coastal.txt
node database-utilities/generate-fix-script.js > /tmp/audit-fixes.txt
```

### Step 3: Review Results (10 minutes)
```bash
# Check error counts
grep "ERRORS:" /tmp/audit-*.txt
grep "WARNINGS:" /tmp/audit-*.txt

# Review critical issues
cat /tmp/audit-fixes.txt
```

### Step 4: Execute Fixes (15 minutes)
```bash
# Review SQL fixes
cat database-utilities/data-quality-fixes.sql

# Execute in Supabase (or via MCP)
# Use Supabase MCP to execute: [SQL from data-quality-fixes.sql]
```

### Step 5: Verify Fixes (5 minutes)
```bash
# Re-run specific audit to verify
node database-utilities/specific-column-audit.js

# Check for remaining issues
grep "healthcare_cost_monthly = 0" /tmp/audit-specific.txt
```

---

## Monthly Audit Checklist

**First of the month:**
- [ ] Create database snapshot
- [ ] Run all 5 audit scripts
- [ ] Review error/warning counts vs. last month
- [ ] Identify new issues (weren't there last month)
- [ ] Generate fix script
- [ ] Review fixes with team
- [ ] Execute approved fixes
- [ ] Verify fixes worked
- [ ] Update audit documentation
- [ ] Schedule next month's audit

---

## Interpreting Results

### Severity Levels

**🔴 ERROR (Critical)**
- Must be fixed immediately
- Data is incorrect or placeholder text
- Examples: Healthcare cost = $0, placeholder text in production

**🟡 WARNING (Review Needed)**
- Should be investigated
- May or may not be actual errors
- Examples: Outliers, high missing data rates, suspiciously round numbers

**🔵 INFO (Awareness)**
- Not necessarily errors
- Good to know for context
- Examples: Duplicate values, categorical value distributions

### Common Patterns

**"X outlier(s) detected (>3σ)"**
- Statistical outlier, not necessarily wrong
- Review examples to determine if legitimate
- Example: Boulder at $4,830/month is expensive but accurate

**"X% missing (Y/Z towns)"**
- High missing rate, decide: populate or drop column
- 100% missing = drop column immediately
- >70% missing = review if worth keeping

**"Value X appears in Y towns (may be placeholder)"**
- Duplicate values may indicate templating
- Review each town individually
- Example: $2,793 in 30 US towns - possibly templated

---

## Troubleshooting

### Error: "supabaseKey is required"
**Fix:** Check .env file has `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Cannot find module"
**Fix:** Run `npm install` in project root

### Script hangs/times out
**Fix:** Reduce batch size or run audits individually

### "Too many connections"
**Fix:** Close other database connections, wait 30 seconds

---

## Files Location

| File | Purpose |
|------|---------|
| `/database-utilities/comprehensive-data-audit.js` | Statistical analysis |
| `/database-utilities/detailed-data-audit.js` | Format & consistency |
| `/database-utilities/specific-column-audit.js` | Problem area checks |
| `/database-utilities/verify-coastal-distances.js` | Geographic validation |
| `/database-utilities/generate-fix-script.js` | SQL fix generation |
| `/database-utilities/data-quality-fixes.sql` | Ready-to-execute fixes |
| `/docs/database/DATA_QUALITY_AUDIT_2025-10-19.md` | Full audit report |
| `/docs/database/DATA_QUALITY_SUMMARY.md` | Executive summary |

---

## Next Audit Scheduled

**Date:** November 19, 2025
**Focus Areas:**
- Quality of life rescoring results
- Cost value duplicates verification
- Population type classification

---

**Questions?** See full documentation in `/docs/database/`
