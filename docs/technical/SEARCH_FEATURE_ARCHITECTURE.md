# Search Feature Architecture - Scout2Retire
## Professional Multi-Mode Search with Map Integration

### Overview
A comprehensive search system integrating:
- Text-based search (town name, country)
- Location-based search (nearby towns with map)
- Advanced filtering capabilities
- Responsive design for all devices

### Component Architecture

```
SearchFeature/
├── SearchModal.jsx (main container - full screen modal)
│   ├── SearchModes.jsx (tab selector: Text | Nearby | Country)
│   ├── SearchBar.jsx (universal search input with autocomplete)
│   ├── SearchResults.jsx (list view of results)
│   └── NearbyMap.jsx (map view for location-based search)
│
├── components/
│   ├── TownMarker.jsx (custom map markers)
│   ├── MapControls.jsx (zoom, center on user, etc.)
│   ├── DistanceBadge.jsx (shows distance from user)
│   ├── SearchFilters.jsx (progressive disclosure filters)
│   └── LocationPermissionCard.jsx (graceful permission request)
│
├── hooks/
│   ├── useSearch.js (search logic)
│   ├── useGeolocation.js (location handling)
│   ├── useMapSearch.js (map-specific search)
│   └── useDebounce.js (performance optimization)
│
└── utils/
    ├── searchUtils.js (search algorithms)
    ├── geoUtils.js (distance calculations)
    └── mapConfig.js (Leaflet configuration)
```

### Data Flow

```
User Input → Debounced Search → Supabase Query → Results
    ↓                                               ↓
Autocomplete                                  Update Map
    ↓                                               ↓
Suggestions                                   Cluster Markers
```

### Search Modes

#### 1. Text Search (Default)
- **Input**: Search bar with autocomplete
- **Searches**: Town names, countries, regions
- **Algorithm**: Fuzzy matching with relevance scoring
- **Query**:
```javascript
supabase
  .from('towns')
  .select(COLUMN_SETS.searchResults)
  .or(`name.ilike.%${term}%,country.ilike.%${term}%`)
  .order('overall_score', { ascending: false })
  .limit(20)
```

#### 2. Nearby Search (Location-based)
- **Input**: "Use My Location" button → Map view
- **Features**:
  - Interactive map with user location
  - Clickable town markers
  - Distance indicators
  - Radius adjustment (10km, 25km, 50km, 100km)
- **Query**:
```javascript
// Using PostGIS extension for distance calculations
supabase.rpc('get_nearby_towns', {
  user_lat: latitude,
  user_lng: longitude,
  radius_km: radius
})
```

#### 3. Country Search
- **Input**: Country selector dropdown
- **Features**:
  - Grouped by regions within country
  - Show town count per country
  - Quick filter by state/region
- **Query**:
```javascript
supabase
  .from('towns')
  .select(COLUMN_SETS.searchResults)
  .eq('country', selectedCountry)
  .order('state_code,name')
```

### State Management

```javascript
// SearchContext.jsx
const SearchContext = {
  searchMode: 'text' | 'nearby' | 'country',
  searchTerm: string,
  results: Town[],
  isLoading: boolean,
  filters: {
    costRange: [min, max],
    matchRange: [min, max],
    hasPhotos: boolean,
    climateType: string[]
  },
  mapState: {
    center: [lat, lng],
    zoom: number,
    userLocation: [lat, lng] | null,
    selectedRadius: number
  },
  autocompleteOptions: string[]
}
```

### UI/UX Design

#### Mobile First (375px - 768px)
- Full-screen modal overlay
- Tab bar for mode switching
- Touch-friendly controls (44px targets)
- Swipeable results/map views
- Bottom sheet for results over map

#### Tablet (768px - 1024px)
- Split view: Search/filters left, results/map right
- Floating search bar
- Collapsible filters panel

#### Desktop (1024px+)
- Sidebar search with inline map
- Advanced filters always visible
- Multi-column results grid

### Performance Optimizations

1. **Debouncing**: 200ms for search input
2. **Marker Clustering**: For 20+ markers on map
3. **Lazy Loading**: Load map only when needed
4. **Result Caching**: Cache recent searches (5 min TTL)
5. **Progressive Enhancement**: Basic search works without JS
6. **Bundle Splitting**: Load map libraries on demand

### Accessibility Features

- **Keyboard Navigation**: Tab through all controls
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Trap focus in modal
- **Contrast**: WCAG AAA compliant
- **Alternative Text**: For map markers and icons
- **Reduced Motion**: Respect user preference

### Integration Points

