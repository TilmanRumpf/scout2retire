# Quality of Life Column Analysis

**Date**: 2025-10-19
**Analyzed**: 352 towns in Scout2Retire database

## Executive Summary

The `quality_of_life` column contains a **1-10 scale score** representing overall quality of life assessment for each town. This is a **composite metric** that combines multiple factors including healthcare, safety, and general livability.

## Data Coverage

- **Total towns**: 352
- **Towns with quality_of_life score**: 352 (100%)
- **Towns with healthcare_score**: 352 (100%)
- **Towns with safety_score**: 352 (100%)
- **Towns with cost_index**: 351 (99.7%)

## Score Distribution

| Score | Count | Percentage | Description |
|-------|-------|------------|-------------|
| 9 | 192 towns | 54.5% | Excellent quality of life |
| 8 | 150 towns | 42.6% | Very good quality of life |
| 7 | 9 towns | 2.6% | Good quality of life |
| 6 | 1 town | 0.3% | Acceptable quality of life |

## Statistical Summary

- **Minimum**: 6
- **Maximum**: 9
- **Average**: 8.51
- **Median**: 9 (since 54.5% have score of 9)

## Score Interpretation

### Score 9 (192 towns - 54.5%)
**Excellent quality of life** - Top-tier destinations with strong healthcare, high safety, and exceptional livability.

**Example towns**:
- Funchal (Madeira), Portugal - healthcare: 9, safety: 9, cost: 65
- Bruges, Belgium - healthcare: 9, safety: 9, cost: 65
- Braga, Portugal - healthcare: 9, safety: 9, cost: 55
- Malaga, Spain - healthcare: 8, safety: 9, cost: 65
- Valencia, Spain - healthcare: 8, safety: 8, cost: 65

**Characteristics**:
- Healthcare scores: 8-9
- Safety scores: 7-9
- Cost index: 45-85
- Typically European cities, select North American/Australian locations, and premium Latin American destinations

### Score 8 (150 towns - 42.6%)
**Very good quality of life** - Solid retirement destinations with reliable infrastructure and services.

**Example towns**:
- Puerto Vallarta, Mexico - healthcare: 8, safety: 7, cost: 55
- Gainesville, USA - healthcare: 8, safety: 8, cost: 80
- Annapolis Royal, Canada - healthcare: 8, safety: 9, cost: 80
- Colonia del Sacramento, Uruguay - healthcare: 8, safety: 7, cost: 55
- El Gouna, Egypt - healthcare: 8, safety: 8, cost: 45

**Characteristics**:
- Healthcare scores: 7-8
- Safety scores: 6-9
- Cost index: 40-80
- Mix of established expat destinations, emerging markets, and smaller North American cities

### Score 7 (9 towns - 2.6%)
**Good quality of life** - Developing destinations or locations with specific trade-offs.

**Example towns**:
- Phnom Penh, Cambodia - healthcare: 7, safety: 6, cost: 35
- Kathmandu, Nepal - healthcare: 7, safety: 6, cost: 40
- Dakar, Senegal - healthcare: 7, safety: 7, cost: 45
- Ostuni, Italy - healthcare: 7, safety: 8, cost: 75
- Truro, Canada - healthcare: 7, safety: 8, cost: 79

**Characteristics**:
- Healthcare scores: 7
- Safety scores: 6-8
- Cost index: 35-79
- Adventure destinations, developing markets, or remote/rural locations

### Score 6 (1 town - 0.3%)
**Acceptable quality of life** - Frontier destination with significant challenges.

**Only town**:
- Bubaque, Guinea-Bissau - healthcare: 3, safety: 7, cost: N/A

**Characteristics**:
- Very low healthcare (score: 3)
- Limited infrastructure
- Remote/frontier location

## Relationship to Other Metrics

### Healthcare Score Correlation
- Quality 9 towns typically have healthcare scores of 8-9
- Quality 8 towns typically have healthcare scores of 7-8
- Quality 7 towns typically have healthcare scores of 7
- Quality 6 town has healthcare score of 3

### Safety Score Correlation
- Quality 9 towns typically have safety scores of 7-9
- Quality 8 towns typically have safety scores of 6-9
- Quality 7 towns typically have safety scores of 6-8
- Quality 6 town has safety score of 7

### Cost Index Relationship
- Quality of life scores are **NOT strongly correlated with cost**
- Score 9 towns range from cost 45 (Merida, Mexico) to 85 (Chapel Hill, USA)
- Score 8 towns range from cost 40 (Pondicherry, India) to 80 (Annapolis Royal, Canada)
- Lower cost does not necessarily mean lower quality of life

