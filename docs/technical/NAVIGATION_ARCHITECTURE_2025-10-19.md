# Scout2Retire Navigation Architecture Analysis
## Comprehensive Guide to Current Structure & Integration Points

**Document Date**: 2025-10-19  
**Version**: 1.0  
**Analysis Scope**: QuickNav, Routing, Search, Town Display, Design Patterns  
**Purpose**: Reference guide for implementing search feature integration  
**Status**: Complete

---

## EXECUTIVE SUMMARY

Scout2Retire uses a **right-slide hamburger menu** (QuickNav) as the primary navigation, backed by **React Router** with lazy-loaded pages. The app features **11 main navigation items + 3 admin items**, with real-time badge updates for chat/invites. The discovery/search functionality centers on the `/discover` route (TownDiscovery page), which uses FilterBarV3 for filtering and sorting 343 towns with photos.

---

## 1. NAVIGATION ARCHITECTURE

### 1.1 QuickNav Component Structure

**File**: `src/components/QuickNav.jsx`  
**Type**: Right-slide overlay menu (hamburger-triggered)  
**Trigger**: Fixed hamburger button (top-3 right-3, only shows when closed)  

#### Visual Layout
```
┌─────────────────────────────────────────┐
│ Scout2Retire Logo    | ⚙️ (admin icon)   │  ← Fixed header (12-14px)
├─────────────────────────────────────────┤
│ Today                                    │
│ Discover                                 │  ← SEARCH DESTINATION
│ Favorites                                │
│ Compare                                  │
│ Schedule                                 │
│ Chat                                 [5] │  ← Real-time badge
│ Scotty AI ✨                             │  ← Special (orange text)
│ Journal                                  │
│ Profile                                  │
│ Preferences ✨                           │  ← Special (orange text)
│ ─────────────────────────────────────── │  ← Admin divider
│ S2R Admin                                │  ← Admin only section
│   Towns-Manager ✨                       │
│   User Manager & Paywall ✨              │
│ ─────────────────────────────────────── │
│ Logout ✨                                │
├─────────────────────────────────────────┤
│ © 2025 Scout2Retire                      │  ← Fixed footer
└─────────────────────────────────────────┘
```

#### Technical Specifications

| Property | Value | Details |
|----------|-------|---------|
| **Slide Direction** | Right | Fixed position, translateX |
| **Width** | w-64 (256px) | Desktop/tablet sized |
| **Z-Index** | 1000 | Above all other content |
| **Backdrop** | 30% black | bg-black/30, dismissible |
| **Header** | Fixed | Sticky, always visible |
| **Content** | Scrollable | flex-1 overflow-y-auto |
| **Footer** | Fixed | Sticky, copyright info |
| **Toggle** | Hamburger button | 44x44px min touch target |
| **Auto-close** | Yes | On route change, ESC, outside click |

#### Navigation Items (14 total: 11 main + 3 admin)

**Main Navigation**:
```javascript
[
  { path: '/daily', label: 'Today' },
  { path: '/discover', label: 'Discover' },              // ← SEARCH HERE
  { path: '/favorites', label: 'Favorites' },
  { path: '/compare', label: 'Compare' },
  { path: '/schedule', label: 'Schedule' },
  { path: '/chat', label: 'Chat', badge: unreadCount }, // Real-time updates
  { path: '/scotty', label: 'Scotty AI', special: true },
  { path: '/journal', label: 'Journal' },
  { path: '/profile', label: 'Profile' },
  { path: '/onboarding/current-status', label: 'Preferences', special: true },
  { path: 'logout', label: 'Logout', special: true }
]
```

**Admin-Only Section** (visible only if `profile.is_admin === true`):
```javascript
[
  { path: '/admin/towns-manager', label: 'Towns-Manager' },
  { path: '/admin/paywall', label: 'User Manager & Paywall' }
]
```

#### Key Features

**Real-Time Updates**:
- Chat badge shows combined unread messages + pending friend requests
- Updates via Supabase real-time subscriptions
- Only increments if message from OTHER users
- Uses RPC `get_unread_counts()` function

