# Geographic Database Schema Standards Research

## ISO Standards

### ISO 3166-1 (Country Codes)
- **Alpha-2**: 2-letter codes (US, AE, FR, CA)
- **Alpha-3**: 3-letter codes (USA, ARE, FRA, CAN)
- **Numeric**: 3-digit codes (840, 784, 250, 124)

### ISO 3166-2 (Subdivision Codes)
- **Format**: {Country}-{Subdivision} (US-FL, AE-AZ, CA-ON)
- **Subdivision only**: FL, AZ, ON (without country prefix)

## Industry Database Schema Examples

### GeoNames (Gold Standard for Geographic Data)
```
name              -- Place name
country           -- Full country name
country_code      -- ISO 3166-1 alpha-2 (US, AE)
admin1_code       -- First-level subdivision (state/province)
admin2_code       -- Second-level (county/district)
```

### Google Places API
```
name                          -- Place name
country                       -- Full country name
country_code                  -- ISO code
administrative_area_level_1   -- State/province/emirate
administrative_area_level_2   -- County/district
```

### PostgreSQL PostGIS with Natural Earth Data
```
name              -- City name
iso_a2            -- Country ISO code (US, AE)
admin              -- Country full name
region            -- Subdivision name
```

### UN/LOCODE (Location Codes)
```
location_name     -- Name of location
country_code      -- ISO 3166-1 alpha-2
subdivision       -- ISO 3166-2 subdivision
```

## Common Patterns

1. **Most keep `name` for place name** (not city_name, town_name, location_name)
2. **Most use both** `country` (full name) AND `country_code` (ISO)
3. **Subdivision naming varies**: admin1, subdivision, state_province, etc.

## Recommendation for Scout2Retire

### Option A: Add ISO codes alongside existing (LOW RISK)
```sql
-- Existing (keep for compatibility & readability)
name                -- Town/city name
country             -- Full country name (United States, United Arab Emirates)
region              -- Full subdivision name (Florida, Abu Dhabi, Ontario)

-- Add new (ISO standards)
country_code        -- ISO 3166-1 alpha-2 (US, AE, CA)
subdivision_code    -- ISO 3166-2 subdivision part only (FL, AZ, ON)
```

**Pros:**
- Zero breaking changes
- Backward compatible
- Industry standard codes available
- Display-friendly names still available

**Cons:**
- Some redundancy
- `name` still generic (but that's actually the standard)

### Option B: Full rename to match GeoNames (HIGH RISK)
```sql
-- Rename everything
name → city_name
country → country_name
region → subdivision_name

-- Add codes
country_code
subdivision_code
```

**Pros:**
- More explicit column names
- Easier for AI to find columns

**Cons:**
- **BREAKS 192 COLUMN TABLE**
- Update every query in entire codebase
- Update all React components
- Update scoring algorithms
- High risk of bugs

### Option C: Hybrid (MEDIUM RISK)
```sql
-- Keep most, rename selectively
name → location_name  -- Only rename this one for clarity
country               -- Keep as-is
region                -- Keep as-is

-- Add ISO codes
country_code
subdivision_code
```

## Final Recommendation

**Option A** - Add ISO columns without renaming.

**Why?**
- GeoNames (the world's largest geographic database) uses `name` - it's actually the standard
- Most databases have BOTH full names AND codes (not either/or)
- Zero risk of breaking existing code
- Claude can be trained to look for `name` column (this is a me problem, not a schema problem)

**Implementation:**
1. Add `country_code` VARCHAR(2) - ISO 3166-1 alpha-2
2. Add `subdivision_code` VARCHAR(6) - ISO 3166-2 subdivision only (FL, not US-FL)
3. Keep existing `name`, `country`, `region` for display
4. Populate 343 towns using ISO mappings

**Display Logic:**
```javascript
// Dropdown display
if (subdivision_code) {
  return `${name}, ${subdivision_code}`  // "Gainesville, FL"
} else if (region) {
  return `${name}, ${region}`            // "Chiang Mai, Northern Thailand"
} else {
  return `${name}, ${country}`           // fallback
}
```
