# Onboarding Data Migration Strategy

## Overview
This document outlines the strategy for consolidating data from the `onboarding_responses` table into the `user_preferences` table.

## Current State
- **Total onboarding responses**: 8 users
- **Already migrated**: 1 user
- **Needs migration**: 7 users

## Data Structure Analysis

### Source: onboarding_responses
The onboarding data is stored as nested JSON objects with the following main sections:
- `current_status` - User's current situation
- `region_preferences` - Geographic preferences
- `climate_preferences` - Weather and climate preferences
- `culture_preferences` - Language, lifestyle, and cultural preferences
- `hobbies` - Activities and interests
- `costs` - Budget and financial preferences
- `administration` - Healthcare, visa, and administrative preferences

### Target: user_preferences
Flat table structure with individual columns for each preference.

## Field Mapping

### Current Status → User Preferences

| Source Path | Target Column | Transformation |
|------------|---------------|----------------|
| `current_status.citizenship.primary_citizenship` | `primary_citizenship` | Direct mapping |
| `current_status.citizenship.secondary_citizenship` | `secondary_citizenship` | Direct mapping |
| `current_status.citizenship.visa_concerns` | `visa_concerns` | Direct mapping |
| `current_status.family_situation` or `current_status.family_situation.status` | `family_status` | Handle both string and object formats |
| `current_status.family_situation.partner_agreement` | `partner_agreement` | Only when family_situation is object |
| `current_status.family_situation.bringing_children` | `bringing_children` | Only when family_situation is object |
| `current_status.family_situation.bringing_pets` | `bringing_pets` | Only when family_situation is object |
| `current_status.pet_owner` | `bringing_pets` | Convert array to boolean |
| `current_status.current_location` | `current_location` | Direct mapping |
| `current_status.moving_motivation` | `moving_motivation` | Direct mapping |
| `current_status.retirement_timeline.status` | `retirement_status` | Direct mapping |
| `current_status.retirement_timeline.target_year` | `target_retirement_year` | Direct mapping |
| `current_status.retirement_timeline.flexibility` | `timeline_flexibility` | Direct mapping |

### Partner Citizenship (Conditional)

| Source Path | Target Column | Condition |
|------------|---------------|-----------|
| `current_status.partner_citizenship.primary_citizenship` | `partner_primary_citizenship` | Only when family_status is 'couple' or 'family' |
| `current_status.partner_citizenship.secondary_citizenship` | `partner_secondary_citizenship` | Only when family_status is 'couple' or 'family' |

### Region Preferences

| Source Path | Target Column | Transformation |
|------------|---------------|----------------|
| `region_preferences.regions` + `region_preferences.continents` | `regions` | Merge both arrays, remove duplicates |
| `region_preferences.countries` | `countries` | Direct mapping |
| `region_preferences.provinces` | `provinces` | Direct mapping |
| `region_preferences.geographic_features` | `geographic_features` | Direct mapping |
| `region_preferences.vegetation_types` | `vegetation_types` | Direct mapping |

### Climate, Culture, Hobbies, Administration, and Costs
All other mappings follow a direct path from nested structure to flat columns.

## Migration Process

### Step 1: Database Preparation
```sql
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS partner_primary_citizenship TEXT,
  ADD COLUMN IF NOT EXISTS partner_secondary_citizenship TEXT;
```

### Step 2: Run Migration Script
```bash
node migrate-onboarding-to-preferences.js
```

### Step 3: Verify Migration
```sql
-- Check migration results
SELECT 
  user_id,
  onboarding_completed,
  family_status,
  partner_primary_citizenship
FROM user_preferences
WHERE onboarding_completed = true;
```

## Special Handling Cases

### 1. Pet Owner Conversion
The `pet_owner` field is an array in onboarding data. It needs to be converted:
- `["no"]` → `bringing_pets = false`
- `["cat"]` or `["dog"]` → `bringing_pets = true`
- Empty array → `bringing_pets = false`

### 2. Family Situation Variations
The field can be either:
- A string: `"couple"`, `"single"`, `"Not specified"`
- An object: `{ status: "couple", partner_agreement: "full_agreement", ... }`

### 3. Partner Data Conditional Logic
Partner citizenship fields should only be populated when:
- `family_status` is either `"couple"` or `"family"`
- Partner citizenship data exists in the source

### 4. Array to Single Value
Many fields that accept arrays in the onboarding need to be preserved as arrays in user_preferences.

### 5. Null Handling
- Empty arrays → `null`
- Empty strings → `null`
- "Not specified" → `null`

## Post-Migration Cleanup

After successful migration:
1. Verify all users have been migrated
2. Check data integrity for partner fields
3. Consider archiving or removing the onboarding_responses table
4. Update any application code that reads from onboarding_responses

## Error Handling

The migration script includes:
- Detailed error logging for each user
- Summary of successful migrations vs errors
- Verification step to confirm data integrity

## Users to be Migrated

1. `f263b6d9-ec0a-4aa7-8227-b2702937cbc6` - Has partner data (couple)
2. `dad3aadb-4256-40f6-b05a-4d6bdf3ec3bc` - No partner data
3. `da39d09b-af4e-4f11-a67a-b06bd54e06f7` - No partner data
4. `a9e07b59-c10e-4376-8431-879c566df9c6` - No partner data
5. `83d285b2-b21b-4d13-a1a1-6d51b6733d52` - Has partner data (couple)
6. `d1039857-71e2-4562-86aa-1f0b4a0c17c8` - Unknown (need to check)
7. `32442e1b-0f00-4bc4-95a1-43e733c91655` - Unknown (need to check)