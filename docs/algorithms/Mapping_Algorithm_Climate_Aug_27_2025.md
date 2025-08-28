# Climate Algorithm (15% weight)
**Updated: August 27, 2025**

## Quick Reference
- **Summer Climate**: 25 points
- **Winter Climate**: 25 points
- **Humidity**: 15 points
- **Sunshine**: 15 points
- **Precipitation**: 10 points
- **Seasonal Variation**: 10 points

## Gradual Scoring System
All climate factors use adjacent category partial credit:
- **Exact match**: Full points
- **Adjacent category**: 60% points
- **Opposite ends**: 20% points
- **No preference**: Full points

## 1. Summer Climate (25 points)

### Temperature Categories
| Category | Temperature | Database Value |
|----------|------------|----------------|
| Hot | ≥30°C | "hot" |
| Warm | 20-30°C | "warm" |
| Mild | <20°C | "mild" |

### Scoring Matrix
| User Wants | Hot | Warm | Mild |
|------------|-----|------|------|
| Hot | 25 | 15 | 5 |
| Warm | 15 | 25 | 15 |
| Mild | 5 | 15 | 25 |
| None | 25 | 25 | 25 |

## 2. Winter Climate (25 points)

### Temperature Categories
| Category | Temperature | Database Value |
|----------|------------|----------------|
| Cold | <5°C | "cold" |
| Mild | 5-15°C | "mild" |
| Warm | ≥15°C | "warm" |

### Scoring Matrix
| User Wants | Cold | Mild | Warm |
|------------|------|------|------|
| Cold | 25 | 15 | 5 |
| Mild | 15 | 25 | 15 |
| Warm | 5 | 15 | 25 |
| None | 25 | 25 | 25 |

## 3. Humidity (15 points)

### Categories
| Level | Humidity % | Database Value |
|-------|-----------|----------------|
| Dry | <50% | "dry" |
| Moderate | 50-70% | "moderate" |
| Humid | ≥70% | "humid" |

### Scoring
| Match Type | Points |
|------------|--------|
| Exact | 15 |
| Adjacent | 10 |
| Opposite | 5 |
| No preference | 15 |

## 4. Sunshine (15 points)

### Categories
| Level | Hours/Year | Database Value |
|-------|------------|----------------|
| Sunny | >2,800 | "sunny" |
| Moderate | 2,000-2,800 | "less_sunny" |
| Cloudy | <2,000 | "cloudy" |

### Scoring
| Match Type | Points |
|------------|--------|
| Exact | 15 |
| Adjacent | 10 |
| Opposite | 5 |
| No preference | 15 |

## 5. Precipitation (10 points)

### Categories
| Level | Annual Rainfall | Database Value |
|-------|-----------------|----------------|
| Dry | <500mm | "dry" |
| Moderate | 500-1,000mm | "moderate" |
| Wet | ≥1,000mm | "often_rainy" |

### Scoring
| Match Type | Points |
|------------|--------|
| Exact | 10 |
| Adjacent | 7 |
| Opposite | 3 |
| No preference | 10 |

## 6. Seasonal Variation (10 points)

| User Preference | Town Has Distinct Seasons | Minimal Variation |
|-----------------|---------------------------|-------------------|
| Wants seasons | 10 | 3 |
| No seasons | 3 | 10 |
| No preference | 10 | 10 |

## Data Fallbacks

```javascript
// Summer climate from temperature
if (!summer_climate_actual && avg_temp_summer) {
  if (avg_temp_summer >= 30) return "hot";
  if (avg_temp_summer >= 20) return "warm";
  return "mild";
}

// Winter climate from temperature
if (!winter_climate_actual && avg_temp_winter) {
  if (avg_temp_winter < 5) return "cold";
  if (avg_temp_winter < 15) return "mild";
  return "warm";
}
```

## Key Implementation Notes
1. **Always use gradual scoring** - no binary pass/fail
2. **Adjacent categories** get partial credit
3. **No preference = perfect score**
4. **Use temperature data** as fallback when categories missing
5. **Case-insensitive** string comparisons

## Data Ranges
- Temperature: -15°C to 49°C
- Humidity: 30% to 85%
- Sunshine: 1,320 to 4,020 hours/year
- Rainfall: 0 to 3,900mm/year

---
*Version 2.2 - Simplified*