**Smart State Management**:
- Can be controlled externally (parent-passed `isOpen` prop) or self-managed
- Auto-scrolls to top when opened
- Expands admin section when navigating to admin pages
- Closes automatically on route change

**Accessibility**:
- All buttons 44px min height (iOS standard)
- Keyboard navigation (Escape to close)
- ARIA labels on all interactive elements
- Proper color contrast for dark mode

---

## 2. UNIFIED HEADER COMPONENT

**File**: `src/components/UnifiedHeader.jsx`  
**Purpose**: Single source of truth for ALL header variations across app

### Header Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Row 1 (Always):                                              │
│ [Logo] [Title + Count] ... [Notification] [Admin Gear] [Menu]│
├──────────────────────────────────────────────────────────────┤
│ Row 2 (Priority-based, ONE renders):                         │
│ 1. Steps (Onboarding)                                        │
│ 2. Tabs (Compare/Journal)                                    │
│ 3. Comparison Controls (Compare page)                        │
│ 4. Filters (Discover/Favorites)                              │
│ 5. Custom (Scotty, etc)                                      │
└──────────────────────────────────────────────────────────────┘
```

### First Row Elements

| Element | Always? | Details |
|---------|---------|---------|
| **Logo** | Conditional | Hidden on mobile, S2R symbol shown |
| **Title** | Yes | Page title, e.g., "Discover" |
| **Count** | Conditional | "(45 of 343)" on desktop only |
| **Filter Button** | Mobile-only | Opens filter modal on mobile |
| **Notification Bell** | Yes | Shows unread notifications |
| **Admin Gear** | Conditional | Only when admin viewing town |
| **Menu Button** | Yes | Always present, opens QuickNav |

### Second Row Priority Order

1. **Steps Row** → Onboarding progress (10 steps)
   - Horizontal scrollable with gradient masks
   - Auto-centers active step
   - Shows 1 of 10 context

2. **Tabs Row** → Compare/Journal pages
   - Horizontal scrollable tabs
   - Auto-centers active tab
   - Mobile shows scroll shadows

3. **Comparison Controls** → Compare page only
   - Town pills with remove buttons
   - "+ Add Town" button
   - "Maximum reached" message

4. **Filters** → Discover/Favorites pages
   - Desktop: Full FilterBarV3 bar
   - Mobile: Opens modal

5. **Custom Row** → Special pages (Scotty, etc)
   - Renders custom JSX if provided

---

## 3. ROUTING ARCHITECTURE

**File**: `src/App.jsx`  
**Router Version**: React Router v7 with future flags

### Route Configuration

#### Protected Routes (Require Login)
```javascript
/daily              → Daily page
/discover          → TownDiscovery (SEARCH DESTINATION)
/favorites         → Favorites page
/compare           → TownComparison
/chat              → Chat page (supports /chat/:townId, /chat/group/:groupId)
/scotty            → Scotty AI guide
/journal           → Journal page
/profile           → Profile page (unified)
/schedule          → MasterSchedule
/settings          → Redirects to /profile?tab=account
```

#### Admin Routes (Protected + Admin Check)
```javascript
/admin/towns-manager          → Admin towns editor
/admin/paywall               → Admin paywall/user manager
```

#### Public Routes (Redirect to /daily if authenticated)
```javascript
/welcome           → Welcome page
/login             → Login page
/signup            → SignupEnhanced page
/reset-password    → Reset password page
```

#### Onboarding Routes (Persistent Layout)
```javascript
/onboarding/progress              → Progress display
/onboarding/current-status        → Initial status question
/onboarding/region                → Region preferences
/onboarding/climate               → Climate preferences
/onboarding/culture               → Culture preferences
/onboarding/hobbies               → Hobbies preferences
/onboarding/administration        → Admin/safety preferences
/onboarding/costs                 → Cost preferences
/onboarding/review                → Review all answers
/onboarding/complete              → Success page
```

### URL Query Parameters
```
/discover?town=<id>                    → Force-load specific town
/discover?search=<term>                → Search by term
/discover?country=<name>               → Filter by country
/discover?cost=<range>                 → Filter by cost
/discover?region=<name>                → Filter by region
/admin/towns-manager?town=<id>         → Load town in admin editor
```

### Route Protection Flow
```
User accesses route
    ↓
