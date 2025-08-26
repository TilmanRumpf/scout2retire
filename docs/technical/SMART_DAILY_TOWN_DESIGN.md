# Smart Daily Town Selection Algorithm

## Current Problem
The getTownOfTheDay function randomly selects ANY town, leading to users who want Mediterranean towns seeing towns in Asia or South America. This breaks user trust and expectations.

## Smart Solution: Geographic Relevance Tiers

### Tier 1: EXACT MATCH (Highest Priority)
- Towns in user's selected countries
- Towns in user's selected regions
- Towns matching user's geographic features (coastal, mountain, etc.)

### Tier 2: NEIGHBORING COUNTRIES (Good Match)
**Define "neighbors" intelligently:**
- Spain ↔ Portugal, France, Italy (not just border, but cultural proximity)
- Italy ↔ France, Switzerland, Austria, Greece, Croatia
- Netherlands ↔ Belgium, Germany, Denmark
- USA ↔ Canada, Mexico

**Region Groups (treat as neighbors):**
- Mediterranean: Spain, France, Italy, Greece, Croatia, Portugal, Malta, Cyprus
- Nordic: Denmark, Sweden, Norway, Finland, Iceland
- Central Europe: Germany, Austria, Switzerland, Czech Republic, Poland
- Balkans: Croatia, Slovenia, Serbia, Albania, Greece
- Iberian: Spain, Portugal
- British Isles: UK, Ireland

### Tier 3: SAME CONTINENT (Acceptable)
- Europe → Any European country
- North America → USA, Canada, Mexico
- South America → Any South American country
- Asia → Any Asian country

### Tier 4: RANDOM (Last Resort)
- Only if user has NO geographic preferences
- Or if no towns available in Tiers 1-3

## Special Cases

### Spain Mediterranean/Atlantic Confusion
**Problem:** Users select "Mediterranean" not knowing Spain has Atlantic coast
**Solution:** 
- If user selects "Mediterranean" → Include ALL Spanish towns
- If user selects "Spain" → Include both coasts
- If user selects "Atlantic" → Include Spanish Atlantic towns

### Island Nations
- If user wants "Island" → Prioritize island nations/towns
- Include: Malta, Cyprus, Caribbean islands, Canary Islands, Balearic Islands

### Climate-Based Expansion
- If user wants "Tropical" → Include all tropical regions
- If user wants "Mediterranean climate" → Include California, Chile, South Africa (similar climates)

## Implementation Algorithm

```javascript
function getSmartTownOfTheDay(userId) {
  const userPrefs = getUserPreferences(userId);
  
  // Build town pools by tier
  const tier1Towns = getTier1Towns(userPrefs); // Exact matches
  const tier2Towns = getTier2Towns(userPrefs); // Neighbors
  const tier3Towns = getTier3Towns(userPrefs); // Same continent
  const tier4Towns = getAllTowns();            // Random fallback
  
  // Select from highest available tier
  if (tier1Towns.length > 0) {
    return selectRandom(tier1Towns);
  } else if (tier2Towns.length > 0) {
    return selectRandom(tier2Towns);
  } else if (tier3Towns.length > 0) {
    return selectRandom(tier3Towns);
  } else {
    return selectRandom(tier4Towns);
  }
}
```

## Neighbor Definitions

```javascript
const COUNTRY_NEIGHBORS = {
  'Spain': ['Portugal', 'France', 'Italy', 'Morocco', 'Malta'],
  'Portugal': ['Spain', 'France', 'Morocco'],
  'France': ['Spain', 'Italy', 'Switzerland', 'Belgium', 'Germany', 'UK'],
  'Italy': ['France', 'Switzerland', 'Austria', 'Slovenia', 'Croatia', 'Greece', 'Malta'],
  'Greece': ['Italy', 'Turkey', 'Bulgaria', 'Albania', 'Cyprus'],
  'Netherlands': ['Belgium', 'Germany', 'UK', 'Denmark'],
  'Germany': ['Netherlands', 'Belgium', 'France', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Denmark'],
  'USA': ['Canada', 'Mexico'],
  'Canada': ['USA'],
  'Mexico': ['USA', 'Guatemala', 'Belize'],
  // ... more as needed
};

const REGION_GROUPS = {
  'Mediterranean': ['Spain', 'France', 'Italy', 'Greece', 'Croatia', 'Turkey', 'Cyprus', 'Malta', 'Portugal'],
  'Nordic': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
  'Central Europe': ['Germany', 'Austria', 'Switzerland', 'Czech Republic', 'Poland', 'Hungary'],
  'Balkans': ['Croatia', 'Slovenia', 'Serbia', 'Albania', 'Greece', 'Bosnia', 'Montenegro'],
  'Iberian': ['Spain', 'Portugal'],
  'Caribbean': ['Barbados', 'Jamaica', 'Bahamas', 'Trinidad', 'Dominican Republic'],
  // ... more as needed
};
```

## Expected User Experience

### User selects Spain + Mediterranean:
- **Tier 1:** All Spanish towns (including Atlantic coast)
- **Tier 2:** Portugal, France, Italy, Malta
- **Tier 3:** Any European town
- **Never:** Asian or American towns

### User selects Netherlands + Coastal:
- **Tier 1:** Dutch coastal towns
- **Tier 2:** Belgian, German, Danish coastal towns
- **Tier 3:** Any European coastal town
- **Never:** Inland towns or non-European unless last resort

### User selects "Mediterranean" region only:
- **Tier 1:** Any Mediterranean country
- **Tier 2:** Portugal (culturally similar), Middle East coastal
- **Tier 3:** Other European towns
- **Never:** Northern Europe, Americas (unless no other options)

## Benefits
1. Users see relevant towns that match their interests
2. Still provides variety within geographic bounds
3. Educates users about neighboring options they might not have considered
4. Builds trust by respecting preferences
5. Handles edge cases like Spain's dual coasts intelligently