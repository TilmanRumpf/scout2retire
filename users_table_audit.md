# Users Table Column Audit Report

## Overview
This audit examines all columns in the `users` table to identify which are actively used in the codebase versus obsolete/unused fields.

## Core Users Table Structure (from db_schema.sql)
```sql
CREATE TABLE "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "nationality" "text",
    "retirement_year_estimate" integer,
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);
```

## Additional Columns Added by Migrations

### From 20250708214920_add_username_to_users.sql:
- `username` - ACTIVELY USED (login, profile, uniqueness checks)

### From 20250109_add_hometown_and_avatar.sql:
- `hometown` - ACTIVELY USED (profile editing, signup)
- `avatar_url` - ACTIVELY USED (avatar system, profile)

### From 20250111_add_all_onboarding_fields_to_users.sql:
This migration added 90+ columns to consolidate onboarding data, but analysis shows:

## AUDIT RESULTS

### ✅ ACTIVELY USED COLUMNS (Found in codebase)
1. **id** - Primary key, used everywhere
2. **email** - Authentication, user identification
3. **full_name** - Profile display, user identification
4. **onboarding_completed** - Critical for app flow control
5. **retirement_year_estimate** - Used in MasterSchedule, onboarding
6. **created_at** - User tracking, sorting
7. **username** - Login, profile, social features
8. **hometown** - Profile editing, display
9. **avatar_url** - Avatar system

### ⚠️ HARDCODED/DEFAULT VALUE COLUMNS
1. **nationality** - ALWAYS set to 'pending' or 'usa' in code, never properly used
   - authUtils.js: `nationality: nationality || 'pending'`
   - Never queried or displayed anywhere

### ❌ UNUSED ONBOARDING COLUMNS (Added but never queried)
All 90+ columns added by the onboarding migration are COMPLETELY UNUSED:

#### Step 1: Current Status fields (ALL UNUSED)
- retirement_status
- retirement_month
- retirement_day
- primary_citizenship
- dual_citizenship
- secondary_citizenship
- family_situation
- partner_primary_citizenship
- partner_dual_citizenship
- partner_secondary_citizenship
- has_pets

#### Step 2: Region fields (ALL UNUSED)
- preferred_regions
- preferred_countries
- preferred_provinces
- geographic_features
- vegetation_preferences

#### Step 3: Climate fields (ALL UNUSED)
- summer_temp_preference
- winter_temp_preference
- humidity_preference
- sunshine_preference
- precipitation_preference
- seasonal_preference

#### Step 4: Culture fields (ALL UNUSED)
- culture_nightlife_importance
- culture_museums_importance
- culture_cultural_events_importance
- culture_dining_importance
- culture_outdoor_importance
- culture_shopping_importance
- lifestyle_urban_rural
- lifestyle_pace
- lifestyle_social_atmosphere
- lifestyle_political_lean
- expat_community_importance
- language_comfort
- languages_spoken

#### Step 5: Hobbies fields (ALL UNUSED)
- activities_sports through activities_volunteer (9 boolean fields)
- interests_local_cuisine through interests_gardening (9 boolean fields)
- travel_frequency
- lifestyle_importance_family through lifestyle_importance_health (6 integer fields)

#### Step 6: Administration fields (ALL UNUSED)
- healthcare_importance
- insurance_importance
- healthcare_concerns
- safety_importance
- infrastructure_importance
- political_stability_importance
- visa_preference
- stay_duration
- residency_path
- tax_concern
- government_efficiency_concern

#### Step 7: Costs fields (ALL UNUSED)
- total_budget_usd
- max_rent_usd
- max_home_price_usd
- healthcare_budget_usd
- financial_priorities

## KEY FINDINGS

1. **The onboarding data migration was never completed** - All onboarding data still lives in the `onboarding_responses` table as JSON blobs, NOT in the users table columns.

2. **90+ columns are completely wasted** - They exist in the database but are never populated or queried.

3. **The app still uses onboarding_responses table** - All matching algorithms and preference queries go to `onboarding_responses`, not `users`.

4. **nationality field is obsolete** - Always hardcoded, never properly used.

## RECOMMENDATIONS

1. **DROP all unused onboarding columns** - They're just bloating the users table
2. **KEEP using onboarding_responses** - The JSON structure is actually working fine
3. **REMOVE nationality column** - It's misleading and unused
4. **KEEP only the 9 actively used columns** - These are sufficient for the users table

## SQL TO CLEAN UP

```sql
-- Drop all unused onboarding columns
ALTER TABLE users 
DROP COLUMN IF EXISTS retirement_status,
DROP COLUMN IF EXISTS retirement_month,
DROP COLUMN IF EXISTS retirement_day,
DROP COLUMN IF EXISTS primary_citizenship,
-- ... (all 90+ columns listed in migration)
DROP COLUMN IF EXISTS nationality; -- Also drop this obsolete field
```

The users table should only contain: id, email, full_name, retirement_year_estimate, onboarding_completed, created_at, username, hometown, avatar_url.