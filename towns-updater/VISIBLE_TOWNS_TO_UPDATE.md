# Visible Towns to Update - ACTUAL LIST

These are the 23 towns that currently have photos and are visible in the app. They ALL need data updates.

## 🎯 Current Visible Towns (Grouped by Priority)

### Tier 1: Most Popular Retirement Destinations
These should be updated FIRST as they're the most searched:

1. **Porto, Portugal** - €1,700/month ⭐ Update script exists
2. **Lisbon, Portugal** - €2,000/month
3. **Valencia, Spain** - €1,800/month
4. **Alicante, Spain** - €1,600/month
5. **Paris, France** - €3,200/month ⭐ Update script exists
6. **Chiang Mai, Thailand** - $1,200/month
7. **George Town, Malaysia** - $1,100/month
8. **Lake Chapala, Mexico** - $1,400/month
9. **San Miguel de Allende, Mexico** - $1,500/month
10. **Boquete, Panama** - $1,500/month

### Tier 2: Growing in Popularity
11. **Medellín, Colombia** - $1,300/month
12. **Cuenca, Ecuador** - $1,200/month
13. **Da Nang, Vietnam** - $1,000/month
14. **Ljubljana, Slovenia** - €1,900/month
15. **Split, Croatia** - €1,800/month
16. **Tavira, Portugal** - €1,600/month (Algarve region)

### Tier 3: Premium/Niche Markets
17. **Rome, Italy** - €2,800/month
18. **Bordeaux, France** - €2,500/month
19. **Saint-Tropez, France** - €3,500/month
20. **Lemmer, Netherlands** - €2,300/month
21. **Riga, Latvia** - €1,500/month
22. **Mérida, Mexico** - $1,300/month
23. **Gainesville, FL, USA** - $2,100/month

## 📊 Current Data Status

ALL towns currently show:
- ✅ Cost index (100% have this)
- ✅ Healthcare score (100% have this)
- ❌ Data completeness: 0% (ALL need updates!)

## 🚀 Update Strategy

### Phase 1: Update Top 10 (Most Popular)
Focus on the Tier 1 towns first. These get the most searches.

### Phase 2: Update Growing Markets (11-16)
These are becoming more popular with retirees.

### Phase 3: Complete Remaining (17-23)
Premium and niche markets.

## 📝 For Each Town, Add:

### Essential Data (Priority)
- **Description** - 2-3 compelling sentences
- **Lifestyle description** - Daily life for retirees
- **Climate description** - Seasonal details
- **Healthcare description** - Per citizenship (US, UK, EU, Canada, Australia)
- **Visa requirements** - Per citizenship
- **Cost breakdown** - Rent, food, utilities, healthcare

### Additional Data
- **Pet policies** - Import requirements per origin
- **Tax implications** - Per citizenship
- **Internet speed** - For digital nomad retirees
- **Airport access** - Distance and connections
- **Expat community size** - Small/Medium/Large
- **Safety description** - Crime and natural disasters
- **Cultural highlights** - Museums, events, dining

## 💻 Quick Commands

### Check specific town data:
```bash
cd towns-updater
node -e "
import('./test-connection.js').then(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const dotenv = await import('dotenv');
  dotenv.config();
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data } = await supabase.from('towns').select('*').eq('name', 'Porto').single();
  console.log(data);
});
"
```

### Update European towns:
```bash
node update-visible-towns-europe.js
```

### Test updates safely:
```bash
node test-photo-safety.js
```

## 🎯 Next Steps

1. **Run pre-flight check**: `node pre-flight-check.js`
2. **Test photo safety**: `node test-photo-safety.js`
3. **Update Porto & Paris**: `node update-porto-paris-safe.js`
4. **Update remaining European towns**: `node update-visible-towns-europe.js`
5. **Create update scripts for Latin American towns**
6. **Create update scripts for Asian towns**

## ⚠️ Remember

- **NEVER update photo fields** - Manual process only
- **Test on one town first** - Verify data quality
- **Use Claude API** - For rich, accurate descriptions
- **Think citizenship-specific** - Different info for US vs EU retirees