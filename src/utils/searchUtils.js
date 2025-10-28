// Search utility functions for Scout2Retire
import { supabase } from './supabaseClient';
import { COMMON_QUERIES } from './townColumnSets';

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

// Search towns by text (name, country, region)
export async function searchTownsByText(searchTerm, filters = {}) {
  try {
    const term = searchTerm.toLowerCase().trim();

    let query = supabase
      .from('towns')
      .select(COMMON_QUERIES.searchResults);

    // Apply text search
    if (term) {
      query = query.or(`name.ilike.%${term}%,country.ilike.%${term}%,region.ilike.%${term}%`);
    }

    // Apply filters
    if (filters.costRange) {
      query = query.gte('cost_of_living_index', filters.costRange[0])
                   .lte('cost_of_living_index', filters.costRange[1]);
    }

    if (filters.matchRange && filters.userId) {
      query = query.gte('quality_of_life', filters.matchRange[0])
                   .lte('quality_of_life', filters.matchRange[1]);
    }

    if (filters.hasPhotos) {
      query = query.not('image_url_1', 'is', null);
    }

    if (filters.climateType && filters.climateType.length > 0) {
      query = query.in('climate_type', filters.climateType);
    }

    // Order by relevance and score
    query = query.order('quality_of_life', { ascending: false, nullsFirst: false })
                 .limit(50);

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Search exception:', err);
    return { data: [], error: err };
  }
}

// Search towns by country
export async function searchTownsByCountry(country, filters = {}) {
  try {
    let query = supabase
      .from('towns')
      .select(COMMON_QUERIES.searchResults)
      .eq('country', country);

    // Apply additional filters
    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    // Order by region and name for organized display
    query = query.order('region', { ascending: true })
                 .order('name', { ascending: true })
                 .limit(100);

    const { data, error } = await query;

    if (error) {
      console.error('Country search error:', error);
      return { data: [], error };
    }

    // Group by region for better display
    const grouped = {};
    (data || []).forEach(town => {
      const key = town.region || 'Other';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(town);
    });

    return { data: data || [], grouped, error: null };
  } catch (err) {
    console.error('Country search exception:', err);
    return { data: [], error: err };
  }
}

// Search nearby towns (requires user location)
export async function searchNearbyTowns(userLat, userLng, radiusKm = 50) {
  try {
    // First get all towns with coordinates
    const { data: towns, error } = await supabase
      .from('towns')
      .select(COMMON_QUERIES.searchResults)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Nearby search error:', error);
      return { data: [], error };
    }

    // Calculate distances and filter by radius
    const townsWithDistance = (towns || [])
      .map(town => ({
        ...town,
        distance: calculateDistance(userLat, userLng, town.latitude, town.longitude)
      }))
      .filter(town => town.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return { data: townsWithDistance, error: null };
  } catch (err) {
    console.error('Nearby search exception:', err);
    return { data: [], error: err };
  }
}

// Get autocomplete suggestions
export async function getAutocompleteSuggestions(searchTerm, limit = 5) {
  try {
    const term = searchTerm.toLowerCase().trim();

    if (term.length < 2) {
      return { suggestions: [], error: null };
    }

    // Search for matching towns
    const { data: towns, error: townError } = await supabase
      .from('towns')
      .select('name, country, region')
      .or(`name.ilike.${term}%,name.ilike.% ${term}%`)
      .limit(limit);

    if (townError) {
      console.error('Autocomplete error:', townError);
      return { suggestions: [], error: townError };
    }

    // Get unique countries that match
    const { data: countries, error: countryError } = await supabase
      .from('towns')
      .select('country')
      .ilike('country', `${term}%`)
      .limit(3);

    if (countryError) {
      console.error('Country autocomplete error:', countryError);
    }

    // Combine suggestions
    const suggestions = [];

    // Add town suggestions
    (towns || []).forEach(town => {
      suggestions.push({
        type: 'town',
        value: town.town_name,
        display: `${town.town_name}, ${town.region || town.country}`,
        data: town
      });
    });

    // Add unique country suggestions
    const uniqueCountries = new Set();
    (countries || []).forEach(c => {
      if (!uniqueCountries.has(c.country)) {
        uniqueCountries.add(c.country);
        suggestions.push({
          type: 'country',
          value: c.country,
          display: c.country,
          data: { country: c.country }
        });
      }
    });

    return { suggestions: suggestions.slice(0, limit + 2), error: null };
  } catch (err) {
    console.error('Autocomplete exception:', err);
    return { suggestions: [], error: err };
  }
}

// Get available countries for dropdown
export async function getAvailableCountries() {
  try {
    const { data, error } = await supabase
      .from('towns')
      .select('country')
      .order('country');

    if (error) {
      console.error('Get countries error:', error);
      return { countries: [], error };
    }

    // Get unique countries with counts
    const countryCounts = {};
    (data || []).forEach(item => {
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
    });

    const countries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => a.country.localeCompare(b.country));

    return { countries, error: null };
  } catch (err) {
    console.error('Get countries exception:', err);
    return { countries: [], error: err };
  }
}

// Format distance for display
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

// Get bounds for map view based on towns
export function getBoundsForTowns(towns) {
  if (!towns || towns.length === 0) {
    return null;
  }

  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

  towns.forEach(town => {
    if (town.latitude && town.longitude) {
      minLat = Math.min(minLat, town.latitude);
      maxLat = Math.max(maxLat, town.latitude);
      minLng = Math.min(minLng, town.longitude);
      maxLng = Math.max(maxLng, town.longitude);
    }
  });

  // Add some padding
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;

  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding]
  ];
}

// Track search analytics
export async function trackSearch(searchData) {
  try {
    // Only track if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from('user_searches')
      .insert({
        user_id: user.id,
        search_type: searchData.mode,
        search_term: searchData.term,
        results_count: searchData.resultsCount,
        filters_applied: searchData.filters,
        timestamp: new Date().toISOString()
      });
  } catch (err) {
    // Silently fail - don't interrupt search
    console.warn('Failed to track search:', err);
  }
}