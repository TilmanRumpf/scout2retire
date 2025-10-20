# Database Documentation

Documentation for Scout2Retire's database structure, data quality, and maintenance procedures.

---

## 📋 Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[DATA_QUALITY_SUMMARY.md](DATA_QUALITY_SUMMARY.md)** | Executive summary of latest audit | Quick overview of data health |
| **[DATA_QUALITY_AUDIT_2025-10-19.md](DATA_QUALITY_AUDIT_2025-10-19.md)** | Full detailed audit report | Deep dive into specific issues |
| **[DATA_AUDIT_RUNBOOK.md](DATA_AUDIT_RUNBOOK.md)** | How to run audits | Monthly audit procedures |

---

## 🎯 Current Database Status (October 19, 2025)

### Overall Health: 🟢 Good (85%)

| Metric | Score | Status |
|--------|-------|--------|
| **Data Completeness** | 68% | 🟡 Acceptable |
| **Data Accuracy** | 97% | 🟢 Good |
| **Data Consistency** | 85% | 🟢 Good |
| **Schema Efficiency** | 75% | 🟡 Needs cleanup |

### Critical Statistics

- **Total Towns:** 352
- **Total Columns:** 190 (recommend reducing to 170)
- **Empty Columns:** 20 (10.5% of schema)
- **Data Errors:** 3 (0.8% error rate)
- **Data Warnings:** 66 (mostly missing data)

---

## 🔴 Action Required

### Immediate (Do Today)
1. **Fix Canadian Healthcare Costs** - 20 towns showing $0 (5 min fix)
   ```sql
   UPDATE towns
   SET healthcare_cost_monthly = 75, healthcare_cost = 75
   WHERE country = 'Canada' AND healthcare_cost_monthly = 0;
   ```

### This Week
2. **Drop 20 Empty Columns** - Reduce database bloat (10 min)
3. **Review Duplicate Costs** - Verify $2,793 value in 30 towns (30 min)

### This Month
4. **Redesign Quality of Life Scoring** - 97% of towns score 8-9 (4 hours)
5. **Decide on Partially Empty Columns** - 30+ columns are 70-94% empty (2 hours)

---

## 📊 Database Overview

### Towns Table
- **Rows:** 352 towns across 73 countries
- **Columns:** 190 (will reduce to 170 after cleanup)
- **Primary Key:** `id` (UUID)
- **Updated:** Continuously via admin panel

### Key Column Groups

| Category | Columns | Completeness | Status |
|----------|---------|--------------|--------|
| **Basic Info** | 10 | 100% | ✅ Complete |
| **Cost Data** | 15 | 85% | 🟢 Good |
| **Climate Data** | 12 | 90% | 🟢 Good |
| **Healthcare** | 8 | 75% | 🟡 Acceptable |
| **Lifestyle** | 20 | 65% | 🟡 Needs work |
| **Infrastructure** | 25 | 12% | 🔴 Mostly empty |
| **Images** | 8 | 20% | 🔴 Mostly empty |

---

## 🛠️ Maintenance Tools

### Audit Scripts (in `/database-utilities/`)

1. **comprehensive-data-audit.js** - Statistical outlier detection
2. **detailed-data-audit.js** - Format & consistency checks
3. **specific-column-audit.js** - Problem area analysis
4. **verify-coastal-distances.js** - Geographic validation
5. **generate-fix-script.js** - Automated SQL fixes

### How to Run Monthly Audit

```bash
# Step 1: Create backup
node create-database-snapshot.js

# Step 2: Run all audits
node database-utilities/comprehensive-data-audit.js
node database-utilities/detailed-data-audit.js
node database-utilities/specific-column-audit.js
node database-utilities/verify-coastal-distances.js
node database-utilities/generate-fix-script.js

# Step 3: Review & execute fixes
cat database-utilities/data-quality-fixes.sql
```

**Full instructions:** See [DATA_AUDIT_RUNBOOK.md](DATA_AUDIT_RUNBOOK.md)

---

## 📈 Data Quality Trends

### October 2025 Audit Findings