1. **QuickNav Integration**
```javascript
// Add "Search" as first item in QuickNav
const quickNavItems = [
  { name: 'Search', path: '#search', icon: Search },
  { name: 'Today', path: '/daily', icon: Calendar },
  // ... rest of items
]
```

2. **Router Integration**
```javascript
// Support deep linking to search
/search?mode=nearby&radius=50
/search?q=Valencia&country=Spain
/search?mode=map&center=40.7,-74.0&zoom=10
```

3. **Analytics Integration**
```javascript
// Track search interactions
trackEvent('search', {
  mode: searchMode,
  term: searchTerm,
  resultsCount: results.length,
  hasFilters: Object.keys(filters).length > 0
})
```

### Database Requirements

1. **New RPC Functions**
```sql
-- Get nearby towns with distance
CREATE OR REPLACE FUNCTION get_nearby_towns(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km INT
)
RETURNS TABLE (
  -- town fields
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.*,
    ST_Distance(
      ST_MakePoint(t.longitude, t.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 AS distance_km
  FROM towns t
  WHERE ST_DWithin(
    ST_MakePoint(t.longitude, t.latitude)::geography,
    ST_MakePoint(user_lng, user_lat)::geography,
    radius_km * 1000
  )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Autocomplete suggestions
CREATE OR REPLACE FUNCTION get_autocomplete(
  search_term TEXT,
  limit_count INT DEFAULT 5
)
RETURNS TABLE (
  suggestion TEXT,
  type TEXT -- 'town' | 'country' | 'region'
) AS $$
BEGIN
  -- Implementation here
END;
$$ LANGUAGE plpgsql;
```

2. **Indexes for Performance**
```sql
-- Spatial index for location queries
CREATE INDEX idx_towns_location ON towns USING GIST (
  ST_MakePoint(longitude, latitude)::geography
);

-- Text search indexes
CREATE INDEX idx_towns_search ON towns USING GIN (
  to_tsvector('english', name || ' ' || country || ' ' || region)
);
```

### Testing Strategy

1. **Unit Tests**
- Search algorithms
- Distance calculations
- Filter logic
- Debounce behavior

2. **Integration Tests**
- Search modes switching
- Map interactions
- Database queries
- Permission handling

3. **E2E Tests**
- Complete search flows
- Mobile interactions
- Keyboard navigation
- Screen reader paths

4. **Performance Tests**
- Search response times
- Map rendering with 343 markers
- Bundle size impact
- Memory usage

### Implementation Phases

#### Phase 1: Core Search (Day 1-2)
- [ ] SearchModal component
- [ ] Basic text search
- [ ] Autocomplete
- [ ] Results display

#### Phase 2: Map Integration (Day 3-4)
- [ ] Leaflet setup
- [ ] NearbyMap component
- [ ] Marker clustering
- [ ] Click interactions

#### Phase 3: Location Features (Day 5)
- [ ] Geolocation hook
- [ ] Distance calculations
- [ ] Permission handling
- [ ] Radius selector

#### Phase 4: Advanced Features (Day 6)
- [ ] Country search mode
- [ ] Progressive filters
- [ ] Search history
- [ ] Deep linking

#### Phase 5: Polish & Testing (Day 7)
- [ ] Responsive design
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Cross-browser testing

### Success Metrics

1. **Performance**
- Search response < 200ms
- Map load < 1 second
- Bundle size increase < 100KB

2. **User Experience**
- 80% of searches return relevant results
- 90% mobile usability score
- Zero accessibility violations

3. **Engagement**
- 50% increase in town discovery
- 30% more favorited towns
- 20% longer session duration

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large bundle size | Slow load | Code splitting, lazy load map |
| Location denied | No nearby search | Fallback to manual location entry |
| Too many markers | Map performance | Clustering, viewport culling |
| Poor search relevance | User frustration | Fuzzy matching, synonyms |
| Mobile map UX | Hard to use | Bottom sheet, touch gestures |

### Security Considerations

1. **Location Privacy**
- Never store user location
- Only use during session
- Clear on logout

2. **Rate Limiting**
- Limit autocomplete: 10 req/sec
- Limit search: 30 req/min
- Implement request cancellation

3. **Input Validation**
- Sanitize search terms
- Validate coordinates
- Limit result counts

---

## Next Steps

1. **Review & Approve Architecture**
2. **Install Dependencies**
```bash
npm install react-leaflet leaflet react-leaflet-cluster use-debounce
```
3. **Create Database Functions**
4. **Implement Phase 1**
5. **Iterate Based on Feedback**

---

*Document Version: 1.0*
*Last Updated: October 19, 2025*
*Author: Claude Code Assistant*