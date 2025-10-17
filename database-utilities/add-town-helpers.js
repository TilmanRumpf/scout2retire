/**
 * ADD TOWN HELPER FUNCTIONS
 *
 * All utility functions for the add-town process.
 * Handles geocoding, climate data, cost data, validation, etc.
 */

import fetch from 'node-fetch';
import { REGION_MAPPING, GEO_REGION_MAPPING, CLIMATE_THRESHOLDS } from './add-town-config.js';
import { isValidCategoricalValue, VALID_CATEGORICAL_VALUES } from '../src/utils/validation/categoricalValues.js';

/**
 * Get valid countries from existing towns in database
 */
export async function getValidCountries(supabase) {
  const { data, error } = await supabase
    .from('towns')
    .select('country')
    .order('country');

  if (error) throw error;

  const countries = [...new Set(data.map(t => t.country))].filter(Boolean);
  return countries;
}

/**
 * Geocode a town name to coordinates using OpenStreetMap Nominatim
 * (Free, no API key required)
 */
export async function geocodeTown(townName, country) {
  try {
    const query = encodeURIComponent(`${townName}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Scout2Retire-TownAdder/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Geocoding API returned ${response.status}`);
      return null;
    }

    const results = await response.json();

    if (results.length === 0) {
      console.warn(`⚠️ No geocoding results for "${townName}, ${country}"`);
      return null;
    }

    return {
      lat: parseFloat(results[0].lat),
      lon: parseFloat(results[0].lon),
      display_name: results[0].display_name
    };

  } catch (error) {
    console.warn(`⚠️ Geocoding failed: ${error.message}`);
    return null;
  }
}

/**
 * Determine region (continent) from coordinates and country
 */
export function determineRegion(latitude, longitude, country) {
  // Check each region's lat/lon boundaries
  for (const [key, region] of Object.entries(REGION_MAPPING)) {
    const { latRange, lonRange } = region;

    if (
      latitude >= latRange[0] && latitude <= latRange[1] &&
      longitude >= lonRange[0] && longitude <= lonRange[1]
    ) {
      return region.name;
    }
  }

  // Fallback based on common knowledge
  const regionFallbacks = {
    'Guinea-Bissau': 'Africa',
    'Spain': 'Europe',
    'Portugal': 'Europe',
    'Thailand': 'Asia',
    'Mexico': 'North America',
    'Brazil': 'South America',
    'Australia': 'Oceania'
  };

  return regionFallbacks[country] || null;
}

/**
 * Determine geo_region (sub-region) from country
 */
export function determineGeoRegion(latitude, longitude, country) {
  // Use country-based mapping first
  if (GEO_REGION_MAPPING[country]) {
    return GEO_REGION_MAPPING[country];
  }

  // Fallback to basic geographic analysis
  if (latitude > 0 && longitude < 0) {
    return 'Northern Hemisphere - Western';
  } else if (latitude > 0 && longitude > 0) {
    return 'Northern Hemisphere - Eastern';
  } else if (latitude < 0 && longitude < 0) {
    return 'Southern Hemisphere - Western';
  } else {
    return 'Southern Hemisphere - Eastern';
  }
}

/**
 * Get timezone from coordinates using free TimeZoneDB-like service
 * Note: For production, consider using a proper API like Google Maps Timezone API
 */
export async function getTimezoneFromCoords(latitude, longitude) {
  try {
    // Use a simple geographic approximation for now
    // Each 15 degrees of longitude = 1 hour difference from UTC
    const hourOffset = Math.round(longitude / 15);
    const sign = hourOffset >= 0 ? '+' : '';
    return `UTC${sign}${hourOffset}:00`;

  } catch (error) {
    console.warn(`⚠️ Timezone detection failed: ${error.message}`);
    return null;
  }
}

/**
 * Fetch climate data from Open-Meteo (free weather API)
 */
