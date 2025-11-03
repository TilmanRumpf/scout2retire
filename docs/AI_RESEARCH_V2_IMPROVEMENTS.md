# AI Research Function V2 - From Hallucination to Reality

**Created:** 2025-11-03
**Status:** Designed (APIs need integration)
**Location:** `supabase/functions/ai-populate-new-town-v2/index.ts`

## The Problem

The original AI population function (`ai-populate-new-town`) had ONE massive flaw:

**It asked an LLM to "research" without actually researching.**

Result: 200+ outliers, systematic failures, and zero confidence in the data.

## What Changed

### V1 (OLD - Hallucination Mode)
```typescript
// Ask Claude to "research" comprehensive data
const prompt = "Research and provide COMPREHENSIVE data about ${location}";
const response = await claude.generate(prompt);

// Claude GUESSES based on training data
// No fact-checking, no sources, no verification
// Just plausible-sounding hallucinations
```

### V2 (NEW - Real Research Mode)
```typescript
// STEP 1: Geocoding API - Get accurate coordinates
const coords = await getCoordinates(townName, country);

// STEP 2: Weather API - Get real climate data
const weatherData = await getWeatherData(coords.lat, coords.lon);

// STEP 3: Numbeo API - Get real cost data
const costData = await getCostOfLivingData(townName, country);

// STEP 4: Web Search - Get factual information
const webSearchResults = await webSearch(`${townName} elevation meters`);

// STEP 5: AI Synthesis - Combine REAL data sources
const responseText = await researchWithSources(
  townName, country, region,
  webSearchResults,  // REAL web data
  apiData           // REAL API data
);

// STEP 6: Extract values AND citations
// Every value has a source: {"value": 123, "source": "geocoding API"}

// STEP 7: Validation - Check data quality
const validationErrors = validateData(updateData);

// STEP 8: Save with citations
updateData.data_citations = JSON.stringify(citations);
```

## Key Improvements

### 1. Web Search Integration
- Uses SerpAPI or Brave Search API
- Searches for specific facts (elevation, population, climate)
- Provides LLM with REAL search results to analyze

### 2. Geocoding API
- OpenCage or similar geocoding service
- Gets accurate latitude, longitude, elevation
- No more hallucinated coordinates

### 3. Weather API
- OpenWeatherMap or similar
- Real climate data (temperature, rainfall, sunshine)
- No more guessed weather patterns

### 4. Cost of Living API
- Numbeo API integration
- Real rental prices, cost indices
- No more fabricated costs

### 5. Source Citation Tracking
- Every field has a `source` attribution
- Stored in `data_citations` JSONB field
- Can trace where every value came from

### 6. Pre-Save Validation
- Checks ranges before saving
- Flags suspicious values
- Prevents obviously wrong data from entering database

## APIs Needed

### Required Integrations

1. **Geocoding**: OpenCage Geocoding API
   - Endpoint: `https://api.opencagedata.com/geocode/v1/json`
   - Cost: ~$50/month for 10,000 requests
   - Provides: lat, lon, elevation, timezone

2. **Weather**: OpenWeatherMap API
   - Endpoint: `https://api.openweathermap.org/data/2.5/`
   - Cost: Free tier available (1,000 calls/day)
   - Provides: temperature, rainfall, humidity, sunshine

3. **Web Search**: SerpAPI or Brave Search API
   - SerpAPI: $50/month for 5,000 searches
   - Brave: $5/1,000 searches
   - Provides: Actual web search results

4. **Cost of Living**: Numbeo API
   - Cost: ~$80/month
   - Provides: Rent, cost of living index, prices
   - Alternative: Scrape Numbeo website (within TOS)

## Implementation Status

### ✅ Completed
- [x] New function architecture designed
- [x] Source citation tracking system
- [x] Validation framework
- [x] Error handling for API failures
- [x] Documentation

### ⏳ Pending
- [ ] Add OpenCage API integration
- [ ] Add OpenWeatherMap API integration
- [ ] Add SerpAPI or Brave Search integration
- [ ] Add Numbeo API integration (or scraper)
- [ ] Test with 3 sample towns
- [ ] Deploy to Supabase
- [ ] Add API keys to Supabase secrets
- [ ] Create database migration for citations field

## Database Schema Changes Needed

```sql
-- Add citation tracking
ALTER TABLE towns ADD COLUMN IF NOT EXISTS data_citations JSONB;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS ai_populated BOOLEAN DEFAULT false;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS ai_populated_date TIMESTAMP;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS research_version TEXT;
ALTER TABLE towns ADD COLUMN IF NOT EXISTS validation_warnings JSONB;

-- Add data quality tracking
ALTER TABLE towns ADD COLUMN IF NOT EXISTS data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100);
ALTER TABLE towns ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP;

-- Create index for citation searches
CREATE INDEX IF NOT EXISTS idx_towns_data_citations ON towns USING gin(data_citations);
```

## Cost Estimate

Monthly API costs for ~350 towns + updates:

- OpenCage Geocoding: $50 (covers 10k requests)
- OpenWeatherMap: Free (well within 1k/day limit)
- SerpAPI: $50 (5k searches = ~15 queries per town)
- Numbeo: $80 (full access)

**Total: ~$180/month** for REAL research vs hallucinated garbage

## Testing Plan

### Phase 1: API Integration (1-2 days)
1. Set up API accounts
2. Add API keys to Supabase
3. Test each API with sample queries
4. Verify data quality

### Phase 2: Function Testing (1 day)
1. Deploy v2 function to Supabase
2. Test with 3 diverse towns:
   - Wuppertal, Germany (moderate climate, European)
   - Boulder, USA (high elevation, expensive)
   - Chiang Mai, Thailand (tropical, cheap)
3. Verify all citations present
4. Check validation warnings

### Phase 3: Outlier Verification (2-3 days)
1. Re-populate 10 worst outlier towns
2. Run outlier analysis again
3. Verify extreme outliers are fixed
4. Document improvements

## Success Metrics

### Before (V1):
- Outliers: 200+
- Extreme outliers (>3σ): 50+
- Source citations: 0
- Data confidence: Low
- User trust: Shaken

### Target (V2):
- Outliers: <50
- Extreme outliers (>3σ): <5
- Source citations: 100%
- Data confidence: High
- User trust: Restored

## Migration Path

### For New Towns
1. Use v2 function exclusively
2. Every field has citation
3. Validation prevents bad data

### For Existing Towns
1. Identify 50 towns with worst outliers
2. Re-populate using v2
3. Compare before/after quality
4. Gradually update remaining towns

## Lessons Applied

From `OUTLIER_FAILURE_ANALYSIS.md`:

✅ **No more guessing** - Web search for facts
✅ **No more hallucination** - Use real APIs
✅ **No more blind trust** - Validate before saving
✅ **No more untraceable data** - Cite every source
✅ **No more systematic errors** - Catch outliers before they enter DB

## Next Steps

1. **Get API keys** - Sign up for OpenCage, OpenWeather, SerpAPI, Numbeo
2. **Add to Supabase** - Configure secrets in Supabase dashboard
3. **Deploy v2** - Upload new function
4. **Test thoroughly** - 3 sample towns
5. **Re-populate outliers** - Fix worst 10 towns first
6. **Monitor results** - Run outlier analysis after each batch

---

**The Verdict:** V2 does REAL research. V1 was professional-grade bullshitting.
