/**
 * Town Display Utilities
 * Formats town names for consistent display across the application
 *
 * Format: "Gainesville (FL), USA" instead of "Gainesville, United States (Florida)"
 */

import { GEOGRAPHIC_HIERARCHY } from './scottyGeographicKnowledge.js';

/**
 * Maps full country names to abbreviations
 */
const COUNTRY_ABBREVIATIONS = {
  'United States': 'USA',
  'United Kingdom': 'UK',
  'United Arab Emirates': 'UAE',
  // Most other countries use their full name
};

/**
 * Get state/province abbreviation from full name
 * @param {string} regionName - Full region name like "Florida" or "British Columbia"
 * @param {string} country - Country name to determine which mapping to use
 * @returns {string|null} - Abbreviation like "FL" or null if not found
 */
function getRegionAbbreviation(regionName, country) {
  if (!regionName) return null;

  const lowerRegion = regionName.toLowerCase();
  const lowerCountry = country.toLowerCase();

  // Check USA states
  if (lowerCountry === 'united states' || lowerCountry === 'usa') {
    const stateInfo = GEOGRAPHIC_HIERARCHY.usa?.states?.[lowerRegion];
    if (stateInfo) return stateInfo.abbr;
  }

  // Check Canadian provinces
  if (lowerCountry === 'canada') {
    const provinceInfo = GEOGRAPHIC_HIERARCHY.canada?.provinces?.[lowerRegion];
    if (provinceInfo) return provinceInfo.abbr;
  }

  // Check Mexican states
  if (lowerCountry === 'mexico') {
    const stateInfo = GEOGRAPHIC_HIERARCHY.mexico?.states?.[lowerRegion];
    if (stateInfo?.abbr) return stateInfo.abbr;
  }

  return null;
}

/**
 * Get country abbreviation
 * @param {string} country - Full country name
 * @returns {string} - Abbreviated country name or original if no abbreviation
 */
function getCountryAbbreviation(country) {
  return COUNTRY_ABBREVIATIONS[country] || country;
}

/**
 * Format town name with state abbreviation and country abbreviation
 *
 * Examples:
 * - formatTownDisplay({ town_name: 'Gainesville', region: 'Florida', country: 'United States' })
 *   → "Gainesville (FL), USA"
 *
 * - formatTownDisplay({ town_name: 'Valencia', country: 'Spain' })
 *   → "Valencia, Spain"
 *
 * - formatTownDisplay({ town_name: 'Toronto', region: 'Ontario', country: 'Canada' })
 *   → "Toronto (ON), Canada"
 *
 * @param {Object} town - Town object with town_name, region, and country
 * @param {Object} options - Formatting options
 * @param {boolean} options.showRegion - Whether to show region (default: true)
 * @param {boolean} options.abbreviateCountry - Whether to abbreviate country (default: true)
 * @returns {string} - Formatted town display string
 */
export function formatTownDisplay(town, options = {}) {
  const {
    showRegion = true,
    abbreviateCountry = true,
  } = options;

  if (!town) return '';

  let townName = town.town_name || '';
  const region = town.region || '';
  const country = town.country || '';

  // DEFENSIVE: Check if town_name already contains state abbreviation in parentheses
  // Example: "Gainesville (FL)" should not become "Gainesville (FL) (FL)"
  const hasStateInName = /\([A-Z]{2}\)/.test(townName);

  if (hasStateInName) {
    // Town name already has state abbreviation, just add country
    const countryDisplay = abbreviateCountry ? getCountryAbbreviation(country) : country;
    return `${townName}, ${countryDisplay}`;
  }

  // Get abbreviations
  const regionAbbr = showRegion ? getRegionAbbreviation(region, country) : null;
  const countryDisplay = abbreviateCountry ? getCountryAbbreviation(country) : country;

  // Format: "Town (ST), Country" or "Town, Country"
  if (regionAbbr) {
    return `${townName} (${regionAbbr}), ${countryDisplay}`;
  } else {
    return `${townName}, ${countryDisplay}`;
  }
}

/**
 * Format town name for compact display (just town + state if US/Canada)
 * Example: "Gainesville (FL)" or "Valencia"
 *
 * @param {Object} town - Town object
 * @returns {string} - Compact formatted string
 */
export function formatTownCompact(town) {
  if (!town) return '';

  const townName = town.town_name || '';
  const region = town.region || '';
  const country = town.country || '';

  const regionAbbr = getRegionAbbreviation(region, country);

  if (regionAbbr) {
    return `${townName} (${regionAbbr})`;
  } else {
    return townName;
  }
}

/**
 * Format town name with full region name (no abbreviations)
 * Example: "Gainesville (Florida), United States"
 *
 * @param {Object} town - Town object
 * @returns {string} - Formatted string with full names
 */
export function formatTownFull(town) {
  if (!town) return '';

  const townName = town.town_name || '';
  const region = town.region || '';
  const country = town.country || '';

  if (region) {
    return `${townName} (${region}), ${country}`;
  } else {
    return `${townName}, ${country}`;
  }
}