## Regional Patterns

### Regions with highest concentration of Score 9 towns:
1. **Europe**: Portugal, Spain, France, Italy, Croatia, Netherlands, Belgium, Ireland
2. **Latin America**: Mexico (select coastal destinations)
3. **Australia/Pacific**: Coastal Australian cities
4. **North America**: Select Canadian and US locations

### Regions with more Score 8 towns:
1. **Latin America**: Mexico, Central America, Uruguay, Dominican Republic
2. **Asia**: India, Fiji
3. **North America**: Smaller Canadian cities, US college towns
4. **Africa**: Egypt (El Gouna)

### Regions with Score 7 towns:
1. **Asia**: Cambodia, Nepal
2. **Africa**: Senegal, Egypt (Cairo)
3. **Latin America**: Paraguay
4. **Pacific**: Solomon Islands
5. **Europe**: Italy (Ostuni - outlier)
6. **North America**: Canada (small towns)

## Usage Recommendations

### For Search/Filtering
- Use `quality_of_life >= 9` for premium/top-tier destinations
- Use `quality_of_life >= 8` for solid retirement options (covers 97.4% of database)
- Use `quality_of_life >= 7` for inclusive search including adventure destinations
- Consider combining with other filters:
  - `quality_of_life >= 8 AND cost_index <= 60` for value destinations
  - `quality_of_life >= 9 AND healthcare_score >= 9` for top healthcare
  - `quality_of_life >= 8 AND safety_score >= 8` for safety-focused search

### For Display/UI
- **Display as**: "Quality of Life: 9/10" or "Quality Rating: Excellent (9)"
- **Color coding**:
  - Score 9: Green/Excellent
  - Score 8: Light Green/Very Good
  - Score 7: Yellow/Good
  - Score 6: Orange/Acceptable

### For Comparisons
- Use as a **primary sorting metric** for browse/discovery
- Combine with cost_index for value comparisons
- Use alongside specific metrics (healthcare, safety) for detailed analysis

## Data Quality Notes

1. **100% coverage** - All towns have quality_of_life scores (excellent data quality)
2. **Narrow range** (6-9) - Indicates selective curation of destinations
3. **Right-skewed distribution** - Most towns (97.1%) score 8 or 9, suggesting database focuses on high-quality retirement destinations
4. **No score changes since last update** - Scores appear stable/established

## Related Columns

- `healthcare_score` - Component of quality_of_life (1-10 scale)
- `safety_score` - Component of quality_of_life (1-10 scale)
- `cost_index` - Independent metric (typically 35-90 range)
- **Note**: `overall_score` column does NOT exist in schema

## Query Examples

```sql
-- Get top quality destinations
SELECT name, country, quality_of_life, healthcare_score, safety_score, cost_index
FROM towns
WHERE quality_of_life >= 9
ORDER BY cost_index ASC;

-- Find value destinations (high quality, lower cost)
SELECT name, country, quality_of_life, cost_index
FROM towns
WHERE quality_of_life >= 8 AND cost_index <= 60
ORDER BY quality_of_life DESC, cost_index ASC;

-- Compare specific towns
SELECT name, quality_of_life, healthcare_score, safety_score, cost_index
FROM towns
WHERE name IN ('Valencia', 'Gainesville', 'Malaga', 'Puerto Vallarta');

-- Distribution analysis
SELECT quality_of_life, COUNT(*) as town_count
FROM towns
GROUP BY quality_of_life
ORDER BY quality_of_life DESC;
```

## Historical Context

- Column appears to be **manually curated** (not algorithmically calculated)
- Scores represent **editorial assessment** of overall livability
- May incorporate factors beyond healthcare/safety (cultural fit, expat community, infrastructure, etc.)
- Likely updated periodically based on research and user feedback

## Recommendations for Future Use

1. **Consider adding more granularity** - Current 6-9 range could expand to full 1-10 scale for future destinations
2. **Document scoring methodology** - Create rubric for how quality_of_life scores are assigned
3. **Add score update dates** - Track when each town's score was last reviewed
4. **Consider subcategory scores** - Break down quality_of_life into specific components (infrastructure, culture, expat community, etc.)
5. **Add user ratings** - Complement editorial scores with user-submitted ratings

---

**Last Updated**: 2025-10-19
**Data Source**: Scout2Retire production database (352 towns)
**Analysis Method**: Direct database queries via Supabase SDK
