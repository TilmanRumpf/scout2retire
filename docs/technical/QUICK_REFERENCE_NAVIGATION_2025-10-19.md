# Scout2Retire Navigation - Quick Reference Guide

## Navigation Structure at a Glance

```
┌─────────────────────────────────────────────────┐
│  UNIFIED HEADER (ALL PAGES)                     │
│  ┌─────────────────────────────────────────────┐│
│  │ [Logo] [Title] ... [Notifications] [Menu]   ││ Row 1 (Always)
│  ├─────────────────────────────────────────────┤│
│  │ [Steps/Tabs/Filters/Comparison/Custom]      ││ Row 2 (Priority)
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
              │
              └─→ Menu Button Opens →
                       │
        ┌──────────────────────────────────┐
        │  QUICKNAV (RIGHT-SLIDE OVERLAY)  │
        │  w-64 (256px), z-1000            │
        ├──────────────────────────────────┤
        │ Scout2Retire | ⚙️ (admin)         │ Fixed
        ├──────────────────────────────────┤
        │ ☀️ Today                          │
        │ 🔍 Discover        ← SEARCH HERE │
        │ ❤️ Favorites                     │
        │ ⚖️ Compare                        │
        │ 📅 Schedule                      │
        │ 💬 Chat                      [5] │ Badge
        │ ✨ Scotty AI                     │
        │ 📔 Journal                       │
        │ 👤 Profile                       │
        │ ⚙️ Preferences                   │
        │ ─────────────────────────────   │
        │ S2R Admin (Admin only)           │
        │   Towns-Manager                  │
        │   User Manager & Paywall         │
        │ ─────────────────────────────   │
        │ 🚪 Logout                        │
        ├──────────────────────────────────┤
        │ © 2025 Scout2Retire              │ Fixed
        └──────────────────────────────────┘
```

---

## URL Routing Map

```
┌─ PUBLIC ROUTES (redirect to /daily if authenticated)
│  ├─ /welcome
│  ├─ /login
│  ├─ /signup
│  └─ /reset-password
│
├─ ONBOARDING ROUTES (10 steps)
│  ├─ /onboarding/progress
│  ├─ /onboarding/current-status
│  ├─ /onboarding/region
│  ├─ /onboarding/climate
│  ├─ /onboarding/culture
│  ├─ /onboarding/hobbies
│  ├─ /onboarding/administration
│  ├─ /onboarding/costs
│  ├─ /onboarding/review
│  └─ /onboarding/complete
│
├─ MAIN ROUTES (Protected, require login)
│  ├─ /daily                    ← Default landing
│  ├─ /discover?town=<id>       ← SEARCH DESTINATION
│  ├─ /favorites
│  ├─ /compare
│  ├─ /chat
│  ├─ /chat/:townId
│  ├─ /chat/group/:groupId
│  ├─ /scotty
│  ├─ /journal
│  ├─ /profile?tab=<name>
│  ├─ /schedule
│  └─ /settings (→ /profile?tab=account)
│
└─ ADMIN ROUTES (Protected + admin_role check)
   ├─ /admin/towns-manager?town=<id>
   └─ /admin/paywall
```

---

## Data Flow: Search to Results

```
STEP 1: USER INITIATES
┌────────────────────────────────────────┐
│ Clicks search icon/input in:           │
│ • QuickNav menu                        │
│ • UnifiedHeader (if added)             │
│ • FilterBarV3 on Discover page         │
└────────────────────────────────────────┘
                  ↓
STEP 2: CAPTURE INPUT
┌────────────────────────────────────────┐
│ Search term state updated              │
│ Show real-time suggestions (optional)  │
│ Example: "florida" → [town list]       │
└────────────────────────────────────────┘
                  ↓
STEP 3: NAVIGATE
┌────────────────────────────────────────┐
│ User presses Enter OR clicks result    │
│ navigate('/discover?search=florida')   │
└────────────────────────────────────────┘
                  ↓
STEP 4: PAGE LOADS
┌────────────────────────────────────────┐
│ TownDiscovery component mounts         │
│ Extract URL params: ?search=florida    │
└────────────────────────────────────────┘
                  ↓
STEP 5: FETCH DATA
┌────────────────────────────────────────┐
│ fetchTowns({                           │
│   userId,                              │
│   usePersonalization: true,            │
│   country/region/cost/match filters    │
│ })                                     │
└────────────────────────────────────────┘
                  ↓
STEP 6: DATABASE QUERY
┌────────────────────────────────────────┐
│ Supabase query:                        │
│ SELECT id, name, country, ...          │
│ FROM towns                             │
│ WHERE (name ILIKE '%florida%'          │
│   OR description ILIKE '%florida%')    │
│ AND image_url_1 IS NOT NULL            │
│ ORDER BY match_percentage DESC         │
└────────────────────────────────────────┘
                  ↓
STEP 7: APPLY SCORING
┌────────────────────────────────────────┐
│ If personalized:                       │
│ • Calculate match % (0-100)            │
│ • Apply user preferences               │
│ • Sort by match descending             │
│ Else: Show all matching towns          │
└────────────────────────────────────────┘
                  ↓
STEP 8: RENDER RESULTS
┌────────────────────────────────────────┐
│ TownDiscovery displays:                │
│ • Grid of TownCard components          │
│ • Match badges (top-left)              │
│ • Favorite hearts                      │
│ • Cost and safety info                 │
└────────────────────────────────────────┘
                  ↓
STEP 9: USER ACTIONS
┌────────────────────────────────────────┐
│ • Click town → See details             │
│ • Click heart → Add to favorites       │
│ • Adjust filters → Re-filter results   │
│ • New search → Back to step 1          │
└────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App (React Router)
  └─ UnifiedHeader (ALL PAGES)
      ├─ Row 1: Logo, Title, Notifications, Menu
      └─ Row 2: Steps OR Tabs OR Filters OR Custom
  
  └─ QuickNav (Hamburger Menu)
      ├─ Header (Logo)
      ├─ Nav Items
      │  └─ Links to all pages
      ├─ Admin Section (if is_admin)
      └─ Footer (Copyright)
  
  └─ Pages
      └─ TownDiscovery
          ├─ UnifiedHeader (with FilterBarV3)
          ├─ FilterBarV3
          │  ├─ Search input
          │  ├─ Sort dropdown
          │  ├─ Region/Country filters
          │  ├─ Cost/Match filters
          │  └─ Portal dropdowns
          └─ Town Grid
              └─ TownCard (x343)
                  ├─ Image
                  ├─ Match badge
                  ├─ Title/Country
                  ├─ Cost info
                  └─ Favorite button
```

