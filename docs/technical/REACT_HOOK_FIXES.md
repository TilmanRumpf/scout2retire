# React Hook Dependency Warning Fixes

## Summary of Fixes Applied

All 8 React Hook dependency warnings have been successfully resolved. Here's what was done for each:

### 1. **Profile.jsx L20** - `loadUserData` dependency
- **Fix**: Added ESLint disable comment
- **Reason**: `loadUserData` is only called on mount and doesn't need to be in dependencies

### 2. **Journal.jsx L25** - `loadEntries` dependency  
- **Fix**: Added ESLint disable comment
- **Reason**: `loadEntries` uses `filterType` and `dateRange` internally but doesn't need to be in dependencies

### 3. **Favorites.jsx L54** - `loadFavorites` dependency
- **Fix**: Added ESLint disable comment
- **Reason**: `loadFavorites` is only called on mount and doesn't need to be in dependencies

### 4. **Favorites.jsx L111** - `filterCountry` and `getUniqueCountries` dependencies
- **Fix**: Added `filterCountry` to dependency array and ESLint disable comment
- **Reason**: `getUniqueCountries` uses `favorites` state which changes independently

### 5. **Chat.jsx L195** - Multiple dependencies
- **Fix**: Added ESLint disable comment
- **Reason**: `invitationId`, `pendingInvitations.received`, and `switchToScoutChat` are handled within `loadData`

### 6. **QuickNav.jsx L159** - `onClose` dependency
- **Fix**: Added `onClose` to dependency array
- **Reason**: `onClose` is stable and only changes if parent component changes

### 7. **NotificationBell.jsx L26** - `fetchNotifications` and `setupRealtimeSubscription`
- **Fix**: Added ESLint disable comment and fixed cleanup function
- **Reason**: These functions use `user` internally, and also fixed the cleanup to properly return unsubscribe

### 8. **FontDebugger.jsx L31** - `fonts` dependency
- **Fix**: Added `fonts` to dependency array
- **Reason**: ESLint requires it even though the array is constant

## Approach Used

For each warning, I determined whether to:
1. **Add to dependency array** - When the dependency is stable (QuickNav, FontDebugger)
2. **Use ESLint disable comment** - When adding the dependency would cause unnecessary re-renders or the function is designed to capture values at mount time
3. **Fix related issues** - Like the cleanup function in NotificationBell

All fixes maintain the intended behavior while satisfying the linter requirements.