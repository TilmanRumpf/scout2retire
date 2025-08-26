# Safety Rating Implementation Plan

## Instead of crime_index, implement safety_rating (1-10 scale)

### Approach:
1. **Country-level baseline** from Global Peace Index (1-5 → convert to 1-10)
2. **City adjustments** based on:
   - Capital cities: -0.5 (typically higher crime)
   - Tourist areas: +0.5 (better policed)
   - Known safe retirement hubs: +1
   - Travel advisory warnings: -1 to -3

### Data Sources (ALL FREE):

#### 1. Global Peace Index 2024
- Download: https://www.visionofhumanity.org/resources/
- Format: Excel with 163 countries
- Provides: Safety score we can normalize

#### 2. US State Department Travel Advisories
- API: https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html
- Levels: 1 (safe) to 4 (do not travel)
- Coverage: All countries

#### 3. For US Cities specifically:
- Use relative safety within the US (all Level 1)
- Focus on retirement-friendly indicators:
  - Retirement community presence
  - Healthcare quality
  - Walkability scores

### Implementation Priority:
1. Start with manual safety ratings for top 50 retirement destinations
2. Use country baselines for the rest
3. Refine based on user feedback

### Sample Ratings:
- Singapore: 9.5 (very safe)
- Portugal cities: 8.5 (safe for retirees)
- US cities: 7-8.5 (varies by location)
- Mexico beach towns: 6.5-7.5 (tourist areas safer)
- Major capitals: -0.5 from country baseline

This approach is:
- ✅ Free
- ✅ Immediately implementable
- ✅ Good enough for matching
- ✅ Can be refined over time