/**
 * Geographic Knowledge Base for Scotty AI
 * Provides comprehensive geographic intelligence for answering broad queries
 * like "I like Nova Scotia" or "Tell me about Portugal"
 */

import supabase from './supabaseClient';
import { checkAndFormatContradictions } from './scottyPreferenceValidator';

/**
 * Geographic hierarchy mapping
 * Helps Scotty understand that "Nova Scotia" is a province in Canada
 */
export const GEOGRAPHIC_HIERARCHY = {
  // North America
  canada: {
    country: 'Canada',
    provinces: {
      'nova scotia': { name: 'Nova Scotia', abbr: 'NS', region: 'Atlantic Canada' },
      'british columbia': { name: 'British Columbia', abbr: 'BC', region: 'Western Canada' },
      'ontario': { name: 'Ontario', abbr: 'ON', region: 'Central Canada' },
      'quebec': { name: 'Quebec', abbr: 'QC', region: 'Central Canada' },
      'alberta': { name: 'Alberta', abbr: 'AB', region: 'Western Canada' },
      'manitoba': { name: 'Manitoba', abbr: 'MB', region: 'Western Canada' },
      'saskatchewan': { name: 'Saskatchewan', abbr: 'SK', region: 'Western Canada' },
      'new brunswick': { name: 'New Brunswick', abbr: 'NB', region: 'Atlantic Canada' },
      'newfoundland': { name: 'Newfoundland and Labrador', abbr: 'NL', region: 'Atlantic Canada' },
      'prince edward island': { name: 'Prince Edward Island', abbr: 'PE', region: 'Atlantic Canada' },
    },
    majorCities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Halifax', 'Victoria']
  },

  usa: {
    country: 'United States',
    states: {
      'florida': { name: 'Florida', abbr: 'FL', region: 'Southeast' },
      'arizona': { name: 'Arizona', abbr: 'AZ', region: 'Southwest' },
      'california': { name: 'California', abbr: 'CA', region: 'West Coast' },
      'texas': { name: 'Texas', abbr: 'TX', region: 'South' },
      'north carolina': { name: 'North Carolina', abbr: 'NC', region: 'Southeast' },
    }
  },

  // Europe
  portugal: {
    country: 'Portugal',
    regions: {
      'algarve': { name: 'Algarve', type: 'region', climate: 'Mediterranean' },
      'lisbon': { name: 'Lisbon', type: 'metropolitan', climate: 'Mediterranean' },
      'porto': { name: 'Porto', type: 'metropolitan', climate: 'Atlantic' },
      'alentejo': { name: 'Alentejo', type: 'region', climate: 'Hot Mediterranean' },
      'madeira': { name: 'Madeira', type: 'island', climate: 'Subtropical' },
      'azores': { name: 'Azores', type: 'island', climate: 'Oceanic' },
    }
  },

  spain: {
    country: 'Spain',
    regions: {
      'andalusia': { name: 'Andalusia', type: 'autonomous community', climate: 'Mediterranean' },
      'valencia': { name: 'Valencia', type: 'autonomous community', climate: 'Mediterranean' },
      'catalonia': { name: 'Catalonia', type: 'autonomous community', climate: 'Mediterranean' },
      'basque country': { name: 'Basque Country', type: 'autonomous community', climate: 'Oceanic' },
      'galicia': { name: 'Galicia', type: 'autonomous community', climate: 'Oceanic' },
    }
  },

  france: {
    country: 'France',
    regions: {
      'provence': { name: 'Provence', type: 'region', climate: 'Mediterranean' },
      'brittany': { name: 'Brittany', type: 'region', climate: 'Oceanic' },
      'normandy': { name: 'Normandy', type: 'region', climate: 'Oceanic' },
      'cote d\'azur': { name: 'Côte d\'Azur', type: 'region', climate: 'Mediterranean' },
    }
  },

  // Latin America
  mexico: {
    country: 'Mexico',
    states: {
      'quintana roo': { name: 'Quintana Roo', type: 'state', region: 'Yucatan Peninsula' },
      'yucatan': { name: 'Yucatan', type: 'state', region: 'Yucatan Peninsula' },
      'baja california': { name: 'Baja California', type: 'state', region: 'Baja Peninsula' },
      'jalisco': { name: 'Jalisco', type: 'state', region: 'Pacific Coast' },
    }
  }
};

