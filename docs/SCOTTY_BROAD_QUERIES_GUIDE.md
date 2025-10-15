# 🧠 Scotty AI - Broad Query Intelligence Guide

## Overview
Scotty has been enhanced to handle broad, conversational queries about geographic locations. Users can say things like "I like Nova Scotia" and Scotty will intelligently understand the context and provide personalized recommendations.

---

## 🎯 What Scotty Now Understands

### Geographic Hierarchy
Scotty knows that:
- **Nova Scotia** is a province in **Canada**
- **British Columbia** is a province in **Canada**
- **Algarve** is a region in **Portugal**
- **Andalusia** is a region in **Spain**
- **Florida** is a state in the **United States**

### Automatic Intelligence
When a user mentions a location, Scotty automatically:
1. ✅ **Identifies the location type** (country, province, state, region)
2. ✅ **Knows which country it belongs to**
3. ✅ **Fetches all towns in that location from database**
4. ✅ **Matches towns to user's preferences** (budget, climate, etc.)
5. ✅ **Provides personalized recommendations**

---

## 📝 Example Queries Scotty Handles

### 1. Province/State Queries

**User:** "I like Nova Scotia"

**What Scotty Does:**
- Recognizes Nova Scotia = province in Canada
- Fetches all Nova Scotia towns from database
- Checks user's budget, climate preferences, favorites
- Recommends best-match towns with reasoning

**Scotty's Response:**
```
Great to hear you're interested in Nova Scotia! It's a beautiful province
in Atlantic Canada known for its coastal charm and friendly communities.

Based on your budget of $3,000/month and preference for coastal living,
here are the top Nova Scotia towns in our database:

• Halifax (score: 85) - Rent: $1,800/mo - Pop: 403,000
  Perfect for: Strong healthcare, vibrant culture, international airport

• Lunenburg (score: 82) - Rent: $1,400/mo - Pop: 2,300
  Perfect for: UNESCO heritage site, relaxed pace, artistic community

Would you like me to dive deeper into any of these towns?
```

### 2. Country Queries

**User:** "Tell me about Canada"

**What Scotty Does:**
- Recognizes Canada = country
- Shows ALL Canadian towns in database (across all provinces)
- Highlights variety of options
- Suggests focusing on specific regions

**Scotty's Response:**
```
Canada is an excellent retirement destination! We have towns across
British Columbia, Ontario, Quebec, Nova Scotia, and other provinces.

With your US citizenship, you can visit visa-free for up to 6 months.
Based on your $3,500/month budget, you have many affordable options.

Top recommendations across Canada:
• Victoria, BC - Mild climate, coastal beauty
• Halifax, NS - Atlantic charm, strong healthcare
• Montreal, QC - European flair, cultural richness

Would you like to explore a specific province, or should I suggest
a 7-day exploration itinerary?
```

### 3. Region Queries

**User:** "What about the Algarve?"

**What Scotty Does:**
- Recognizes Algarve = region in Portugal
- Fetches Portuguese towns in southern region
- Considers user's EU/non-EU citizenship for visa info

**Scotty's Response:**
```
The Algarve is Portugal's stunning southern coast - warm climate,
beautiful beaches, and a large expat community.

As a US citizen, you can stay visa-free for 90 days, with residency
options available. With your $2,800/month budget, the Algarve is
very affordable.

Our top Algarve towns:
• Lagos - Rent: $1,200/mo - Beach town with strong expat community
• Tavira - Rent: $900/mo - Quieter, authentic Portuguese charm

Should I explain the Portugal Golden Visa or NHR tax benefits?
```

### 4. Broad Interest Queries

**User:** "I'm interested in coastal towns with good healthcare"

**What Scotty Does:**
- Searches across ALL countries
- Filters by "coastal" geography + healthcare quality
- Ranks by user's other preferences (budget, climate, etc.)

**Scotty's Response:**
```
Based on your preferences, here are top coastal towns with
excellent healthcare:

Portugal:
• Cascais - Modern healthcare, near Lisbon
• Lagos - Beach town, quality medical facilities

Spain:
• Valencia - World-class healthcare, Mediterranean coast
• Málaga - Excellent hospitals, Costa del Sol

Canada:
• Victoria, BC - Top-rated healthcare, mild coastal climate

All within your $3,000/month budget. Which region interests you most?
```

---

## 🔧 How It Works Behind the Scenes

### Step 1: Query Parsing
```javascript
User: "I like Nova Scotia"
↓
parseGeographicQuery()
↓
Result: {
  type: 'province',
  name: 'Nova Scotia',
  abbreviation: 'NS',
  country: 'Canada',
  region: 'Atlantic Canada'
}
```

