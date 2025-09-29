# Database Table Ownership Guide
Created: 2025-09-29
Purpose: Fix split data source confusion (Shithole #4)

## Table Responsibilities

### `users` Table
**Purpose**: Basic user identity and authentication
**Owner**: Authentication system

**Contains**:
- id (UUID)
- email
- username
- full_name
- avatar_url
- created_at
- updated_at

**DO NOT store here**:
- Any preferences
- Any scoring data
- Any onboarding data

**When to query**:
- Getting user's display name
- Getting user's avatar
- Authentication checks
- User profile display

---

### `user_preferences` Table
**Purpose**: ALL user preference data
**Owner**: Preference system

**Contains**:
- id (UUID)
- user_id (FK to users.id)
- All climate preferences
- All location preferences
- All hobby preferences
- All lifestyle preferences
- Admin scoring preferences
- Onboarding status
- created_at
- updated_at

**When to query**:
- Getting ANY preference data
- Scoring calculations
- Onboarding flow
- User preference updates

---

## Common Patterns

### CORRECT: Get user with preferences
```javascript
// Get basic user info
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Get preferences separately
const { data: preferences } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### WRONG: Trying to get preferences from users table
```javascript
// THIS WILL ALWAYS FAIL - users table has no preferences!
const { data: user } = await supabase
  .from('users')
  .select('*, summer_climate_preference')  // WRONG!
  .eq('id', userId);
```

---

## Files That Query Each Table

### Files querying `users` table:
- App.jsx - User session management
- Login.jsx - Authentication
- ProfileUnified.jsx - Profile display
- AvatarUpload.jsx - Avatar management
- authUtils.js - Auth helpers

### Files querying `user_preferences` table:
- userPreferences.js - Preference management
- onboardingUtils.js - Onboarding flow
- enhancedMatchingAlgorithm.js - Scoring calculations
- authUtils.js - Preference initialization

---

## Migration Notes

If considering merging tables:
1. All preference fields would move to users table
2. Would eliminate join confusion
3. Would simplify queries
4. BUT: Requires careful migration to preserve data

For now: Keep separate but ALWAYS remember which table owns what data.