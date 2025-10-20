# Search & Map Integration - Quick Start Implementation Guide

**For:** Scout2Retire development team
**Based on:** SEARCH_MAP_INTEGRATION_RESEARCH_2024.md
**Purpose:** Fast reference for implementing search and map features

---

## Quick Decision Matrix

### "Which map library should I use?"
✅ **React Leaflet** - Perfect for Scout2Retire
- 343 towns (well below 100k limit)
- 42 KB bundle (vs Mapbox 212 KB)
- Free (Hippocratic License)
- Mobile-friendly

### "How long should I debounce search?"
✅ **200ms** - Optimal balance
- < 200ms: Too many requests
- > 300ms: Feels sluggish

### "Should I auto-detect location?"
❌ **NO - Always use button** - "Use My Location"
- Auto-detect damages trust
- Violates WCAG accessibility
- 95% of users concerned about data privacy

### "Interactive or batch filtering?"
✅ **Interactive** - Update results as filters applied
- More responsive UX
- Users see effects immediately
- Higher engagement

---

## Installation

```bash
# Core map library
npm install react-leaflet leaflet

# Clustering
npm install react-leaflet-cluster

# Debouncing
npm install use-debounce

# Leaflet CSS (add to main.jsx or index.html)
import 'leaflet/dist/leaflet.css'
```

---

## Minimal Working Example

### 1. Basic Search with Debounce

```jsx
// components/TownSearch.jsx
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { supabase } from '../utils/supabaseClient'
import { COLUMN_SETS } from '../utils/townColumnSets'

export function TownSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const searchTowns = useDebouncedCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('towns')
          .select(COLUMN_SETS.searchResults)
          .or(`
            name.ilike.%${searchTerm}%,
            country.ilike.%${searchTerm}%
          `)
          .limit(20)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    },
    200 // 200ms debounce
  )

  return (
    <div className="search-container">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          searchTowns(e.target.value)
        }}
        placeholder="Search towns, countries, or locations"
        aria-label="Search retirement towns"
        className="search-input"
      />

      {loading && <p>Searching...</p>}

      <div role="status" aria-live="polite">
        {results.length > 0 && `${results.length} towns found`}
      </div>

      <ul className="results-list">
        {results.map(town => (
          <li key={town.id}>
            <h3>{town.name}</h3>
            <p>{town.country}</p>
            <p>Score: {town.overall_score}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 2. Basic Map with Markers

```jsx
// components/TownMap.jsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { supabase } from '../utils/supabaseClient'
import { COLUMN_SETS } from '../utils/townColumnSets'
import 'leaflet/dist/leaflet.css'