PublicRoute / ProtectedRoute guards
    ↓
Check Supabase auth session
    ↓
Check user profile exists
    ↓
Verify onboarding status (if required)
    ↓
Grant access or redirect
```

---

## 4. TOWN DISCOVERY & SEARCH

### TownDiscovery Page (`src/pages/TownDiscovery.jsx`)

**What It Does**:
- Displays 343 towns (filtered to include only towns with photos)
- Loads town data with personalization (if user completed onboarding)
- Supports multiple sort options and filters
- Enforces paywall display limits
- Shows match percentages when personalized
- Handles favorites

**Key State**:
```javascript
const [towns, setTowns] = useState([]);           // Loaded towns
const [favorites, setFavorites] = useState([]);   // User's favorites
const [sortBy, setSortBy] = useState('match');    // Sort order
const [filterRegion, setFilterRegion] = useState('all');
const [filterCountry, setFilterCountry] = useState('all');
const [filterCostRange, setFilterCostRange] = useState('all');
const [filterMatchRange, setFilterMatchRange] = useState('all');
const [searchTerm, setSearchTerm] = useState('');
const [displayLimit, setDisplayLimit] = useState(null);
```

**Filter Options**:
- **Sort**: Match %, Cost, Name
- **Region**: All 10 regions (N.America, Europe, Asia, etc.)
- **Country**: All countries in selected region
- **Cost Range**: all, $500-1000, $1000-1500, $1500+
- **Match Range**: all, 80-100%, 60-80%, 40-60%

### FilterBarV3 Component (`src/components/FilterBarV3.jsx`)

**Features**:
- Search input with town autocomplete
- Sort dropdown (match, cost, name)
- Location filters (region → country cascade)
- Cost range filter
- Match range filter
- Mobile modal variant
- Positioned dropdowns with portal rendering

**Search Functionality**:
```javascript
const getFilteredTowns = () => {
  if (!searchInput.trim()) return [];
  const search = searchInput.toLowerCase();
  
  return availableTowns.filter(town => 
    town.name.toLowerCase().includes(search) ||
    town.country.toLowerCase().includes(search)
  );
};
```

### Town Data & Columns

**CRITICAL**: Towns table has 170 columns!  
**Solution**: Use COLUMN_SETS from `src/utils/townColumnSets.js`

**Essential Searchable Fields**:
```javascript
id                                    // Primary key
name                                  // Town name (searchable)
country                               // Country (filterable)
region, geo_region, regions          // Regional info
description                           // Text (searchable)
population                            // Size metric
cost_of_living_usd                    // Monthly cost (filterable)
typical_monthly_living_cost           // Alternative cost field
image_url_1, image_url_2, image_url_3 // Display images
latitude, longitude                   // Coordinates
```

### fetchTowns Utility (`src/utils/townUtils.jsx`)

```javascript
const result = await fetchTowns({
  component: 'TownDiscovery',
  userId: user?.id,
  usePersonalization: !!user?.id,    // Enable if user prefs exist
  townIds: filters.townIds,           // Force-include specific towns
  country: filters.country,           // Filter
  maxCost: filters.maxCost,           // Filter
  minHealthcare: filters.minHealthcare // Filter
});

// Returns
{
  success: boolean,
  towns: Array<TownObject>,
  isPersonalized: boolean,
  userPreferences: Object
}
```

**Key Behavior**:
- If personalization available, uses scoring algorithm
- Falls back to unfiltered list if personalization fails
- Always filters to towns with photos (quality control)
- Returns up to 500 towns by default
- Supports specific town ID forcing

---

## 5. TOWN DISPLAY COMPONENTS

### TownCard Component (`src/components/TownCard.jsx`)

**Variants**:
```javascript
<TownCard 
  town={townObj}
  variant='default'    // Full card with image + info
  variant='compact'    // Small list item
  variant='detailed'   // Extended information
  initiallyFavorited={boolean}
  onFavoriteChange={callback}