### Step 2: Database Lookup
```javascript
getTownsInLocation()
↓
SQL: SELECT * FROM towns
     WHERE country = 'Canada'
     AND state_code = 'NS'
↓
Results: [Halifax, Lunenburg, Chester, ...]
```

### Step 3: User Preference Matching
```javascript
matchTownsToUser(towns, userContext)
↓
Filters by:
- Budget: $3,000/mo → Removes towns with rent > $3,000
- Climate: Mild winters → Prioritizes coastal NS towns
- Favorites: Already favorited Halifax → Mentions it first
↓
Sorted Results: [Halifax (90% match), Lunenburg (85% match), ...]
```

### Step 4: Context Enhancement
```javascript
formatGeographicContext()
↓
Builds prompt for Claude AI:
"LOCATION CONTEXT: Nova Scotia (NS) is a province in Canada.
 It's part of Atlantic Canada.

 AVAILABLE TOWNS IN NOVA SCOTIA (5 total):
 • Halifax (score: 85) - Rent: $1,800/mo - Pop: 403,000
 • Lunenburg (score: 82) - Rent: $1,400/mo - Pop: 2,300
 ...

 USER MATCH ANALYSIS:
 • Budget ($3,000/mo): 5/5 towns within budget
 • ✅ User has 1 favorite in this location: Halifax"
```

### Step 5: AI Response
Scotty receives all this context and generates a personalized response based on:
- User's specific preferences
- Towns that match their criteria
- Their budget and citizenship
- What they've already favorited

---

## 🌍 Supported Locations

### North America
**Canada:**
- Provinces: Nova Scotia, British Columbia, Ontario, Quebec, Alberta, Manitoba, Saskatchewan, New Brunswick, Newfoundland, PEI
- Recognition: Full names, abbreviations (NS, BC, ON, etc.)

**United States:**
- States: Florida, Arizona, California, Texas, North Carolina
- Recognition: Full names, abbreviations (FL, AZ, CA, etc.)

### Europe
**Portugal:**
- Regions: Algarve, Lisbon, Porto, Alentejo, Madeira, Azores
- Recognition: English and Portuguese names

**Spain:**
- Regions: Andalusia, Valencia, Catalonia, Basque Country, Galicia
- Recognition: English and Spanish names

**France:**
- Regions: Provence, Brittany, Normandy, Côte d'Azur
- Recognition: English and French names

### Latin America
**Mexico:**
- States: Quintana Roo, Yucatan, Baja California, Jalisco
- Recognition: English and Spanish names

---

## 💬 Conversation Flow Examples

### Example 1: Shabnam's Nova Scotia Journey

**Shabnam:** "I like Nova Scotia"

**Scotty:**
```
That's wonderful! Nova Scotia is a beautiful Atlantic Canadian
province known for coastal charm and friendly communities.

Based on your profile, here are the best matches:

• Halifax - $1,800/mo rent, excellent healthcare, vibrant culture
• Lunenburg - $1,400/mo rent, UNESCO site, artistic vibe

I see you're interested in coastal living with good amenities.
Halifax would be perfect - it's Canada's ocean city with top
hospitals and direct flights to the US.

Would you like to know about:
- Healthcare specifics in Halifax?
- 7-day Nova Scotia exploration itinerary?
- Visa requirements for Americans in Canada?
```

**Shabnam:** "Tell me about a 7-day trip"

**Scotty:**
```
Perfect! Here's a great 7-day Nova Scotia retirement exploration
starting from Halifax:

Day 1-2: Halifax
- Stay in the South End neighborhood
- Visit QEII Hospital, check healthcare facilities
- Explore waterfront, Public Gardens

Day 3-4: Lunenburg (1.5hr south)
- UNESCO World Heritage town
- Check housing costs, meet locals
- Beautiful coastal scenery

Day 5-6: Annapolis Valley
- Wine country, mild climate
- Lower costs than Halifax
- Charming small towns

Day 7: Return to Halifax
- Final impressions, summary

Total driving: ~400km. All within your budget and interests.

Should I provide specific things to evaluate in each town?
```

### Example 2: Multi-Country Comparison

**User:** "I'm deciding between Canada and Portugal"

**Scotty:**
```
Great comparison! Both are excellent for US retirees. Let me
break down the key differences:

CANADA:
✅ Visa-free visits (6 months)
✅ English-speaking (mostly)
✅ Close to US (easy visits home)
⚠️ Colder climate (except BC)
💰 Higher costs: $2,500-3,500/mo

Best for: Those wanting proximity to US, excellent healthcare,
         four seasons

PORTUGAL:
✅ Year-round warm weather
✅ Lower costs: $1,500-2,500/mo
✅ Golden Visa options
⚠️ Language barrier (some areas)
⚠️ Farther from US

Best for: Those prioritizing affordability, Mediterranean climate,
         European travel base

Based on your $3,000/mo budget and preference for moderate climate,
which appeals more - coastal Canada or sunny Portugal?
```