export async function fetchClimateData(latitude, longitude) {
  try {
    // Open-Meteo provides historical climate data for free
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`⚠️ Climate API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.daily) {
      return null;
    }

    // Calculate averages for summer (Jun-Aug) and winter (Dec-Feb)
    const temps = data.daily.temperature_2m_mean;
    const precip = data.daily.precipitation_sum;

    // Summer months: indices 151-242 (Jun-Aug for 2023)
    const summerTemps = temps.slice(151, 243).filter(t => t !== null);
    const avgSummerTemp = summerTemps.length > 0
      ? Math.round(summerTemps.reduce((a, b) => a + b, 0) / summerTemps.length)
      : null;

    // Winter months: indices 0-59 and 334-365 (Jan-Feb and Dec for 2023)
    const winterTemps = [...temps.slice(0, 60), ...temps.slice(334)].filter(t => t !== null);
    const avgWinterTemp = winterTemps.length > 0
      ? Math.round(winterTemps.reduce((a, b) => a + b, 0) / winterTemps.length)
      : null;

    // Annual rainfall
    const annualRainfall = precip.filter(p => p !== null).reduce((a, b) => a + b, 0);

    return {
      avgSummerTemp,
      avgWinterTemp,
      annualRainfall: Math.round(annualRainfall),
      sunshineHours: null, // Not available from this API
      humidity: null
    };

  } catch (error) {
    console.warn(`⚠️ Climate data fetch failed: ${error.message}`);
    return null;
  }
}

/**
 * Categorize temperature to valid categorical value
 */
export function categorizeTemperature(temp, season) {
  if (temp === null || temp === undefined) return null;

  const thresholds = season === 'summer'
    ? CLIMATE_THRESHOLDS.summer_temp
    : CLIMATE_THRESHOLDS.winter_temp;

  for (const [category, range] of Object.entries(thresholds)) {
    if (range.max !== undefined && temp <= range.max) return category;
    if (range.min !== undefined && range.max === undefined && temp >= range.min) return category;
    if (range.min !== undefined && range.max !== undefined && temp >= range.min && temp <= range.max) return category;
  }

  return null;
}

/**
 * Categorize sunshine hours
 */
export function categorizeSunshine(hours) {
  if (hours === null || hours === undefined) return null;

  for (const [category, range] of Object.entries(CLIMATE_THRESHOLDS.sunshine_hours)) {
    if (range.max !== undefined && hours <= range.max) return category;
    if (range.min !== undefined && range.max === undefined && hours >= range.min) return category;
    if (range.min !== undefined && range.max !== undefined && hours >= range.min && hours <= range.max) return category;
  }

  return null;
}

/**
 * Categorize precipitation
 */
export function categorizePrecipitation(rainfall) {
  if (rainfall === null || rainfall === undefined) return null;

  for (const [category, range] of Object.entries(CLIMATE_THRESHOLDS.annual_rainfall)) {
    if (range.max !== undefined && rainfall <= range.max) return category;
    if (range.min !== undefined && range.max === undefined && rainfall >= range.min) return category;
    if (range.min !== undefined && range.max !== undefined && rainfall >= range.min && rainfall <= range.max) return category;
  }

  return null;
}

/**
 * Categorize humidity
 */
export function categorizeHumidity(humidity) {
  if (humidity === null || humidity === undefined) return null;

  for (const [category, range] of Object.entries(CLIMATE_THRESHOLDS.humidity)) {
    if (range.max !== undefined && humidity <= range.max) return category;
    if (range.min !== undefined && range.max === undefined && humidity >= range.min) return category;
    if (range.min !== undefined && range.max !== undefined && humidity >= range.min && humidity <= range.max) return category;
  }

  return null;
}

/**
 * Fetch cost data (placeholder - real implementation would use Numbeo API)
 */
export async function fetchCostData(townName, country) {
  // Note: Numbeo API requires subscription
  // For now, return null and log that manual research is needed
  console.warn(`⚠️ Cost data for ${townName}, ${country} must be researched manually`);
  return null;
}

/**
 * Validate all categorical values in town data
 */
export function validateCategoricalValues(townData) {
  const errors = [];

  // Get all categorical fields from validation schema
  const categoricalFields = Object.keys(VALID_CATEGORICAL_VALUES);

  categoricalFields.forEach(field => {
    const value = townData[field];

    if (value !== null && value !== undefined && value !== '') {
      // Check if value is valid (case-insensitive)
      if (!isValidCategoricalValue(field, value)) {
        errors.push({
          field,
          value,
          validOptions: VALID_CATEGORICAL_VALUES[field],
          message: `Invalid value "${value}" for ${field}. Must be one of: ${VALID_CATEGORICAL_VALUES[field].join(', ')}`
        });
      }
    }
  });

  if (errors.length > 0) {
    throw new Error(`Categorical validation failed:\n${errors.map(e => e.message).join('\n')}`);
  }

  return true;
}

/**
 * Calculate data completeness score
 */
export function calculateDataCompleteness(townData, fieldTiers) {
  const { critical, important } = fieldTiers;

  // Weight distribution
  const weights = {
    critical: 40,
    important: 30,
    nice_to_have: 30
  };

  // Calculate critical score
  const criticalFilled = critical.filter(f => townData[f] != null && townData[f] !== '').length;
  const criticalScore = criticalFilled / critical.length;

  // Calculate important score
  const importantFilled = important.filter(f => townData[f] != null && townData[f] !== '').length;
  const importantScore = importantFilled / important.length;

  // Calculate nice-to-have score (all other fields)
  const allFields = Object.keys(townData).filter(f =>
    !f.startsWith('_') && // Exclude metadata
    !critical.includes(f) &&
    !important.includes(f)
  );
  const niceToHaveFilled = allFields.filter(f => townData[f] != null && townData[f] !== '').length;
  const niceToHaveScore = allFields.length > 0 ? niceToHaveFilled / allFields.length : 0;

  // Weighted total
  const totalScore = Math.round(
    (criticalScore * weights.critical) +
    (importantScore * weights.important) +
    (niceToHaveScore * weights.nice_to_have)
  );

  return {
    data_completeness_score: totalScore,
    breakdown: {
      critical: Math.round(criticalScore * 100),
      important: Math.round(importantScore * 100),
      nice_to_have: Math.round(niceToHaveScore * 100)
    },
    missing_critical: critical.filter(f => townData[f] == null || townData[f] === ''),
    missing_important: important.filter(f => townData[f] == null || townData[f] === '')
  };
}