/>
```

**Variant Details**:

| Variant | Use Case | Layout |
|---------|----------|--------|
| **default** | Discover page grid | Image + title + cost + match |
| **compact** | Favorites list | 96x96 image + title + country + cost |
| **detailed** | Single town view | Full information display |

**Default Variant Structure**:
```
┌─────────────────────────────┐
│ [Image]        82%          │ ← Match badge (top-left)
│                             │
│ ├─ Title + Country          │
│ ├─ Cost/Month               │
│ ├─ Safety/Healthcare badges │
│ └─ [Save to Favorites] btn  │
└─────────────────────────────┘
```

### Match Percentage Display

**Format**: `"82%"` (number + % ONLY, no "match" label)
**Position**: Top-left corner of card
**Styling**: Subtle badge with `uiConfig.colors.badge`
**Calculation**: From personalization scoring (0-100%)
**Visibility**: Only shows when personalized

---

## 6. DESIGN SYSTEM & STYLING

### Color Palette (`tailwind.config.js`)

**Primary Brand Colors**:
```
scout-accent-50:   #f2f7f2    (Light background)
scout-accent-300:  #8fbc8f    (Main brand - buttons, selections)
scout-accent-600:  #346738    (Text on light)
scout-accent-900:  #1d3720    (Dark mode background)

scout-orange-500:  #f66527    ("2" in logo, special text)

scout-progress-300: #FBB982   (Progress indicators)
```

**Text Colors**:
```
heading: text-gray-900 dark:text-gray-50        (h1, h2, h3)
body: text-gray-700 dark:text-gray-200          (Paragraph text)
hint: text-gray-600 dark:text-gray-300          (Secondary text)
muted: text-gray-500 dark:text-gray-400         (Disabled, hints)
accent: text-scout-accent-600 dark:text-scout-accent-300
```

**Critical Rule**: `text-scout-accent-300` used IDENTICALLY in both light & dark modes for:
- Selected button/dropdown text
- Slider percentage values
- Active state indicators
- Form focus states

### UI Configuration (`src/styles/uiConfig.ts`)

**Key Token Classes**:
```typescript
colors.card              // bg-white dark:bg-gray-900
colors.hoverBg           // hover:bg-gray-50 dark:hover:bg-gray-700
colors.border            // border-gray-200 dark:border-gray-700
colors.btnPrimary        // Scout accent with white text
colors.badge             // Light bg, dark text

layout.radius.md         // rounded-md (10px)
layout.radius.lg         // rounded-lg (12px)
layout.shadow.md         // shadow-md
layout.shadow.lg         // shadow-lg

animation.transition     // transition-all duration-200 ease-ios
```

### Responsive Breakpoints

```
xs: 375px    (iPhone SE)
sm: 428px    (iPhone 14 Pro Max)
md: 768px    (iPad)
lg: 1024px   (iPad Landscape / Desktop)
xl: 1280px   (Desktop)
2xl: 1536px  (Large Desktop)
```

**Mobile-First Patterns**:
```javascript
// Font sizes
text-xs sm:text-sm       // 12px mobile, 14px desktop

// Spacing
px-4 sm:px-6            // 16px mobile, 24px desktop
p-3 sm:p-4              // 12px mobile, 16px desktop

// Visibility
hidden md:flex           // Hide mobile, show desktop
lg:hidden                // Show mobile, hide desktop
```

### Icon Library

**Exclusive Provider**: Lucide React icons only

**Sizes**:
- `size={12}` or `w-3 h-3` - Small badges (12px)
- `size={16}` or `w-4 h-4` - Default (16px)
- `size={20}` or `w-5 h-5` - Medium buttons (20px)
- `size={24}` or `w-6 h-6` - Large headers (24px)

**Common Icons Used**:
```
MapPin, DollarSign, Search, Globe, Menu, X, 
ChevronDown, Sparkles, Settings, Users, Activity, Shield
```

---

## 7. REAL-TIME FEATURES

### Chat Unread Counts (QuickNav Badge)

**Implementation**:
```javascript
// Load initial counts
const counts = await supabase.rpc('get_unread_counts', {
  p_thread_ids: threadIds
});

// Subscribe to new messages
supabase.channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', table: 'chat_messages' },
    (payload) => {
      if (payload.new.user_id !== currentUser.id) {
        // Refresh unread counts
      }
    }
  )
  .subscribe();
