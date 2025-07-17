# Priority Towns for Data Updates

Based on the codebase analysis, here are the recommended priority towns for data updates:

## 🎯 Tier 1: Highest Priority (Already Visible - Have Photos)

These 23 towns already have photos and are visible to users. They should have the BEST data:

### European Towns (Most Popular with US Retirees)
1. **Porto, Portugal** - Already has update scripts
2. **Paris, France** - Already has update scripts
3. **Barcelona, Spain**
4. **Madrid, Spain**
5. **Valencia, Spain**
6. **Rome, Italy**
7. **Florence, Italy**
8. **Athens, Greece**
9. **Amsterdam, Netherlands**
10. **Berlin, Germany**
11. **Prague, Czech Republic**
12. **Budapest, Hungary**

### Central/South American Towns
13. **San José, Costa Rica**
14. **Panama City, Panama**
15. **Medellín, Colombia**
16. **Cuenca, Ecuador**

### Asian Towns
17. **Chiang Mai, Thailand**
18. **Penang, Malaysia**
19. **Da Nang, Vietnam**

### Other Popular Destinations
20. **Auckland, New Zealand**
21. **Vancouver, Canada**
22. **Malta (Valletta)**
23. **Dubai, UAE**

## 📊 Why These Towns?

1. **They're Already Visible** - These 23 towns have photos and appear in the app
2. **High Search Volume** - Popular retirement destinations for 55+ Americans
3. **Visa-Friendly** - Most offer retirement visas or easy access for US citizens
4. **Cost-Effective** - Many offer good value compared to US cost of living
5. **Healthcare Quality** - All have decent to excellent healthcare systems

## 🔄 Update Strategy

### For Each Priority Town, Update:
- **Citizenship-specific visa requirements** (US, UK, EU, Canada, Australia)
- **Healthcare info per citizenship** (costs, access, insurance needs)
- **Tax implications** by citizenship
- **Pet import requirements** by origin country
- **Cost breakdowns** (rent, food, utilities, healthcare)
- **Lifestyle descriptions** (pace, culture, expat community)
- **Climate details** (seasonal variations, extremes)
- **Infrastructure** (internet, transport, airports)

### Data Completeness Goals:
- **Current**: Most towns at 0-30% complete
- **Target**: 95% complete for all Tier 1 towns
- **Fields**: Fill all 100+ columns with accurate, current data

## 🚀 Quick Start Commands

### 1. Check Current Data Completeness
```bash
cd towns-updater
node pre-flight-check.js
```

### 2. Update Porto & Paris (Example Implementation)
```bash
node update-porto-paris-safe.js
```

### 3. Update All Visible European Towns
```bash
node update-visible-towns-europe.js
```

### 4. Check Priority Towns Status
```bash
echo "SELECT name, country, data_completeness_score, cost_index, healthcare_score FROM towns WHERE image_url_1 IS NOT NULL ORDER BY country;" | npx supabase db execute
```

## 💡 Next Steps

1. **Complete Tier 1** - Ensure all 23 visible towns have rich, complete data
2. **Add Photos** - Priority #1 is adding photos to more towns
3. **Expand Coverage** - Focus on popular retirement destinations missing photos:
   - Lisbon, Portugal
   - Algarve, Portugal  
   - Málaga, Spain
   - Nice, France
   - Playa del Carmen, Mexico
   - Boquete, Panama
   - George Town, Malaysia

## 📈 Success Metrics

- **Before**: 23 towns visible, most with minimal data
- **Goal**: 23 towns with 95%+ complete data
- **Impact**: Better matching, richer recommendations, happier users

## ⚠️ Remember

- **NEVER update photo fields via scripts**
- **Test on one town first**
- **Monitor data quality**
- **Use Claude API for rich descriptions**