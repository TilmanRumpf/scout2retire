# Hobbies Database Setup for Scout2Retire

## Overview

This setup creates a properly normalized hobbies database structure with all hobby data from the OnboardingHobbies.jsx file. The database includes 132 hobbies categorized as activities, interests, and custom hobbies.

## Files Created

### 1. `hobbies_complete_setup.sql`
**Complete SQL setup file** - Run this in Supabase SQL Editor to create everything:
- 3 tables with proper relationships
- Indexes for performance
- Row Level Security (RLS) policies
- All 132 hobbies from OnboardingHobbies.jsx
- Utility functions

### 2. `verify_hobbies_setup.js` 
**Verification script** - Run after SQL setup to verify everything works:
```bash
node verify_hobbies_setup.js
```

### 3. `populate_hobbies_data.js`
**Data population script** - Alternative if you only need to populate data:
```bash
node populate_hobbies_data.js
```

## Database Schema

### Tables Created

#### `hobbies`
- **id**: UUID primary key
- **name**: TEXT unique (hobby name)
- **category**: TEXT ('activity', 'interest', 'custom')
- **description**: TEXT optional (detailed description)
- **icon**: TEXT optional (icon name like 'Snowflake')
- **created_at**: TIMESTAMPTZ
- **updated_at**: TIMESTAMPTZ

#### `user_hobbies` 
Junction table linking users to their hobbies:
- **id**: UUID primary key
- **user_id**: UUID → auth.users(id)
- **hobby_id**: UUID → hobbies(id)
- **created_at**: TIMESTAMPTZ
- **Unique constraint**: (user_id, hobby_id)

#### `town_hobbies`
Junction table linking towns to available hobbies:
- **id**: UUID primary key
- **town_id**: UUID → towns(id)
- **hobby_id**: UUID → hobbies(id)
- **created_at**: TIMESTAMPTZ
- **Unique constraint**: (town_id, hobby_id)

## Data Imported

### From OnboardingHobbies.jsx:

**Activities (9)**: Walking, Swimming, Cycling, Golf, Tennis, Water Sports, Winter Sports, Fishing, Gardening

**Interests (9)**: Arts & Crafts, Music, Theater, Reading, Cooking, Wine, History, Photography, Volunteering  

**Custom Hobbies (114)**: All hobbies from the `allHobbies` array including Antique collecting, Aquarium keeping, Archery, Astronomy, Baking, Ballet, etc.

**Total: 132 hobbies**

## How to Set Up

### Step 1: Create Tables and Import Data
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `hobbies_complete_setup.sql`
3. Execute the SQL

### Step 2: Verify Setup
```bash
node verify_hobbies_setup.js
```

Expected output:
```
✅ Table 'hobbies': 132 rows
✅ Table 'user_hobbies': 0 rows  
✅ Table 'town_hobbies': 0 rows

📊 Hobbies breakdown by category:
   - activity: 9 hobbies
   - interest: 9 hobbies  
   - custom: 114 hobbies

🎯 Total hobbies: 132
✅ Perfect! All hobbies imported correctly.
```

## Usage Examples

### Query hobbies by category
```sql
SELECT * FROM hobbies WHERE category = 'activity' ORDER BY name;
```

### Add hobbies to a user
```sql
INSERT INTO user_hobbies (user_id, hobby_id) 
SELECT 'user-uuid-here', id 
FROM hobbies 
WHERE name IN ('Golf', 'Reading', 'Wine');
```

### Get user's hobbies with details
```sql
SELECT * FROM get_user_hobbies_detailed('user-uuid-here');
```

### Add hobbies to a town
```sql
INSERT INTO town_hobbies (town_id, hobby_id)
SELECT 'town-uuid-here', id
FROM hobbies
WHERE name IN ('Golf', 'Tennis', 'Swimming');
```

## Security

- **Row Level Security (RLS)** enabled on all tables
- **Hobbies**: Readable by everyone
- **User hobbies**: Users can only see/manage their own hobbies
- **Town hobbies**: Readable by everyone, manageable by authenticated users

## Performance

- Indexes created on frequently queried columns:
  - `hobbies.category`
  - `hobbies.name`
  - `user_hobbies.user_id`
  - `user_hobbies.hobby_id` 
  - `town_hobbies.town_id`
  - `town_hobbies.hobby_id`

## Migration Notes

If you have existing hobby data in other tables:

1. **From onboarding_progress.hobbies**: Map activity/interest IDs to hobby IDs
2. **From user_preferences**: Extract hobby data and populate user_hobbies table
3. **From town data**: Map hobby strings to normalized hobby IDs

## Utility Functions

### `get_user_hobbies_detailed(user_uuid)`
Returns all hobbies for a user with full details (name, category, description, icon, date added).

### `get_town_hobbies_detailed(town_uuid)`  
Returns all hobbies available in a town with full details.

## Next Steps

1. ✅ Database tables created and populated
2. 🔄 Update frontend components to use normalized hobbies
3. 🔄 Create hobby management utilities
4. 🔄 Migrate existing user hobby data
5. 🔄 Add hobby-based town matching features

## Troubleshooting

**If you get "table does not exist" errors:**
- Make sure you ran the complete SQL in Supabase SQL Editor
- Check that your service key has proper permissions

**If hobby count is wrong:**
- Run the verification script to see what's missing
- Check for any SQL execution errors

**If RLS policies block access:**
- Ensure you're using the service key for admin operations
- Check that authenticated users have proper roles