/**
 * Parses user query to extract geographic intent
 * Examples:
 * - "I like Nova Scotia" → { type: 'province', name: 'Nova Scotia', country: 'Canada' }
 * - "Tell me about Portugal" → { type: 'country', name: 'Portugal' }
 * - "I'm interested in the Algarve" → { type: 'region', name: 'Algarve', country: 'Portugal' }
 */
export function parseGeographicQuery(query) {
  const lowerQuery = query.toLowerCase();

  // Check for provinces/states first (more specific)
  for (const [countryKey, countryData] of Object.entries(GEOGRAPHIC_HIERARCHY)) {
    // Check provinces
    if (countryData.provinces) {
      for (const [provinceKey, provinceData] of Object.entries(countryData.provinces)) {
        if (lowerQuery.includes(provinceKey) || lowerQuery.includes(provinceData.abbr.toLowerCase())) {
          return {
            type: 'province',
            name: provinceData.name,
            abbreviation: provinceData.abbr,
            country: countryData.country,
            region: provinceData.region,
            searchKey: provinceKey
          };
        }
      }
    }

    // Check states
    if (countryData.states) {
      for (const [stateKey, stateData] of Object.entries(countryData.states)) {
        if (lowerQuery.includes(stateKey) || lowerQuery.includes(stateData.abbr.toLowerCase())) {
          return {
            type: 'state',
            name: stateData.name,
            abbreviation: stateData.abbr,
            country: countryData.country,
            region: stateData.region,
            searchKey: stateKey
          };
        }
      }
    }

    // Check regions
    if (countryData.regions) {
      for (const [regionKey, regionData] of Object.entries(countryData.regions)) {
        if (lowerQuery.includes(regionKey)) {
          return {
            type: 'region',
            name: regionData.name,
            country: countryData.country,
            climate: regionData.climate,
            searchKey: regionKey
          };
        }
      }
    }
  }

  // Check for countries
  for (const [countryKey, countryData] of Object.entries(GEOGRAPHIC_HIERARCHY)) {
    if (lowerQuery.includes(countryData.country.toLowerCase())) {
      return {
        type: 'country',
        name: countryData.country,
        searchKey: countryKey
      };
    }
  }

  return null;
}

/**
 * Fetches all towns in a given geographic location from database
 */
