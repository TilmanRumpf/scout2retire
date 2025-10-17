# 📚 USAGE GUIDE - Adding New Towns to Scout2Retire

**Version**: 1.0
**Last Updated**: 2025-10-15
**Difficulty**: Beginner-friendly

---

## 🎯 Quick Start

### Basic Usage
```bash
node database-utilities/add-town.js --name "Town Name" --country "Country Name"
```

### With Coordinates (Recommended)
```bash
node database-utilities/add-town.js --name "Bubaque" --country "Guinea-Bissau" --lat 11.2853 --lon -15.8394
```

---

## 📋 Complete Example - Adding Bubaque, Guinea-Bissau

### Step 1: Run the Command
```bash
node database-utilities/add-town.js \
  --name "Bubaque" \
  --country "Guinea-Bissau" \
  --lat 11.2853 \
  --lon -15.8394
```

### Step 2: Review the Output
The utility will show real-time progress:

```
🚀 Starting town addition process...
📍 Town: Bubaque, Guinea-Bissau

📋 STEP 1: Validating input...
  ✅ Input validation passed: Bubaque, Guinea-Bissau

🌍 STEP 2: Enriching geographic data...
  ✅ Region: Africa
  ✅ Geo-region: West Africa

🌤️  STEP 3: Gathering climate data...
  ✅ Summer avg: 27°C
  ✅ Winter avg: 26°C
  ✅ Annual rainfall: 1539mm

💰 STEP 4: Gathering cost data...
  ⚠️ Cost data unavailable - manual research required

🔧 STEP 5: Setting defaults and initializing structures...
  ✅ Initialized 12 array fields
  ✅ Initialized 4 object fields

✅ STEP 6: Validating categorical values...
  ✅ All categorical values valid

📊 STEP 7: Calculating data completeness score...
  ✅ Overall completeness: 76%

💾 STEP 8: Inserting into database...
  ✅ Successfully inserted with ID: a092fb34-6ede-4d91-a8b0-2fdad4e8eb45
```

### Step 3: Final Report
The utility generates a quality report:

```
═══════════════════════════════════════════════════════════
   TOWN ADDITION COMPLETE - QUALITY REPORT
═══════════════════════════════════════════════════════════

✅ Town Name: Bubaque
✅ Country: Guinea-Bissau
✅ Database ID: a092fb34-6ede-4d91-a8b0-2fdad4e8eb45

📊 Data Completeness: 76%
   → Critical: 100%
   → Important: 50%
   → Nice-to-have: 71%

⚠️  MISSING IMPORTANT FIELDS:
   - climate (general climate type)
   - pace_of_life_actual
   - cost_of_living_usd
   - typical_monthly_living_cost

📋 DATA GAPS IDENTIFIED:
   - sunshine_hours_unavailable
   - cost_data_unavailable_needs_research

🔍 NEXT STEPS:
   1. Review in Admin UI: http://localhost:5173/admin/towns-manager
   2. Search for "Bubaque" in the admin panel
   3. Add missing important fields (especially cost data)
   4. Add photos (image_url_1)
   5. Research and populate activities/interests arrays
   6. Run scoring algorithm to calculate scores
```

### Step 4: Review in Admin UI

1. **Open Admin Panel**:
   ```
   http://localhost:5173/admin/towns-manager
   ```

2. **Search for the Town**:
   - Type "Bubaque" in the search box
   - Click on the town when it appears

3. **Review Data Quality**:
   - Check the completeness percentage
   - Review which fields are filled vs. empty
   - Identify priority fields to fill

4. **Fill Missing Data**:
   - Click on empty fields to edit them
   - Use the Google Search button (🔍) to research values
   - Use the Wikipedia panel for general information

---

## 🔧 Advanced Usage

### Without Coordinates (Will Attempt Geocoding)
```bash
node database-utilities/add-town.js --name "Lisbon" --country "Portugal"
```
The utility will automatically try to find coordinates using OpenStreetMap.

### Dry Run (Check Before Adding)
Currently not supported, but you can manually verify by checking if the town exists:
```bash
# Query database first
node claude-db-helper.js
# Then check if town exists in the database
```

---

## 📊 Understanding the Output

### Data Completeness Tiers

**🔴 TIER 1: Critical (40% of score)**
- Required for town to exist in database
- Fields: `name`, `country`, `latitude`, `longitude`
- **Must be 100%** or town cannot be added

**🟡 TIER 2: Important (30% of score)**
- Required for good matching/scoring
- Fields: `region`, `geo_region`, `climate`, `summer_climate_actual`, `winter_climate_actual`, `pace_of_life_actual`, `cost_of_living_usd`, `typical_monthly_living_cost`
- **Target: 80%+** for useful town

**🟢 TIER 3: Nice-to-have (30% of score)**
- Enhances user experience but not critical
- All other 160+ fields
- **Target: 50%+** for good town

### Quality Score Interpretation

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100% | ⭐⭐⭐ Excellent | Comprehensive data, ready for users |
| 70-89% | ⭐⭐ Good | Usable but needs enrichment |
| 50-69% | ⭐ Fair | Basic info only, significant gaps |
| 30-49% | ⚠️ Poor | Missing critical data, needs work |
| <30% | ❌ Critical | Barely usable, major enrichment needed |

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot find coordinates"
**Error**: `Cannot find coordinates for "Town Name, Country"`

**Solution**:
```bash
# Provide coordinates manually with --lat and --lon
node database-utilities/add-town.js --name "Town" --country "Country" --lat 12.34 --lon -56.78
```