---

## File Organization

```
src/
├─ components/
│  ├─ QuickNav.jsx                 ← Navigation menu
│  ├─ UnifiedHeader.jsx            ← Header (all pages)
│  ├─ FilterBarV3.jsx              ← Filter UI
│  ├─ TownCard.jsx                 ← Town display card
│  └─ [other components]
│
├─ pages/
│  ├─ App.jsx                      ← Router config
│  ├─ TownDiscovery.jsx            ← Search destination
│  ├─ Daily.jsx
│  ├─ Favorites.jsx
│  └─ [other pages]
│
├─ utils/
│  ├─ townUtils.jsx                ← fetchTowns()
│  ├─ userSearchUtils.js           ← findUserByEmail()
│  ├─ supabaseClient.js            ← Supabase config
│  └─ [other utils]
│
├─ styles/
│  ├─ uiConfig.ts                  ← Design tokens
│  ├─ DESIGN_STANDARDS.md          ← UI guidelines
│  └─ [stylesheets]
│
├─ contexts/
│  ├─ AuthContext.jsx
│  └─ ThemeContext.jsx
│
└─ App.jsx                          ← Entry point
```

---

## Key State Management Patterns

### Page-Level State (TownDiscovery)
```javascript
const [towns, setTowns] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState('match');
const [filterRegion, setFilterRegion] = useState('all');
const [filterCountry, setFilterCountry] = useState('all');
const [filterCostRange, setFilterCostRange] = useState('all');
const [favorites, setFavorites] = useState([]);
```

### Global Context State
```javascript
// AuthContext
const { user, profile, loading } = useAuth();

// ThemeContext
const { isDark, setIsDark } = useTheme();
```

### URL-Based State
```javascript
const location = useLocation();
const navigate = useNavigate();

// Extract from URL
const params = new URLSearchParams(location.search);
const townId = params.get('town');
const searchQuery = params.get('search');
```

### Real-Time State (Supabase)
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('town-updates')
    .on('postgres_changes', { event: '*', table: 'towns' }, 
      (payload) => {
        // Update state on change
      }
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, []);
```

---

## Design System Quick Lookup

| Element | Light Mode | Dark Mode |
|---------|-----------|----------|
| **Card** | bg-white | bg-gray-900 |
| **Text** | text-gray-800 | text-white |
| **Accent** | scout-accent-600 | scout-accent-300 |
| **Border** | border-gray-200 | border-gray-700 |
| **Button** | scout-accent-500 | scout-accent-400 |
| **Hover** | hover:bg-gray-50 | hover:bg-gray-700 |

---

## Common Code Patterns

### Navigating with Parameters
```javascript
navigate(`/discover?search=${searchTerm}`);
navigate(`/admin/towns-manager?town=${townId}`);
```

### Fetching Towns
```javascript
const result = await fetchTowns({
  userId: user.id,
  usePersonalization: true,
  country: 'Spain',
  maxCost: 1500
});
```

### Toggle Favorite
```javascript
const { success, action } = await toggleFavorite(userId, townId);
// action: 'added' or 'removed'
```

### Real-Time Badge Update
```javascript
const totalUnread = counts.reduce(
  (sum, item) => sum + (item.unread_count || 0), 
  0
);
setPendingInvitesCount(prevCount => prevCount + 1);
```

---

## Mobile vs Desktop Differences

| Feature | Mobile | Desktop |
|---------|--------|---------|
| **Menu** | Slide-out (w-64) | Always visible (nav bar) |
| **Header** | Compact, hidden logo | Full with logo |
| **Filters** | Modal overlay | Inline bar |
| **Grid** | 1 column | 2-3 columns |
| **Font** | text-xs | text-sm |
| **Touch** | 44px min | 32px typical |
| **Spacing** | p-3 | p-4 |

---

## Performance Tips

1. **Always use COLUMN_SETS** (not SELECT *)
2. **Lazy load pages** (React.lazy)
3. **Debounce search input** (300ms)
4. **Cleanup subscriptions** (useEffect return)
5. **Memoize expensive components** (React.memo)
6. **Use requestAnimationFrame** for smooth scrolling
7. **Leverage React suspense** for loading states

---

## Testing Checklist

- [ ] Menu opens/closes correctly
- [ ] All navigation links work
- [ ] Search filters results
- [ ] Favorites toggle works
- [ ] Mobile responsive (375px, 768px)
- [ ] Dark mode colors correct
- [ ] Touch targets 44px minimum
- [ ] Real-time badges update
- [ ] Admin items only show for admins
- [ ] URL parameters preserved on reload

---

**Quick Reference Version**: 1.0  
**Date**: 2025-10-19  
**Status**: Ready