export async function getTownsInLocation(geographicInfo) {
  try {
    let query = supabase
      .from('towns')
      .select('id, town_name, country, region, latitude, longitude, quality_of_life, rent_1bed, population');

    if (geographicInfo.type === 'country') {
      query = query.eq('country', geographicInfo.name);
    } else if (geographicInfo.type === 'province' || geographicInfo.type === 'state') {
      query = query
        .eq('country', geographicInfo.country)
        .eq('region', geographicInfo.name);
    } else if (geographicInfo.type === 'region') {
      // For regions, we need to match by country and approximate location
      query = query.eq('country', geographicInfo.country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching towns:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTownsInLocation:', error);
    return [];
  }
}

/**
 * Matches towns to user preferences using our matching algorithm
 * Returns towns sorted by match score
 */
export async function matchTownsToUser(towns, userContext) {
  if (!userContext || towns.length === 0) return towns;

  // For now, return towns sorted by overall_score
  // In the future, this could use the full matching algorithm
  return towns.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
}

/**
 * Formats geographic information for Scotty's prompt
 * This gives Scotty context about what the user is asking about
 */
export function formatGeographicContext(geographicInfo, towns, userContext) {
  if (!geographicInfo) return '';

  const parts = [];

  // Basic geographic info
  if (geographicInfo.type === 'province' || geographicInfo.type === 'state') {
    parts.push(`LOCATION CONTEXT: ${geographicInfo.name} (${geographicInfo.abbreviation}) is a ${geographicInfo.type} in ${geographicInfo.country}.`);
    if (geographicInfo.region) {
      parts.push(`It's part of ${geographicInfo.region}.`);
    }
  } else if (geographicInfo.type === 'country') {
    parts.push(`LOCATION CONTEXT: ${geographicInfo.name} is a country.`);
  } else if (geographicInfo.type === 'region') {
    parts.push(`LOCATION CONTEXT: ${geographicInfo.name} is a region in ${geographicInfo.country}.`);
    if (geographicInfo.climate) {
      parts.push(`Climate: ${geographicInfo.climate}`);
    }
  }

  // Towns available
  if (towns && towns.length > 0) {
    parts.push(`\nAVAILABLE TOWNS IN ${geographicInfo.name.toUpperCase()} (${towns.length} total):`);

    const topTowns = towns.slice(0, 10);
    topTowns.forEach(town => {
      const score = town.overall_score ? ` (score: ${town.overall_score})` : '';
      const rent = town['rent_cost_$'] ? ` - Rent: $${town['rent_cost_$']}/mo` : '';
      const pop = town.population ? ` - Pop: ${town.population.toLocaleString()}` : '';
      parts.push(`  • ${town.town_name}${score}${rent}${pop}`);
    });

    if (towns.length > 10) {
      const remaining = towns.slice(10);
      parts.push(`  ... and ${remaining.length} more: ${remaining.map(t => t.name).join(', ')}`);
    }
  } else {
    parts.push(`\nNOTE: No towns found in our database for ${geographicInfo.name}. You should acknowledge this is a wonderful location but explain that you can only provide detailed recommendations for towns in our database.`);
  }

  // User preference matching
  if (userContext && towns.length > 0) {
    parts.push(`\nUSER MATCH ANALYSIS:`);

    // Budget compatibility
    if (userContext.budget?.total_monthly) {
      const affordableTowns = towns.filter(t => t['rent_cost_$'] && t['rent_cost_$'] <= userContext.budget.total_monthly);
      parts.push(`  • Budget ($${userContext.budget.total_monthly}/mo): ${affordableTowns.length}/${towns.length} towns within budget`);
    }

    // Geographic preferences
    if (userContext.geography?.countries?.length > 0) {
      const matchesPreferences = userContext.geography.countries.some(c =>
        c.toLowerCase() === geographicInfo.country?.toLowerCase() ||
        c.toLowerCase() === geographicInfo.name.toLowerCase()
      );
      if (matchesPreferences) {
        parts.push(`  • ✅ This location matches their stated country preferences!`);
      }
    }

    // Favorites
    if (userContext.favorites?.length > 0) {
      const favoritesInLocation = userContext.favorites.filter(fav =>
        fav.country === geographicInfo.country ||
        fav.country === geographicInfo.name
      );
      if (favoritesInLocation.length > 0) {
        parts.push(`  • ✅ User has ${favoritesInLocation.length} favorite(s) in this location: ${favoritesInLocation.map(f => f.town_name).join(', ')}`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Main function to enhance Scotty with geographic intelligence
 * Call this when processing a user query
 */
export async function enhanceScottyWithGeographicKnowledge(userQuery, userContext) {
  // Parse the query
  const geographicInfo = parseGeographicQuery(userQuery);

  if (!geographicInfo) {
    return null; // Not a geographic query
  }

  // Fetch relevant towns
  const towns = await getTownsInLocation(geographicInfo);

  // Match to user preferences
  const matchedTowns = await matchTownsToUser(towns, userContext);

  // Format context for AI
  let geoContext = formatGeographicContext(geographicInfo, matchedTowns, userContext);

  // 🔍 NEW: Check for preference contradictions
  const contradictionCheck = checkAndFormatContradictions(userContext, geographicInfo);
  if (contradictionCheck.hasContradictions) {
    geoContext += '\n\n' + contradictionCheck.formattedPrompt;
  }

  return {
    geographicInfo,
    towns: matchedTowns,
    contextString: geoContext,
    hasTowns: matchedTowns.length > 0,
    hasContradictions: contradictionCheck.hasContradictions,
    contradictions: contradictionCheck.contradictions || []
  };
}