### Issue 2: "Invalid categorical value"
**Error**: `Invalid value "relaxing" for pace_of_life_actual`

**Cause**: Used a value not in the approved list

**Solution**: Check valid values in `src/utils/validation/categoricalValues.js`:
- ✅ Valid: `slow`, `relaxed`, `moderate`, `fast`
- ❌ Invalid: `relaxing`, `chill`, `busy`

### Issue 3: "Cost data unavailable"
**Expected behavior**: Most obscure towns won't have API data

**Solution**:
1. Add town anyway (utility handles gracefully)
2. Research cost data manually
3. Add via Admin UI after town creation

### Issue 4: Country not in database
**Warning**: `Country "XYZ" not found in database`

**This is OK!** The utility will add the town anyway. You're adding the first town from a new country.

---

## 📝 Post-Addition Checklist

After adding a town, complete these steps in the Admin UI:

### Priority 1: Critical Fields (Do Immediately)
- [ ] Add `description` - 2-3 sentence overview
- [ ] Add `image_url_1` - Main photo of the town
- [ ] Add `cost_of_living_usd` - Monthly cost estimate
- [ ] Add `climate` - General climate type (e.g., "tropical", "mediterranean")

### Priority 2: Important Fields (Do Within 24 Hours)
- [ ] Add `pace_of_life_actual` - slow/relaxed/moderate/fast
- [ ] Add `typical_monthly_living_cost` - Specific monthly budget
- [ ] Add `social_atmosphere` - reserved/quiet/moderate/friendly/vibrant
- [ ] Add `retirement_community_presence` - none/minimal/limited/moderate/strong

### Priority 3: Enrichment Fields (Do When Possible)
- [ ] Add `activities_available` - Array of available activities
- [ ] Add `interests_supported` - Array of supported interests
- [ ] Add `top_hobbies` - Top 10 hobbies for the town
- [ ] Add more photos (`image_url_2`, `image_url_3`)
- [ ] Add detailed infrastructure data

---

## 🔄 Workflow for Batch Town Addition

### Adding Multiple Towns from Same Country

```bash
# Example: Adding 5 Portuguese towns
node database-utilities/add-town.js --name "Lisbon" --country "Portugal" --lat 38.7223 --lon -9.1393
node database-utilities/add-town.js --name "Porto" --country "Portugal" --lat 41.1579 --lon -8.6291
node database-utilities/add-town.js --name "Coimbra" --country "Portugal" --lat 40.2033 --lon -8.4103
node database-utilities/add-town.js --name "Faro" --country "Portugal" --lat 37.0194 --lon -7.9304
node database-utilities/add-town.js --name "Braga" --country "Portugal" --lat 41.5518 --lon -8.4229
```

### Post-Batch Review
1. Filter Admin UI by country: "Portugal"
2. Sort by completeness: Low to High
3. Systematically fill missing data for all towns
4. Run scoring algorithm when complete

---

## 🎓 Best Practices

### DO:
- ✅ Always provide coordinates when known (faster, more accurate)
- ✅ Review the quality report before moving to next town
- ✅ Fill critical fields immediately in Admin UI
- ✅ Verify climate data makes sense (winter warmer than summer = error)
- ✅ Use Admin UI's Google Search feature for research

### DON'T:
- ❌ Add duplicate towns (search first!)
- ❌ Use abbreviated country names ("GB" instead of "Guinea-Bissau")
- ❌ Skip reviewing the quality report
- ❌ Add towns with made-up data (use null if unknown)
- ❌ Forget to add photos (users love visual content)

---

## 📊 Quality Metrics to Track

After adding towns, monitor these metrics in Admin UI:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Avg Completeness | >70% | Filter > Data Quality > Completion |
| Towns with Photos | >80% | Filter > Photo > No Photo |
| Missing Cost Data | <20% | Filter > Data Quality > Missing Match Data |
| Categorical Errors | 0 | Filter > Data Quality > Has Errors |

---

## 🚀 Next Steps After Adding Towns

1. **Run Scoring Algorithm**:
   ```bash
   node database-utilities/recalculate-scores.js
   ```

2. **Update Search Index**:
   ```bash
   node database-utilities/update-search-vectors.js
   ```

3. **Test Matching**:
   - Go to http://localhost:5173/
   - Complete onboarding
   - Verify new towns appear in results

---

## 📞 Support & Troubleshooting

**Algorithm Documentation**: `docs/algorithms/ADD_NEW_TOWN_ALGORITHM.md`

**Common Errors**: See "Common Issues & Solutions" section above

**Configuration Files**:
- Field tiers: `database-utilities/add-town-config.js`
- Helper functions: `database-utilities/add-town-helpers.js`
- Main utility: `database-utilities/add-town.js`

**Database Schema**: Check `src/utils/townColumnSets.js` for column definitions

---

## ✅ Success Story: Bubaque, Guinea-Bissau

**Challenge**: Add a very obscure island town with no online data

**Process**:
1. Ran utility with just name, country, and coordinates
2. Utility automatically gathered climate data from weather APIs
3. Flagged missing cost data for manual research
4. Added town with 76% completeness score
5. Used Admin UI to fill remaining critical fields

**Result**: Town now searchable and visible to users, with clear indicators of what data still needs research

**Time**: 2 minutes automated + 10 minutes manual enrichment = **12 minutes total**

---

**Happy Town Adding! 🏘️**
