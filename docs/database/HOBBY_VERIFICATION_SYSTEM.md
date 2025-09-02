# 🎯 HOBBY VERIFICATION SYSTEM - COMPLETE DOCUMENTATION
**Created:** 2025-09-01
**Purpose:** Comprehensive guide for hobby classification and verification in Scout2Retire

## 🚨 CRITICAL CONTEXT - READ THIS FIRST
We spent hours classifying hobbies to determine which are "town-relevant" (affect matching algorithm) vs "universal" (user-to-user matching only). The hobbies table has THREE new TEXT columns added for verification:
- `verification_method` - How to verify if town supports this hobby
- `verification_query` - The SQL or AI prompt to check
- `verification_notes` - Context and explanations

## 📊 THE CLASSIFICATION SYSTEM

### Category Types (Binary)
- **activity** = Physical/Active/Doing (hiking, swimming, dancing)
- **interest** = Mental/Passive/Learning (reading, photography, collecting)

### Verification Methods
1. **universal** - Available everywhere, no verification needed
   - Query: NULL
   - Notes: Explain why it's universal
   - Example: Baking, Reading, Chess

2. **database_geographic** - Check geographic/climate columns
   - Query: SQL checking elevation, water bodies, distance to ocean
   - Example: Hiking (hiking_trails_km > 0), Boating (water_bodies IS NOT NULL)

3. **database_infrastructure** - Check infrastructure columns
   - Query: SQL checking counts like golf_courses_count > 0
   - Example: Golf, Tennis (but we don't have many infrastructure columns)

4. **ai_facilities** - AI searches for specific facilities
   - Query: "Find {facility type} in {town}"
   - Example: Bowling alleys, Dance studios, Yoga studios

5. **ai_community** - AI verifies local culture/scene
   - Query: "Is {hobby} popular or available in {town}?"
   - Example: Bocce Ball (regional), Wine Tasting (wine culture)

## 🎯 CLASSIFICATION RULES

### DEFAULT TO UNIVERSAL (Benefit of Doubt)
If a hobby CAN be done anywhere with basic equipment/internet/a partner, it's UNIVERSAL.
- Examples: Baking (every kitchen), Board Games (just need people), Blogging (internet only)

### TOWN-RELEVANT CRITERIA
A hobby is NOT universal if it requires:
- **Specific geography** - Mountains, water bodies, elevation
- **Infrastructure** - Courts, alleys, studios, tracks
- **Climate** - Snow for skiing, warm water for diving
- **Community** - Local scene, clubs, instructors
- **Regulations** - Beekeeping in cities, hunting licenses

### EDGE CASES WE RESOLVED
- **Bocce Ball** → ai_community (culturally regional - Mediterranean)
- **Ballroom Dancing** → ai_facilities (needs venues, not universal)
- **Bible Study** → ai_community (not universal in non-Christian regions)
- **Beekeeping** → database_geographic (rural/suburban OK, urban restricted)
- **Basketball** → ai_facilities (needs courts, search online)

## 📝 SPECIFIC PATTERNS TO FOLLOW

### Water Sports Pattern
```sql
verification_method = 'database_geographic'
verification_query = 'water_bodies IS NOT NULL OR distance_to_ocean_km < 20 OR has_rivers = true OR has_lakes = true OR has_sea_access = true OR has_gulf_access = true'
verification_notes = 'Requires water access'
```

### Mountain/Outdoor Pattern
```sql
verification_method = 'database_geographic'
verification_query = 'hiking_trails_km > 0 OR elevation_meters > 300 OR geographic_features LIKE '%mountain%''
verification_notes = 'Better with elevation/nature but possible most places'
```

### Facility Search Pattern
```sql
verification_method = 'ai_facilities'
verification_query = 'Find {specific facility} within 30km of {town}'
verification_notes = 'Requires specific facilities'
```

### Rural/Urban Pattern
```sql
verification_method = 'database_geographic'
verification_query = 'population_density < 5000 OR urban_rural_classification IN ('rural', 'suburban')'
verification_notes = 'Restricted in dense urban areas'
```

## 🔄 HOW TO PROCESS REMAINING HOBBIES

1. **Get unprocessed hobbies:**
```sql
SELECT name, category, group_name, is_universal 
FROM hobbies 
WHERE verification_method IS NULL 
ORDER BY name;
```

2. **Apply these rules:**
- Digital/Online → universal
- Collecting → universal
- Reading/Writing → universal
- Basic cooking/crafts → universal
- Needs specific facility → ai_facilities
- Needs water → database_geographic
- Culturally specific → ai_community
- Team sports → ai_facilities (search for fields/courts)

3. **Update format:**
```sql
UPDATE hobbies
SET 
  category = 'activity|interest',
  is_universal = true|false,
  verification_method = 'method_here',
  verification_query = 'query_here|NULL',
  verification_notes = 'explanation here'
WHERE name = 'Hobby Name';
```

## 🚨 RECOVERY INSTRUCTIONS FOR CRASHED CLAUDE

If you crashed and are reading this:

1. **Current Status:** We were processing hobbies one by one, updating their verification methods
2. **What We Did:** Added 3 TEXT columns (verification_method, verification_query, verification_notes) to hobbies table
3. **The Goal:** Classify ALL hobbies so the matching algorithm knows which hobbies are town-relevant
4. **Key Decision:** When in doubt, mark as UNIVERSAL (benefit of doubt principle)
5. **Check Progress:**
```sql
SELECT COUNT(*) as done FROM hobbies WHERE verification_method IS NOT NULL;
SELECT COUNT(*) as todo FROM hobbies WHERE verification_method IS NULL;
```

6. **Continue Processing:** Use the patterns above to classify remaining hobbies
7. **DO NOT:** Create individual .js files for each update - just execute SQL directly
8. **DO NOT:** Ask for confirmation on each hobby if following established patterns

## 📊 EXAMPLES OF COMPLETED CLASSIFICATIONS

- **Hiking** → activity, database_geographic, "hiking_trails_km > 0"
- **Baking** → activity, universal, NULL query
- **Basketball** → activity, ai_facilities, "Find basketball courts"
- **Bocce Ball** → activity, ai_community, "Is bocce played in {town}?"
- **Bible Study** → interest, ai_community, "Are there churches with Bible study?"
- **Birdwatching** → interest, universal, "Birds exist everywhere"
- **Beekeeping** → activity, database_geographic, "population_density < 5000"

Remember: The goal is to separate hobbies that actually affect town matching from those that are just for user-to-user matching!