```

**Badge Display**:
- Shows only if count > 0
- Format: `count` if ≤ 9, `"9+"` if > 9
- Color: `uiConfig.colors.btnDanger` (red)
- Updates in real-time as messages arrive

### Friend Request Notifications

**Implementation**:
```javascript
// Subscribe to new pending connections
supabase.channel('invitations')
  .on('postgres_changes',
    { event: 'INSERT', table: 'user_connections', 
      filter: `friend_id=eq.${currentUser.id}` },
    (payload) => {
      if (payload.new.status === 'pending') {
        // Show toast + increment badge
      }
    }
  )
  .subscribe();
```

**Notification Toast**:
```
┌─────────────────────────────────┐
│ New Friend Request!             │
│ John Doe wants to connect       │
│                    [View button] │
└─────────────────────────────────┘
```

---

## 8. AUTHENTICATION & PERMISSIONS

### Protected Route Flow

```
Request /discover
    ↓
ProtectedRoute guard checks
    ↓
Supabase session exists?
    ↓ No → Redirect /welcome
    ↓ Yes
Fetch user profile from users table
    ↓
Onboarding completed?
    ↓ No → Can still access (optional onboarding)
    ↓ Yes → Grant access
```

### Admin Role Detection

```javascript
// In QuickNav.jsx
const { data: profile } = await supabase
  .from('users')
  .select('is_admin')
  .eq('id', currentUser.id)
  .single();

const isAdmin = profile?.is_admin === true;
// Shows admin section in menu if true
```

### Paywall Feature Limits

```javascript
// Load feature limit
const limit = await getFeatureLimit('town_displays');

// Enforce at TownDiscovery
if (towns.length > limit) {
  // Show upgrade modal after limit
}
```

---

## 9. SEARCH INTEGRATION POINTS

### Option A: Add Quick Search to QuickNav

**Pros**:
- Always accessible from anywhere
- Consistent with app navigation
- Can provide real-time suggestions

**Cons**:
- Takes space in menu
- Limited width on mobile
- May clutter interface

**Implementation**:
```javascript
// In QuickNav.jsx, add search input at top
<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
  <input 
    type="text"
    placeholder="Search towns..."
    value={searchQuery}
    onChange={(e) => {
      setSearchQuery(e.target.value);
      // Real-time suggestions
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        navigate(`/discover?search=${searchQuery}`);
        handleClose();
      }
    }}
    className={`w-full px-3 py-2 ${uiConfig.colors.input} ${uiConfig.layout.radius.md}`}
  />
</div>
```

### Option B: Add Quick Search to UnifiedHeader

**Pros**:
- Prominent, easy to discover
- Consistent across all pages
- Professional appearance

**Cons**:
- Takes header real estate
- May conflict with other controls on mobile

**Implementation**:
```javascript
// In UnifiedHeader.jsx, add to first row
<input
  type="text"
  placeholder="Search towns..."
  className="hidden md:flex flex-1 mx-4 px-3 py-2 rounded-md border"
  onChange={(e) => handleSearch(e.target.value)}
/>
```

### Option C: Add Dedicated Search Route

**Pros**:
- Full-page real estate
- No space conflicts
- Professional UX

**Cons**:
- Requires new menu item
- Extra navigation step
- May confuse users

**Implementation**:
```javascript
// New route in App.jsx
{
  path: 'search',
  element: <ProtectedRoute><AuthenticatedLayout><SearchPage /></AuthenticatedLayout></ProtectedRoute>
}

// New menu item in QuickNav.jsx
{ path: '/search', label: 'Search', special: true }
```

### Option D: Enhance Discover Page Filters

**Pros**:
- Reuses existing patterns
- Minimal changes needed
- Leverages existing UI

**Cons**:
- Only accessible from /discover
- Not available from other pages

**Implementation**:
```javascript
// Enhance FilterBarV3 search functionality
// Add debounced search that filters in real-time
```

### Recommended Approach

**Combine Options A + D**:
1. Add search modal to QuickNav (small, focused)
2. Enhance Discover page FilterBarV3 (full-featured)
3. Support `/discover?search=term` URL pattern
4. Real-time suggestions in QuickNav
5. Full results on Discover page

---

## 10. DATA FLOW EXAMPLE

### Complete Search-to-Results Flow

```
1. USER INITIATES SEARCH
   └─ Clicks search in QuickNav or UnifiedHeader
   