**Good News:**
- ✅ No critical data corruption
- ✅ Cost outliers are all legitimate (Boulder, Road Town BVI, etc.)
- ✅ Geographic features are accurate
- ✅ Categorical values are consistent (no typos in controlled fields)

**Needs Improvement:**
- 🟡 Quality of life scoring lacks granularity (only uses 2 values for 97% of data)
- 🟡 20 columns are completely empty (database bloat)
- 🟡 30+ columns are >70% empty (populate or remove?)
- 🟡 Some duplicate cost values suggest templating

**Critical Fixes:**
- 🔴 Canadian healthcare costs show $0 (unrealistic)
- 🔴 3 instances of placeholder text in production

---

## 🎯 Data Quality Standards

### Acceptable Ranges

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| Completeness | >90% | 70-90% | <70% |
| Accuracy | >95% | 90-95% | <90% |
| Consistency | >90% | 80-90% | <80% |
| Timeliness | <30 days | 30-90 days | >90 days |

### Current vs. Target

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Completeness | 68% | 85% | -17% |
| Accuracy | 97% | 95% | ✅ +2% |
| Consistency | 85% | 90% | -5% |

**How to close gap:**
- Populate or drop the 30+ mostly-empty columns
- Implement decimal scoring for quality_of_life
- Track data freshness with last_verified_date

---

## 📚 Related Documentation

### Database Design
- `/docs/database/schema.md` - Table structure (if exists)
- `/docs/database/migrations/` - Database change history

### Data Entry
- Admin panel: http://localhost:5173/admin
- Bulk updates: `/database-utilities/claude-db-helper.js`

### Backup & Recovery
- Snapshots: `/database-snapshots/`
- Recovery guide: `/docs/recovery/`

---

## 🔄 Audit Schedule

| Audit Type | Frequency | Last Run | Next Run |
|-----------|-----------|----------|----------|
| **Full Audit** | Monthly | Oct 19, 2025 | Nov 19, 2025 |
| **Quick Check** | Weekly | - | - |
| **Spot Check** | As needed | - | - |

### What to Check Monthly
1. Run all 5 audit scripts
2. Review error/warning trends
3. Fix critical issues immediately
4. Plan improvements for next month
5. Update this README

### What to Check Weekly
1. Count of NULL values in key fields
2. Recent data entry errors
3. Backup status

---

## 🚨 Known Issues (October 2025)

### High Priority
1. **Canadian healthcare costs = $0** (20 towns) - Fix ready
2. **Quality of life lacks granularity** (342 towns) - Needs redesign
3. **20 empty columns** - Drop recommended

### Medium Priority
4. **Duplicate cost values** - $2,793 in 30 US towns (verify accuracy)
5. **Missing image data** - 96%+ of image fields empty

### Low Priority
6. **Population type unclear** - Metro vs. town (Cairo: 20.9M)
7. **Estimate vs. actual** - No flag for estimated values

---

## 💡 Improvement Roadmap

### Q4 2025
- ✅ Complete comprehensive audit (Oct 19)
- 🔄 Fix Canadian healthcare costs
- 🔄 Drop 20 empty columns
- 📅 Redesign quality_of_life scoring

### Q1 2026
- 📅 Implement decimal scoring
- 📅 Add population_type field
- 📅 Add data_quality_flags system
- 📅 Populate or drop 30+ partially empty columns

### Q2 2026
- 📅 Implement last_verified_date tracking
- 📅 Add estimate_vs_actual flags
- 📅 Build automated data quality dashboard

---

## 📞 Questions?

- **Full audit details:** [DATA_QUALITY_AUDIT_2025-10-19.md](DATA_QUALITY_AUDIT_2025-10-19.md)
- **Executive summary:** [DATA_QUALITY_SUMMARY.md](DATA_QUALITY_SUMMARY.md)
- **How to run audits:** [DATA_AUDIT_RUNBOOK.md](DATA_AUDIT_RUNBOOK.md)

---

**Last Updated:** October 19, 2025
**Next Review:** November 19, 2025
