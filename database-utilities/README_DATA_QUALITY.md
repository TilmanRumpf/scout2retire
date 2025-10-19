# Data Quality Investigation Tools

## Quick Start

### View priority towns needing cultural data
```bash
node database-utilities/get-priority-towns-for-cultural-data.js 20
```

### Run full data quality investigation
```bash
node database-utilities/investigate-data-quality.js
```

### Generate comprehensive fix report
```bash
node database-utilities/fix-data-quality-issues.js
```

## Available Scripts

### 1. `get-priority-towns-for-cultural-data.js`
**Purpose:** Shows towns missing cultural data, sorted by priority

**Usage:**
```bash
node database-utilities/get-priority-towns-for-cultural-data.js [limit]
# Example: Get top 50 priority towns
node database-utilities/get-priority-towns-for-cultural-data.js 50
```

**Output:**
- Town name, country, region
- Priority score (healthcare + safety)
- Missing field values
- Direct link to admin UI for editing

### 2. `investigate-data-quality.js`
**Purpose:** Analyzes field distributions and identifies issues

**Output:**
- NULL value percentages
- Unexpected categorical values
- Field existence checks
- Sample data

### 3. `fix-data-quality-issues.js`
**Purpose:** Generates comprehensive data quality report

**Output:**
- `DATA_QUALITY_REPORT.json` - Full JSON report
- Priority towns list (top 50)
- Recommendations by priority level
- Country-level distribution of NULL values

## Reports

### DATA_QUALITY_REPORT.json
Full machine-readable report containing:
- Summary statistics for all fields
- Top 50 priority towns with scores
- Recommendations with priority levels
- Country-level breakdowns of NULL values

### DATA_QUALITY_INVESTIGATION_SUMMARY.md
Human-readable summary including:
- Executive summary of findings
- Detailed analysis of each issue
- Resolution steps taken
- Next steps and recommendations

## Issues Resolved

### 1. english_proficiency_level "native" value ✅
- **Issue:** Database had 85 towns with "native" value not in UI dropdown
- **Resolution:** Updated CulturePanel.jsx dropdown to include all valid values
- **Values:** low, moderate, high, very high, widespread, native

### 2. Missing database fields ✅
- **Issue:** UI referenced non-existent fields (overall_culture_score, local_festivals)
- **Resolution:** Removed these fields from CulturePanel.jsx
- **Note:** These fields never existed in current database schema

### 3. High NULL percentages ⚠️ REQUIRES MANUAL WORK
- **Issue:** 77-84% of towns missing cultural data
- **Fields:** social_atmosphere, traditional_progressive_lean, cultural_events_frequency
- **Resolution:** Use `get-priority-towns-for-cultural-data.js` to see priority list
- **Action Required:** Manual research and data entry for top 50 towns

## Valid Categorical Values

### english_proficiency_level
- low
- moderate
- high
- very high
- widespread
- native

### social_atmosphere
- reserved
- quiet
- moderate
- friendly
- vibrant
- very friendly

### traditional_progressive_lean
- traditional
- moderate
- balanced
- progressive

### cultural_events_frequency
- rare
- occasional
- monthly
- frequent
- weekly
- constant
- daily

**Source:** `/src/utils/validation/categoricalValues.js`

## Next Steps

1. **Immediate:** Fill cultural data for top 20 high-priority towns (~2-3 hours)
2. **Short-term:** Complete top 50 priority towns (~5-8 hours total)
3. **Long-term:** Consider batch import tool for remaining 220+ towns

## Files Modified

### Code Changes
- `src/components/admin/CulturePanel.jsx` - Updated dropdowns, removed non-existent fields
- `src/utils/validation/categoricalValues.js` - Added 'widespread' to english_proficiency_level

### Investigation Tools
- `database-utilities/investigate-data-quality.js` - Field analysis tool
- `database-utilities/fix-data-quality-issues.js` - Report generator
- `database-utilities/get-priority-towns-for-cultural-data.js` - Priority towns viewer

### Documentation
- `database-utilities/DATA_QUALITY_REPORT.json` - Full JSON report
- `database-utilities/DATA_QUALITY_INVESTIGATION_SUMMARY.md` - Human-readable summary
- `database-utilities/README_DATA_QUALITY.md` - This file

---

**Last Updated:** 2025-10-18
**Status:** 2/3 issues resolved programmatically, 1 requires manual data entry
