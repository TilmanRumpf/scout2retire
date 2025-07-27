# Scout2Retire Matching Algorithm Guide

## Table of Contents
1. [Overview](#overview)
2. [User Journey](#user-journey)
3. [Data Collection](#data-collection)
4. [The Matching Process](#the-matching-process)
5. [Scoring Categories](#scoring-categories)
6. [How Towns Are Ranked](#how-towns-are-ranked)
7. [Understanding Your Match Score](#understanding-your-match-score)
8. [Data Quality & Completeness](#data-quality--completeness)

---

## Overview

Scout2Retire uses a sophisticated matching algorithm to connect retirees with their ideal retirement destinations. The system analyzes your preferences across six major categories and compares them against our database of 71 curated retirement towns worldwide.

**Key Features:**
- Personalized matching based on your unique preferences
- Multi-factor scoring across lifestyle, budget, climate, and more
- Transparent scoring with clear explanations
- Adaptive algorithm that handles incomplete data gracefully

---

## User Journey

### 1. Sign Up (Basic Information)
When you create an account, we collect:
- **Email address** - For account access
- **Full name** - For personalization
- **Current location** (optional) - To understand your starting point

### 2. Onboarding (7 Steps)
After signup, you complete a comprehensive questionnaire:

**Step 1: Current Status**
- Retirement timeline (planning, soon, already retired)
- Target retirement date
- Family situation (single, couple, with family)
- Citizenship (affects visa requirements)
- Pet ownership (for pet-friendly locations)

**Step 2: Region Preferences**
- Preferred continents/regions
- Specific countries of interest
- Geographic features (coastal, mountains, urban, rural)
- Proximity preferences

**Step 3: Climate Preferences**
- Summer temperature preference (cool, mild, warm, hot)
- Winter temperature preference
- Humidity tolerance
- Sunshine importance
- Rainfall preferences
- Seasonal preference (no preference, all seasons, warm seasons, cool seasons)

**Step 4: Culture & Lifestyle**
- Pace of life (slow, moderate, fast)
- Urban vs rural preference
- Language comfort level
- Expat community size preference
- Cultural amenities importance

**Step 5: Activities & Hobbies**
- Primary hobbies (golf, hiking, arts, etc.)
- Social preferences
- Travel frequency
- Wellness activities

**Step 6: Administration & Healthcare**
- Healthcare quality requirements
- Safety importance
- Visa ease preferences
- Political stability needs
- Special medical requirements

**Step 7: Budget**
- Total monthly budget
- Maximum rent budget
- Budget flexibility
- Tax sensitivity

### 3. Town Discovery
After onboarding, you can browse personalized town recommendations ranked by match percentage.

---

## Data Collection

### What We Store

#### From Signup (`users` table):
```
- id (unique identifier)
- email
- full_name
- hometown (optional)
- created_at
- onboarding_completed (true/false)
```

#### From Onboarding (`onboarding_responses` table):
```json
{
  "current_status": {
    "citizenship": "USA",
    "timeline": "within_2_years",
    "family_situation": "couple"
  },
  "region_preferences": {
    "countries": ["Portugal", "Spain", "Italy"],
    "regions": ["Europe", "Mediterranean"],
    "geographic_features": ["Coastal", "Historic"]
  },
  "climate_preferences": {
    "summer_climate_preference": "warm",
    "winter_climate_preference": "mild",
    "humidity_level": "moderate",
    "sunshine": "abundant",
    "precipitation": "moderate"
  },
  "culture_preferences": {
    "language_comfort": {
      "preferences": ["english_only"]
    },
    "expat_community_preference": "moderate",
    "lifestyle_preferences": {
      "pace_of_life": "relaxed",
      "urban_rural": "small_city"
    }
  },
  "hobbies": {
    "activities": ["water_sports", "hiking", "photography"],
    "interests": ["cultural", "culinary", "coastal"]
  },
  "administration": {
    "healthcare_quality": ["good"],
    "safety_importance": ["good"],
    "visa_preference": ["functional"]
  },
  "costs": {
    "total_monthly_budget": 3000,
    "max_monthly_rent": 1200
  }
}
```

---

## Scoring Philosophy: "No Preference = Open to All"

### Core Principle
**When you don't specify preferences in a category, you receive 100% match for that category in ALL towns.**

This fundamental design principle ensures that:
- Not selecting preferences means "I'm flexible" or "I don't mind"
- You see MORE options when you're open-minded, not fewer
- Only when you SELECT specific preferences do we filter results

### Examples

**Example 1: Budget-Only User**
- Selects: Budget of $2000/month
- Leaves empty: All other preferences
- Result: 
  - Budget category: Scored based on town costs vs $2000
  - All other categories: 100% for every town
  - Outcome: Sees many affordable towns regardless of climate, location, etc.

**Example 2: Climate-Focused User**
- Selects: Warm summers, mild winters
- Leaves empty: Region, culture, hobbies, admin preferences
- Result:
  - Climate category: Only warm-climate towns score high
  - All other categories: 100% for every town
  - Outcome: Sees all warm-climate towns worldwide

**Example 3: No Preferences User**
- Selects: Nothing (skips all preferences)
- Result: All towns get 100% in all categories
- Outcome: Sees all 71 towns with photos, ranked by data quality

### Why This Matters
Traditional matching systems often penalize users for not having preferences, showing them nothing or random results. Our approach recognizes that retirement planning is about **discovery** - many users don't know what they want until they see it.

By giving 100% scores to empty preferences, we:
- Encourage exploration
- Avoid forcing artificial choices
- Respect that "no preference" is a valid preference
- Show the maximum number of viable options

---

## The Matching Process

### Step 1: Pre-filtering
Before scoring begins, the algorithm filters towns to improve performance:

1. **Photo Quality Filter** - Only shows towns with verified photos
2. **Budget Pre-filter** - Excludes towns way outside your budget range (50%-200%)
3. **Healthcare Pre-filter** - If you need excellent healthcare, excludes towns with poor facilities
4. **Safety Pre-filter** - If safety is critical, excludes towns with low safety scores

### Step 2: Individual Category Scoring
Each town is scored in 6 categories based on your preferences.

### Step 3: Weighted Total Calculation
Category scores are combined using these weights (optimized for 55+ retirees):
- Region: 20%
- Budget: 20%
- Administration: 20%
- Climate: 15%
- Culture: 15%
- Hobbies: 10%

### Step 4: Data Completeness Bonus
Towns with more complete data receive 0-5 bonus points to encourage data quality.

### Step 5: Final Ranking
Towns are sorted by total score (highest first) and presented with:
- Match percentage
- Top matching factors
- Category breakdown
- Any warnings or considerations

---

## Scoring Categories

### 1. Region Score (20% of total)
Evaluates geographic alignment:

**No Preferences = 100% Score**
If you don't select any countries, regions, geographic features, or vegetation types, all towns receive 100% for this category.

**Updated July 27, 2025**: Based on algorithm analysis, the region scoring was redesigned to prevent geographic bonuses from overriding core location preferences.

**New Scoring System (Total: 90 points → percentage):**

**1. Country/Region Match (Max 40 points):**
- **No preferences selected**: 40 points (100%)
- **Country match**: 40 points (100%)
- **Region match only (no country match)**: 30 points (75%)
- **No match**: 0 points

**2. Geographic Features (Max 30 points):**
- **No preferences selected**: 30 points (100%)
- **ANY feature matches**: 30 points (100%) - Binary scoring
- **No matches**: 0 points

**3. Vegetation Type (Max 20 points):**
- **No preferences selected**: 20 points (100%)
- **ANY type matches**: 20 points (100%) - Binary scoring
- **No matches**: 0 points

**Example scoring:**
- You want: Portugal, coastal location, Mediterranean vegetation
  - Town in Portugal (coastal, Mediterranean): 40 + 30 + 20 = 90/90 = 100%
  - Town in Spain (coastal, Mediterranean): 30 + 30 + 20 = 80/90 = 89%
  - Town in USA (coastal, wrong vegetation): 0 + 30 + 0 = 30/90 = 33%

**What changed:**
- Removed water proximity bonus (didn't exist in data)
- Binary scoring for features/vegetation (all or nothing)
- Strong preferences now properly respected

### 2. Climate Score (15% of total)
Matches your weather preferences:

**No Preferences = 100% Score**
If you don't select any climate preferences, all towns receive 100% for this category.

**What we check (when you have preferences):**
- **Summer climate** (21 points) - Hot, warm, mild, or cool?
- **Winter climate** (21 points) - How cold is too cold?
- **Humidity level** (17 points) - Dry, moderate, or humid? *[NEW: Gradual scoring]*
- **Sunshine hours** (17 points) - Sun worshipper or shade seeker? *[NEW: Gradual scoring]*
- **Rainfall** (9 points) - Desert dry or tropical wet? *[NEW: Gradual scoring]*
- **Seasonal preference** (15 points) - Do you prefer stable weather or distinct seasons?

**NEW: Temperature-Based Scoring**
When towns have actual temperature data, we use precise ranges:

**Summer Temperature Ranges (Marketing-Friendly):**
- Cool: Below 15°C (59°F)
- Mild: 15-22°C (59-72°F)
- Warm: 22-28°C (72-82°F) 
- Hot: 28°C+ (82°F+)

**Winter Temperature Ranges (Marketing-Friendly):**
- Cold: Below 5°C (41°F)
- Cool: 5-12°C (41-54°F)
- Mild: 12°C+ (54°F+)

**Gradual Scoring:**
- 100%: Temperature within your preferred range
- 80%: Within 2°C of the range
- 50%: Within 5°C of the range
- 20%: Within 10°C of the range
- 0%: More than 10°C from the range

**Example:** If you want "warm" summers (22-32°C) and the town has 25°C summers, you get 100%. If it has 20°C summers (2°C below range), you get 80%.

**Fallback logic:**
If temperature data is missing, we use string matching. If that's also missing, we parse the climate description (e.g., "Mediterranean climate" implies warm summers and mild winters).

**Seasonal Preference Scoring (15 points):**
This rewards flexibility or matches your seasonal preferences:

- **No preference selected** → 15 points - Maximum flexibility
- **"No specific preference"** → 15 points - Open to any seasonal pattern

- **"I prefer warm seasons"** → 15 points IF summer climate matches your preference
  - Checks if the town's summer climate aligns with what you selected
  - Only awards points if there's a good match
  - Example: You want "warm" summers and town has "warm" = 15 points

- **"I prefer cool seasons"** → 15 points IF winter climate matches your preference
  - Checks if the town's winter climate aligns with what you selected
  - Only awards points if there's a good match
  - Example: You want "cool" winters and town has "cool" = 15 points

- **"I enjoy all seasons equally"** → 15 points IF BOTH summer AND winter match
  - Must match both your summer preference AND winter preference
  - If either doesn't match, you get 0 points
  - Ensures the town truly offers what you want year-round

Note: Seasonal scoring only applies when towns have both summer and winter temperature data.

**NEW: Gradual Climate Scoring (Humidity, Sunshine, Precipitation)**
Instead of all-or-nothing matching, we now use intelligent gradual scoring:

**Humidity Scoring (17 points):**
- **Perfect match**: 17 points - Exactly what you want
- **Adjacent preference**: 12 points (70%) - Compatible but not perfect
  - Dry ↔ Balanced: You want dry, town is balanced = 12 points
  - Balanced ↔ Humid: You want balanced, town is humid = 12 points
- **Opposite preference**: 0 points - Incompatible (Dry ↔ Humid)

**Sunshine Scoring (17 points):**
- **Perfect match**: 17 points - Exactly what you want
- **Adjacent preference**: 12 points (70%) - Compatible but not perfect
  - Often Sunny ↔ Balanced: You want sunny, town is balanced = 12 points
  - Balanced ↔ Less Sunny: You want balanced, town is cloudy = 12 points
- **Opposite preference**: 0 points - Incompatible (Often Sunny ↔ Less Sunny)

**Precipitation Scoring (9 points):**
- **Perfect match**: 9 points - Exactly what you want
- **Adjacent preference**: 6 points (67%) - Compatible but not perfect
  - Mostly Dry ↔ Balanced: You want dry, town is moderate = 6 points
  - Balanced ↔ Often Rainy: You want moderate, town is wet = 6 points
- **Opposite preference**: 0 points - Incompatible (Mostly Dry ↔ Often Rainy)

**Smart Fallback Logic:**
When towns lack specific climate data, we intelligently infer from:
- **Sunshine hours** → Sunshine level (>2800h = Often Sunny, 2200-2800h = Balanced, <2200h = Less Sunny)
- **Annual rainfall** → Precipitation level (<400mm = Mostly Dry, 400-1000mm = Balanced, >1000mm = Often Rainy)
- **Climate description** → All factors (e.g., "Mediterranean" suggests balanced humidity and precipitation)

**Example Impact:**
- **Before**: User wants "dry" climate, town is "balanced" = 0 points
- **After**: User wants "dry" climate, town is "balanced" = 12/17 points
- **Result**: 30+ more points for realistic near-matches instead of harsh rejections!

### 3. Culture Score (15% of total)
Aligns lifestyle and cultural preferences:

**No Preferences = 100% Score**
If you don't select any language, lifestyle, or cultural preferences, all towns receive 100% for this category.

**What we check (when you have preferences):**
- **Language compatibility** (25 points)
  - **Primary language**: Uses actual town language data when available
  - **English proficiency**: Detailed scoring based on actual proficiency levels
    - Excellent: 22 points - Near-native communication
    - Good: 18 points - Conversational level
    - Moderate: 12 points - Basic communication
    - Basic: 8 points - Limited communication
    - None: 0 points - No English available
  - **Local language speakers**: Perfect match (25 points) if you speak the local language
  - **Language learners**: Bonus for Romance languages (easier for English speakers)
- **Expat community size** (20 points) - Large, moderate, or small?
- **Pace of life** (20 points) - Relaxed, moderate, or fast-paced?
- **Urban/rural character** (15 points) - City, suburb, or countryside?
- **Cultural amenities** (20 points) - Museums, dining, events

**Language Data Quality:**
We prioritize actual town language data over assumptions:

- **First priority**: Actual `primary_language` from town data
- **Second priority**: Actual `english_proficiency_level` ratings
- **Last resort**: Country-based estimation (only when data completeness < 60%)

**Data Quality Indicators:**
- Towns with complete language data get accurate scoring
- Towns using estimated language data receive a -2 point penalty
- Warning appears: "Language data estimated from country"

**Enhanced Country Mapping:**
Updated to handle special cases:
- Former British colonies (Malta, Singapore, South Africa) → English
- Multi-language countries (Switzerland → German, Belgium → Dutch)
- Tourist destinations get appropriate English proficiency assumptions

### 4. Hobbies Score (10% of total)
Matches activities and interests:

**No Preferences = 100% Score**
If you don't select any activities or interests, all towns receive 100% for this category.

**What we check (when you have preferences):**
- **Activity availability** (40 points) - Can you do your favorite activities?
- **Interest support** (30 points) - Cultural, culinary, outdoor, etc.
- **Lifestyle priorities** (30 points) - Shopping, wellness, events
- **Travel connectivity** (10 bonus points) - For frequent travelers

**Example scoring:**
- You want: Water sports, hiking, photography
- Town offers: Beaches, hiking trails, scenic views
- Score: High match on all activities

### 5. Administration Score (20% of total)
Evaluates practical considerations:

**No Preferences = 100% Score**
If you don't select any healthcare, safety, or visa preferences, all towns receive 100% for this category.

**What we check (when you have preferences):**
- **Healthcare quality** (30 points) *[NEW: Gradual scoring]*
  - **Good preference** (ideal 9+): 100% at 9.0+, 80% at 8.0+, 60% at 7.0+, 40% at 6.0+, 20% at 5.0+
  - **Functional preference** (ideal 7+): 100% at 7.0+, 80% at 6.0+, 60% at 5.0+
  - **Basic preference** (ideal 5+): 100% at 5.0+, 67% at 4.0+
- **Safety rating** (25 points) *[NEW: Gradual scoring]* - Same gradual approach as healthcare
- **Visa/residency ease** (20 points)
  - Checks your citizenship against visa requirements
  - Retirement visa availability
- **Environmental health** (15 points) - For those with sensitivities
- **Political stability** (10 points) - For long-term security

**NEW: Gradual Healthcare & Safety Scoring**
Instead of harsh all-or-nothing thresholds, we now use intelligent gradual scoring:

**Example: User wants "Good" healthcare**
- **Score 9.0+**: 30 points - "Healthcare exceeds requirements"
- **Score 8.5**: 24 points - "Healthcare very good quality" (was 0 points!)
- **Score 7.2**: 18 points - "Healthcare acceptable quality" (was 0 points!)
- **Score 6.8**: 12 points - "Healthcare below ideal but adequate"
- **Score 5.1**: 6 points - "Healthcare concerns about quality"
- **Score 4.5**: 0 points - "Healthcare inadequate quality"

**Impact**: A town with 8.5 healthcare score now gets 80% of points instead of harsh 0 points!

### 6. Budget Score (20% of total)
Ensures financial feasibility:

**No Preferences = 100% Score**
If you don't specify any budget, all towns receive 100% for this category.

**What we check (when you have a budget):**
- **Overall affordability** (40 points)
  - Ratio > 1.5: Comfortable (40 pts)
  - Ratio > 1.2: Good fit (30 pts)
  - Ratio > 1.0: Adequate (20 pts)
  - Ratio > 0.8: Tight (10 pts)
- **Rent budget match** (30 points) - Can you afford housing?
- **Healthcare costs** (20 points) - Medical expense planning
- **Comprehensive tax scoring** (15 points) *[NEW: Complete tax analysis]*

**NEW: Comprehensive Tax Scoring (15 points)**
*Only applies to tax-sensitive users - those who checked tax sensitivity boxes during onboarding*

**Tax Rate Scoring (80% of tax points):**
We analyze each tax type you care about with gradual scoring:

**Income Tax Rates:**
- 0-10%: Excellent (5/5 points) - "Income tax excellent rate"
- 10-20%: Good (4/5 points) - "Income tax good rate"  
- 20-30%: Fair (3/5 points) - "Income tax fair rate"
- 30-40%: High (2/5 points) - "Income tax high rate"
- 40%+: Very High (1/5 points) - "Income tax very high rate"

**Property Tax Rates:**
- 0-1%: Excellent (5/5 points) - "Property tax excellent rate"
- 1-2%: Good (4/5 points) - "Property tax good rate"
- 2-3%: Fair (3/5 points) - "Property tax fair rate"
- 3-4%: High (2/5 points) - "Property tax high rate"
- 4%+: Very High (1/5 points) - "Property tax very high rate"

**Sales Tax Rates:**
- 0-8%: Excellent (5/5 points) - "Sales tax excellent rate"
- 8-15%: Good (4/5 points) - "Sales tax good rate"
- 15-20%: Fair (3/5 points) - "Sales tax fair rate"
- 20-25%: High (2/5 points) - "Sales tax high rate"
- 25%+: Very High (1/5 points) - "Sales tax very high rate"

**Tax Benefits Bonus (20% of tax points):**
- **US Tax Treaty**: +1 point - "US tax treaty available"
- **Tax Haven Status**: +2 points - "Recognized tax haven"
- **Foreign Income Not Taxed**: +1 point - "Foreign income not taxed"

**Examples:**
- **Best case**: User sensitive to all 3 taxes, town has 5% income, 0.5% property, 6% sales tax + tax treaty + tax haven = 15/15 points
- **Worst case**: User sensitive to all 3 taxes, town has 45% income, 5% property, 30% sales tax = 2/15 points
- **Mixed**: User only cares about income tax, town has 15% rate = 10/15 points (good rate gets 4/5, scaled to 10 points)
- **Not tax-sensitive**: 8/15 points regardless of rates - "Tax rates not a priority"

**Data Quality:**
- Towns without tax data get -1 penalty if you're tax-sensitive
- We use structured JSON tax data when available, fall back to individual tax rate fields
- Only 7% of towns currently have complete tax data (opportunity for improvement!)

---

## How Towns Are Ranked

### The Ranking Process

1. **Calculate Raw Scores**
   Each town gets 0-100 points in each category

2. **Apply Weights**
   ```
   Total = (Region × 0.20) + (Climate × 0.15) + (Culture × 0.15) + 
           (Hobbies × 0.10) + (Admin × 0.20) + (Budget × 0.20)
   ```

3. **Add Data Bonus**
   +0 to +5 points based on data completeness

4. **Generate Match Quality**
   - 85-100: Excellent Match
   - 70-84: Very Good Match
   - 55-69: Good Match
   - 40-54: Fair Match
   - Below 40: Poor Match

5. **Sort by Score**
   Highest scores appear first

### Example Calculation

**Town: Lisbon, Portugal**
**User: Wants coastal, warm climate, English-friendly, $3000 budget**

```
Region Score: 85/100 (Portugal + Coastal)
Climate Score: 90/100 (Mediterranean, warm)
Culture Score: 70/100 (Moderate English, relaxed pace)
Hobbies Score: 80/100 (Beach activities, cultural sites)
Admin Score: 85/100 (Good healthcare, easy visa)
Budget Score: 95/100 (Very affordable)

Weighted Total = (85×0.20) + (90×0.15) + (70×0.15) + 
                 (80×0.10) + (85×0.20) + (95×0.20)
               = 17 + 13.5 + 10.5 + 8 + 17 + 19
               = 85%

Data Bonus: +3 (good data completeness)
Final Score: 86% - Excellent Match!
```

---

## Understanding Your Match Score

### What the Numbers Mean

**90-100% - Perfect Match**
- Meets all your major criteria
- No significant compromises
- Highly recommended for visits

**80-89% - Excellent Match**
- Aligns with most preferences
- Minor compromises only
- Strong recommendation

**70-79% - Very Good Match**
- Good overall fit
- Some preferences not fully met
- Worth serious consideration

**60-69% - Good Match**
- Decent alignment
- Several compromises needed
- Could work with adjustments

**50-59% - Fair Match**
- Some alignment
- Significant compromises
- Might work for flexible retirees

**Below 50% - Poor Match**
- Limited alignment
- Major compromises required
- Generally not recommended

### Understanding Match Factors

Each town shows its top 5 positive factors, such as:
- "Perfect summer climate match" (+25)
- "English widely spoken" (+25)
- "Comfortable budget margin" (+40)
- "Coastal preference matched" (+30)
- "Healthcare meets requirements" (+30)

And any warnings:
- "Language barrier: Primary language is Greek"
- "Budget tight but possible"
- "Limited data available"

---

## Data Quality & Completeness

### Why Data Matters

Towns with complete data can be matched more accurately. We track 18 important fields:
- Basic: cost, healthcare, safety scores
- Climate: seasonal temperatures, humidity, sunshine
- Culture: language, expat community, pace of life
- Activities: available activities and interests
- Financial: living costs, tax rates

### Completeness Scoring

- **80-100% complete**: +4-5 bonus points
- **60-79% complete**: +2-3 bonus points  
- **40-59% complete**: +1 bonus point
- **Below 40%**: -2 penalty points

This encourages data improvement while not overly penalizing towns with missing data.

### Handling Missing Data

The algorithm uses smart fallbacks:
- **Missing language**: Assumes based on country
- **Missing climate data**: Parses climate description
- **Missing activities**: No penalty, just no bonus points

---

## Future Improvements

We're constantly improving the matching algorithm:

1. **Machine Learning** - Learning from user feedback
2. **More Data Fields** - Pet policies, internet speed, etc.
3. **User Feedback Loop** - Rate your matches to improve recommendations
4. **Partner Preferences** - Matching for couples with different priorities
5. **Regional Cost Variations** - Different costs for urban vs rural areas within towns

---

## Recent Updates

### July 27, 2025 - Climate Preference Alignment
We've improved how climate preferences work to ensure what you see in the UI exactly matches what's stored in our database:

**What changed:**
- When you select "Often Sunny", it now saves exactly as "often_sunny"
- When you select "Less Sunny", it now saves exactly as "less_sunny" 
- Previously, these were stored with different internal values that could cause confusion

**Why it matters:**
- Your preferences now persist correctly when you update them
- No more old selections appearing when you change your mind
- Climate matching is more accurate and predictable

**What you need to do:**
- Nothing! We've automatically updated all existing preferences
- Just continue using the system as normal

### July 27, 2025 - Smart Climate Data Enhancement
Based on analysis by Tobias, we've dramatically improved how we handle towns with incomplete climate data:

**The Challenge:**
- 83% of towns were missing humidity information
- Some towns had temperature readings but no climate descriptions
- This meant many great retirement destinations weren't matching properly

**Our Solution - Smart Inference System:**
When a town lacks specific climate data, we now intelligently infer it from:

1. **Climate descriptions** - We analyze text descriptions for keywords like "humid," "dry," or "mediterranean"
2. **Rainfall data** - Annual precipitation helps determine humidity (e.g., <400mm suggests dry conditions)
3. **Geographic features** - Coastal locations tend to be more humid, deserts are dry

**What this means for you:**
- **More towns to explore** - Towns previously hidden due to missing data now appear in your matches
- **Better matching accuracy** - We can now match your climate preferences against 100% of towns
- **Transparent data** - We'll always indicate when climate data is inferred vs. directly measured

**Example:**
If you prefer "dry" climates, a town with 250mm annual rainfall will now match your preference even if it lacks a specific humidity rating. The inference is based on the fact that low rainfall correlates with dry conditions.

**No action needed** - This enhancement works automatically to give you better, more complete results!

## Questions?

If you have questions about your match scores or want to understand why a particular town ranked high or low, please contact our support team. We're here to help you find your perfect retirement destination!

---

*Last updated: July 27, 2025*