export function TownMap() {
  const [towns, setTowns] = useState([])

  useEffect(() => {
    loadTowns()
  }, [])

  const loadTowns = async () => {
    const { data, error } = await supabase
      .from('towns')
      .select(COLUMN_SETS.mapView)

    if (!error) setTowns(data || [])
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '70vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      <MarkerClusterGroup chunkedLoading>
        {towns.map(town => (
          <Marker
            key={town.id}
            position={[town.latitude, town.longitude]}
          >
            <Popup>
              <h3>{town.name}</h3>
              <p>{town.country}</p>
              <p>Score: {town.overall_score}</p>
              <a href={`/towns/${town.id}`}>View Details</a>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
```

### 3. Column Sets (CRITICAL - Never SELECT *)

```javascript
// utils/townColumnSets.js
export const COLUMN_SETS = {
  // Minimal data for map markers
  mapView: `
    id,
    name,
    country,
    latitude,
    longitude,
    overall_score
  `,

  // Search results list
  searchResults: `
    id,
    name,
    country,
    state_code,
    region,
    overall_score,
    photos,
    description,
    climate_type,
    cost_of_living_score,
    healthcare_score
  `,

  // Autocomplete dropdown
  autocomplete: `
    id,
    name,
    country,
    state_code
  `
}
```

---

## Mobile Responsive

```css
/* styles/map.css */
.map-container {
  height: 60vh; /* Mobile default */
}

@media (min-width: 768px) {
  .map-container {
    height: 70vh; /* Tablet */
  }
}

@media (min-width: 1024px) {
  .map-container {
    height: 80vh; /* Desktop */
  }
}

/* Touch targets minimum 44x44px */
.map-control-button {
  min-width: 44px;
  min-height: 44px;
  touch-action: manipulation;
}

/* Search input mobile-friendly */
.search-input {
  font-size: 16px; /* Prevents iOS zoom */
  padding: 12px;
  width: 100%;
  border-radius: 8px;
}
```

---

## Common Patterns

### Filter Panel (Progressive Disclosure)

```jsx
function FilterPanel({ onFilterChange }) {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState({
    country: '',
    climate: '',
    minScore: 0
  })

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="filter-panel">
      {/* Primary filters always visible */}
      <select
        value={filters.country}
        onChange={(e) => updateFilter('country', e.target.value)}
        aria-label="Filter by country"
      >
        <option value="">All Countries</option>
        <option value="Spain">Spain</option>
        <option value="Portugal">Portugal</option>
        {/* ... */}
      </select>

      {/* Advanced filters collapsed */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        Advanced Filters
      </button>

      {expanded && (
        <div className="advanced-filters">
          <label>
            Climate Type:
            <select
              value={filters.climate}
              onChange={(e) => updateFilter('climate', e.target.value)}
            >
              <option value="">Any</option>
              <option value="Mediterranean">Mediterranean</option>
              {/* ... */}
            </select>
          </label>

          <label>
            Minimum Score:
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) => updateFilter('minScore', e.target.value)}
            />
          </label>
        </div>
      )}

      <button onClick={() => {
        setFilters({ country: '', climate: '', minScore: 0 })
        onFilterChange({})
      }}>
        Clear All Filters
      </button>
    </div>
  )
}
```

### Location Permission Button

```jsx
function LocationButton({ onLocationFound }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGetLocation = () => {
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onLocationFound({ latitude, longitude })
        setLoading(false)
      },
      (error) => {
        setError('Unable to get your location. Please enable location services.')
        setLoading(false)
      },
      { timeout: 10000 }
    )
  }

  return (
    <div>
      <button
        onClick={handleGetLocation}
        disabled={loading}
        aria-label="Use my location"
        className="location-button"
      >
        {loading ? 'Getting location...' : '📍 Use My Location'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
```

### Search When Map Moves (Airbnb Pattern)

```jsx
function InteractiveMap({ initialTowns }) {
  const [towns, setTowns] = useState(initialTowns)
  const [searchOnMove, setSearchOnMove] = useState(true)
  const mapRef = useRef()

  const handleMapMove = useDebouncedCallback(
    async () => {
      if (!searchOnMove || !mapRef.current) return

      const map = mapRef.current
      const bounds = map.getBounds()

      const { data } = await supabase
        .from('towns')
        .select(COLUMN_SETS.mapView)
        .gte('latitude', bounds.getSouth())
        .lte('latitude', bounds.getNorth())
        .gte('longitude', bounds.getWest())
        .lte('longitude', bounds.getEast())

      setTowns(data || [])
    },
    500 // Slightly longer debounce for map moves
  )

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={searchOnMove}
          onChange={(e) => setSearchOnMove(e.target.checked)}
        />
        Search when I move the map
      </label>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        ref={mapRef}
        whenReady={() => {
          mapRef.current.on('moveend', handleMapMove)
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {towns.map(town => (
          <Marker key={town.id} position={[town.latitude, town.longitude]}>
            <Popup>{town.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
```

---

## Accessibility Checklist

### Search
- [ ] `aria-label` on search input
- [ ] `role="status"` for result count
- [ ] `aria-live="polite"` for dynamic updates
- [ ] Keyboard navigation in autocomplete (arrow keys)
- [ ] Focus visible on all elements

### Map
- [ ] `aria-label="Interactive map of retirement towns"`
- [ ] Keyboard navigation enabled (`keyboard={true}`)
- [ ] Tab through markers with Enter to open popup
- [ ] Escape to close popups
- [ ] Zoom controls keyboard accessible

### Filters
- [ ] Labels for all form inputs
- [ ] `aria-expanded` on collapse/expand buttons
- [ ] Clear focus indicators
- [ ] Logical tab order

---

## Performance Checklist

- [ ] Debounce search at 200ms
- [ ] Use `COLUMN_SETS` (never `SELECT *`)
- [ ] Implement marker clustering
- [ ] Lazy load map component
- [ ] Cancel in-flight requests on new search
- [ ] Use `useMemo` for expensive computations
- [ ] Optimize re-renders with `useCallback`
- [ ] Test on actual mobile devices

---

## Common Gotchas

### 1. Leaflet CSS Missing
**Problem:** Map not displaying
**Solution:** Import CSS in main file
```jsx
import 'leaflet/dist/leaflet.css'
```

### 2. Default Marker Icon Missing
**Problem:** Markers show as broken image
**Solution:** Import default icon
```jsx
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon
```

### 3. Case Sensitivity in Filters
**Problem:** "Coastal" !== "coastal" (40-hour lesson)
**Solution:** Always use `.ilike()` or `.toLowerCase()`
```javascript
// ✅ GOOD
.ilike('region', searchTerm)

// ❌ BAD
.eq('region', searchTerm)
```

### 4. Map Height Zero
**Problem:** Map container has no height
**Solution:** Set explicit height
```css
.map-container {
  height: 70vh; /* or specific px value */
}
```

### 5. Too Many Re-renders
**Problem:** Map re-renders on every state change
**Solution:** Memoize markers
```jsx
const markers = useMemo(
  () => towns.map(town => <Marker key={town.id} {...town} />),
  [towns]
)
```

---

## Testing Commands

```bash
# Run dev server
npm run dev

# Open in browser
# Desktop: http://localhost:5173
# Mobile: Use actual device on same network (find IP with `ipconfig` or `ifconfig`)

# Check bundle size
npm run build
# Review dist/assets/*.js file sizes

# Lighthouse audit
# Chrome DevTools > Lighthouse > Generate report
```

---

## Next Steps

1. **Start with basic search** - Get search working without map
2. **Add map component** - Simple map with all towns
3. **Integrate search + map** - Filter map markers based on search
4. **Add clustering** - Install react-leaflet-cluster
5. **Implement filters** - Progressive disclosure pattern
6. **Location search** - "Use My Location" button
7. **Mobile optimize** - Test on actual devices
8. **Accessibility pass** - WAVE/Axe validation
9. **Performance audit** - Lighthouse score > 90

---

## Resources

- **Full Research:** `docs/technical/SEARCH_MAP_INTEGRATION_RESEARCH_2024.md`
- **React Leaflet Docs:** https://react-leaflet.js.org/
- **Leaflet Docs:** https://leafletjs.com/
- **use-debounce:** https://github.com/xnimorz/use-debounce
- **Accessibility Testing:** https://wave.webaim.org/

---

**Last Updated:** October 19, 2024
**Maintained By:** Scout2Retire Development Team