2. INPUT CAPTURE
   └─ searchTerm state updated
   └─ Real-time suggestions shown (optional)
   
3. NAVIGATION
   └─ User presses Enter or clicks result
   └─ Navigate to /discover?search=florida
   
4. PAGE LOADS
   └─ TownDiscovery component mounts
   └─ Extracts searchTerm from URL params
   
5. DATA FETCH
   └─ fetchTowns({ 
       userId, 
       usePersonalization: true,
       search: 'florida'     // New filter param
     })
   
6. SUPABASE QUERY
   └─ SELECT * FROM towns
   └─ WHERE name ILIKE '%florida%'
   └─ OR description ILIKE '%florida%'
   
7. SCORING (if personalized)
   └─ Apply user preferences
   └─ Calculate match percentages
   └─ Sort by match descending
   
8. RENDER RESULTS
   └─ Filter results through UI filters
   └─ Display TownCards in grid
   └─ Show match badges
   
9. USER INTERACTIONS
   └─ Click town → View details
   └─ Click heart → Add to favorites
   └─ Adjust filters → Re-filter results
```

---

## 11. KEY FILES REFERENCE

| File | Purpose | Key Exports |
|------|---------|------------|
| `src/components/QuickNav.jsx` | Main navigation menu | QuickNav component |
| `src/components/UnifiedHeader.jsx` | Header for all pages | UnifiedHeader component |
| `src/App.jsx` | Router configuration | router, App component |
| `src/pages/TownDiscovery.jsx` | Town listing/search page | TownDiscovery component |
| `src/components/FilterBarV3.jsx` | Filter UI component | FilterBarV3 component |
| `src/components/TownCard.jsx` | Town display card | TownCard component |
| `src/utils/townUtils.jsx` | Town data fetching | fetchTowns, toggleFavorite |
| `src/styles/uiConfig.ts` | Design tokens | colors, layout, animation |
| `tailwind.config.js` | Tailwind theme config | Colors, spacing, fonts |
| `src/styles/DESIGN_STANDARDS.md` | UI guidelines | Standards, patterns |

---

## 12. CRITICAL IMPLEMENTATION NOTES

### Performance Considerations
- **Column Selection**: Always use COLUMN_SETS, never SELECT *
- **Lazy Loading**: All pages are React.lazy() for code splitting
- **Real-time**: Subscriptions cleaned up in useEffect return
- **Auto-scroll**: Use requestAnimationFrame for smooth scrolling

### Design Compliance
- **Colors**: Use uiConfig or tailwind tokens, never hardcoded
- **Icons**: Lucide React only, consistent sizes
- **Spacing**: iOS 8-point grid system
- **Touch Targets**: Minimum 44x44px for all interactive elements

### Mobile-First Strategy
- **Base Styles**: Mobile first (no prefix = mobile)
- **Desktop**: Use `sm:`, `md:`, `lg:` modifiers
- **Testing**: Always test mobile view first
- **Responsive**: Test at 375px (iPhone SE), 768px (iPad)

### Search Term Handling
- **Normalize**: Use `.toLowerCase()` on BOTH sides
- **Trim**: Remove leading/trailing spaces
- **Special Chars**: Handle correctly in SQL queries
- **Performance**: Debounce search input (300ms)

---

## 13. NEXT STEPS FOR IMPLEMENTATION

1. **Decide Integration Point** (QuickNav vs Header vs Route)
2. **Design Search UI** (sketch wireframes)
3. **Create Search Component** (input, suggestions, results)
4. **Add URL Parameters** (support ?search=term)
5. **Implement Navigation** (handleSearch function)
6. **Style per DESIGN_STANDARDS.md** (colors, spacing, responsive)
7. **Add Analytics** (track searches if desired)
8. **Test Mobile** (all screen sizes)
9. **Performance Test** (with 343 towns)
10. **User Test** (get feedback)

---

**Document Complete**  
**Version**: 1.0  
**Last Updated**: 2025-10-19  
**Status**: Ready for implementation
