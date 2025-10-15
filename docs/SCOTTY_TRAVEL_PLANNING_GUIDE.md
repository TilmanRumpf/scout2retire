# 🗺️ Scotty AI Travel Planning Guide

## Overview
Scotty can help users plan multi-day exploration trips to discover potential retirement destinations. This guide explains Scotty's travel planning capabilities.

## ✅ What Scotty CAN Do

### 1. **Multi-Day Itinerary Planning**
Scotty can create detailed travel itineraries based on:
- Starting airport (e.g., "Vancouver International", "Toronto Pearson", "Montreal")
- Number of days available (e.g., "7 days", "2 weeks")
- Travel radius from starting point
- User's retirement preferences (climate, budget, lifestyle)

### 2. **Airport-Based Route Planning**
- Identifies towns within practical driving distance from major airports
- Suggests optimal routes considering geography and travel time
- Balances diversity of experiences (coastal vs. inland, urban vs. small town)

### 3. **Personalized Recommendations**
Scotty considers:
- **User's favorited towns** - Prioritizes places they've already shown interest in
- **Budget preferences** - Suggests towns matching their cost-of-living requirements
- **Climate preferences** - Recommends suitable weather conditions
- **Lifestyle needs** - Matches pace of life, cultural events, healthcare access

### 4. **Practical Travel Advice**
- Best time of year to visit
- Approximate driving times between destinations
- "Must-see" aspects of each town for retirement evaluation
- Accommodation suggestions

## 📋 Example Queries Scotty Excels At

### Canada Exploration
```
"I'm interested in Canada and have 7 days. If I fly into Vancouver,
what towns should I visit to get a good feel for retirement options?"
```

```
"Starting from Toronto, I want to spend 10 days exploring Ontario
retirement towns. What's the best route?"
```

```
"I have a week to explore Nova Scotia retirement options.
Which towns should I visit and in what order?"
```

### Multi-Country European Trip
```
"I have 14 days to explore Portugal and Spain. Starting from Lisbon,
what's the best retirement town exploration route?"
```

### Regional Deep Dive
```
"I want to spend 5 days around Victoria, BC exploring small towns
nearby. What should my itinerary look like?"
```

## 🎯 How Scotty Builds Itineraries

### Step 1: Understand Context
- Checks user's favorited towns
- Reviews user's climate/budget/lifestyle preferences
- Identifies starting airport location

### Step 2: Geographic Filtering
- Calculates practical travel radius (typically 3-5 hours drive max)
- Identifies towns in Scout2Retire database within that area
- Ensures geographic diversity in selections

### Step 3: Itinerary Optimization
- Creates logical driving routes (minimize backtracking)
- Suggests 1-2 nights per town for proper evaluation
- Balances different town types (coastal, mountain, urban, rural)

### Step 4: Enrichment
- Adds specific things to evaluate in each town
- Suggests best neighborhoods to explore
- Recommends local resources (expat groups, healthcare facilities)

## 💡 Tips for Best Results

### Be Specific About:
1. **Starting point** - "Vancouver airport" vs. just "Vancouver"
2. **Time available** - "7 days" vs. "a week or so"
3. **Transportation** - Scotty assumes car rental unless told otherwise
4. **Priorities** - "Focus on coastal towns" or "I want to see mountain communities"

### Sample Perfect Query:
```
"I'm flying into Montreal and renting a car. I have 8 days to explore
Quebec and maritime provinces. I love coastal towns with good healthcare
and moderate cost of living. What route should I take?"
```

## 🚀 Advanced Features

### Seasonal Recommendations
Scotty knows:
- Best times to visit different regions
- Seasonal events that help evaluate community life
- Weather considerations for retirees

### Budget-Conscious Planning
- Suggests accommodation types
- Identifies free/low-cost ways to evaluate towns
- Recommends talking to local retirees/expats

### Integration with Favorites
- If you've favorited towns, Scotty will try to include them
- Suggests similar towns you haven't discovered yet
- Creates routes that connect your interests

## 📊 Data Scotty Uses

Scotty has access to:
- **343 towns** across multiple countries
- **Latitude/longitude coordinates** for distance calculations
- **Full retirement data**: costs, climate, healthcare, lifestyle
- **Your personal preferences** and favorited towns
- **Regional geography** to optimize routes

## 🎬 Getting Started

### For Shabnam's Canada Exploration:

**Example 1: Vancouver Start**
```
"Scotty, I'm interested in exploring Canada for retirement.
I have 7 days and I'll be flying into Vancouver. What towns
should I visit to get a good overview of retirement options
in British Columbia?"
```

**Expected Response Format:**
```
Great news! With 7 days starting from Vancouver, I can help you
explore some wonderful BC retirement towns. Here's a route that
balances coastal charm, mountain beauty, and practical amenities:

Day 1-2: Victoria (90-min ferry from Vancouver)
- Why: Mild climate, strong healthcare, active retiree community
- What to check: Oak Bay neighborhood, healthcare facilities

Day 3-4: Nanaimo (short drive north from Victoria)
- Why: Lower costs than Victoria, excellent outdoor access
- What to check: Cost of living, waterfront lifestyle

[continues with optimized route...]

Would you like me to provide more details about any of these towns?
```

### Conversation Flow
1. **Start broad**: Ask about the region and timeframe
2. **Get specific**: Scotty asks about priorities
3. **Receive itinerary**: Detailed day-by-day plan
4. **Drill down**: Ask about specific towns
5. **Refine**: Adjust based on preferences

## 🔧 Technical Implementation

### How It Works:
1. User query triggers Scotty's persona
2. Scotty receives user context (favorites, preferences, budget)
3. Query is sent to Claude Haiku with:
   - Available towns list (with coordinates)
   - User preferences
   - Travel planning instructions
4. Scotty generates personalized itinerary
5. Conversation saved to database for future reference

### Behind the Scenes:
- **Model**: Claude 3 Haiku (fast, cost-effective)
- **Context window**: Includes last 4 message exchanges
- **Database integration**: All towns with photos and complete data
- **Geographic calculations**: Approximate distances via lat/long

## ⚠️ Limitations

### What Scotty CANNOT Do:
- **Book travel** - Scotty provides recommendations only
- **Real-time availability** - Can't check hotel availability
- **Visa processing** - Advises to consult professionals
- **Exact distances** - Uses approximate calculations
- **Towns without data** - Can only recommend towns in our database

### When to Consult Professionals:
- Immigration/visa specifics
- Tax implications of moving
- Legal requirements
- Healthcare coverage details
- Property purchase legalities

## 📈 Future Enhancements (Planned)

- Integration with Google Maps for exact routes
- Real-time weather forecasts for trip planning
- Estimated trip costs (fuel, accommodation)
- Links to local expat Facebook groups
- Downloadable PDF itineraries

## 🎯 Success Metrics

Scotty is successful when users:
1. Feel confident about which towns to visit
2. Understand what to evaluate in each location
3. Have a practical, executable travel plan
4. Can make informed decisions about retirement destinations

---

**Last Updated**: October 14, 2025
**Version**: 1.0
**Next Review**: When new features are added

## 🤝 Feedback

If Scotty's travel planning could be improved:
- Note specific query types that don't work well
- Suggest additional data Scotty should consider
- Report inaccurate geographic suggestions