---

## 🎯 Shabnam's Specific Use Case

### Query: "I like Nova Scotia, what can I explore if I only had 7 days?"

**What Scotty Knows:**
1. ✅ Nova Scotia = province in Canada
2. ✅ Towns in Nova Scotia: Halifax, Lunenburg, Chester, etc.
3. ✅ Shabnam's preferences (from her profile):
   - Budget: $X/month
   - Climate: Prefers X
   - Citizenship: X (affects visa advice)
   - Favorites: Already favorited [towns]

**What Scotty Provides:**
1. Geographic context (Nova Scotia is in Atlantic Canada)
2. All NS towns in database with scores
3. Best matches to Shabnam's preferences
4. 7-day itinerary optimized for:
   - Her starting point (nearest airport)
   - Her interests
   - Practical driving distances
   - Town variety (big city + small towns)

**Sample Response:**
```
Nova Scotia is perfect for a 7-day exploration! With Halifax as
your starting point, you can see diverse retirement options.

Based on your preferences, here's your ideal route:

🏙️ Days 1-2: Halifax (Base yourself here)
Why: Strong healthcare, cultural activities, international airport
Check: QEII Hospital, South End neighborhoods, cost of living

🏘️ Day 3: Lunenburg (1.5hr drive south)
Why: UNESCO heritage, artistic community, lower costs
Check: Waterfront real estate, local services, expat community

🌊 Day 4: Chester (nearby)
Why: Sailing culture, summer activities, intimate community
Check: Housing market, year-round vs seasonal vibe

🍷 Days 5-6: Annapolis Valley
Why: Wine country, mild microclimate, agricultural charm
Check: Wolfville or Kentville - compare costs and amenities

Day 7: Return to Halifax, final reflections

All within your $X/month budget. Halifax rent: ~$1,800/mo,
smaller towns: $1,200-1,500/mo.

Want specific evaluation checklists for each town?
```

---

## 🔬 Technical Details

### Files Modified
1. **`scottyGeographicKnowledge.js`** - New geographic intelligence engine
2. **`ScottyGuide.jsx`** - Enhanced with geographic query detection
3. **`scottyContext.js`** - Already provides user preference data

### How Geographic Knowledge Integrates
```javascript
// In handleSend() function:
const geoKnowledge = await enhanceScottyWithGeographicKnowledge(
  message,      // "I like Nova Scotia"
  userContext   // Shabnam's preferences
);

if (geoKnowledge && geoKnowledge.hasTowns) {
  // Add to Scotty's prompt:
  // - Geographic info (Nova Scotia = province in Canada)
  // - All towns in that location
  // - User match analysis
  // - Budget compatibility
}
```

### Database Queries
All town data comes from existing database - no new tables needed!

```sql
-- When user says "I like Nova Scotia"
SELECT id, name, country, state_code, latitude, longitude,
       overall_score, rent_cost_$, population
FROM towns
WHERE country = 'Canada'
  AND state_code = 'NS'
ORDER BY overall_score DESC;
```

---

## ✅ Testing Checklist

### Broad Queries to Test
- [x] "I like Nova Scotia"
- [x] "Tell me about Canada"
- [x] "What about the Algarve?"
- [x] "I'm interested in British Columbia"
- [x] "Show me options in Portugal"
- [x] "I want to explore Ontario"

### Expected Behavior
1. Scotty recognizes the location type
2. Shows relevant towns from database
3. Matches to user's actual preferences
4. Provides personalized recommendations
5. Offers to create travel itineraries
6. References user's favorites if relevant

---

## 🚀 Next Steps for Enhancement

### Future Improvements
1. **Distance calculations** - Show exact km between towns
2. **Airport proximity** - "Towns within 2 hours of Vancouver Airport"
3. **Climate overlays** - Visual maps of temperature zones
4. **Cost comparisons** - Side-by-side budget breakdowns
5. **Similar town suggestions** - "Towns like Halifax but cheaper"

---

**Last Updated**: October 14, 2025
**Version**: 1.0
**Status**: ✅ LIVE - Ready for Shabnam to use!

## 💡 Key Takeaway

Scotty is now **geography-aware** and **preference-intelligent**. Users can have natural conversations like:

- "I like Nova Scotia" ✅
- "What about Portugal?" ✅
- "Tell me about coastal Canada" ✅
- "I want warm weather and good healthcare" ✅

Scotty will **automatically** understand the context, fetch relevant data, match to user preferences, and provide personalized recommendations with travel planning assistance.

**No manual database queries. No copying SQL. Just natural conversation.** 🎯
