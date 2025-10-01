/**
 * Town Import System for Scout2Retire
 * 
 * Future-proof system for importing and managing towns
 * Handles duplicates, partial data, and provides comprehensive logging
 */

import supabase from './supabaseClient';

/**
 * Import towns from an array of town data
 * @param {Array} towns - Array of town objects with name, country, and optional fields
 * @param {Object} options - Import options
 * @returns {Object} Import results with detailed statistics
 */
export async function importTowns(towns, options = {}) {
  const {
    batchSize = 10,
    skipExisting = true,
    updateExisting = false,
    dryRun = false,
    onProgress = null
  } = options;

  const results = {
    total: towns.length,
    imported: 0,
    skipped: 0,
    updated: 0,
    errors: 0,
    details: [],
    startTime: new Date(),
    endTime: null
  };

  // Clean and normalize country names
  const normalizedTowns = towns.map(town => ({
    ...town,
    country: normalizeCountryName(town.country),
    name: town.name.trim()
  }));

  // Get existing towns for duplicate checking
  const { data: existingTowns, error: fetchError } = await supabase
    .from('towns')
    .select('id, name, country');

  if (fetchError) {
    console.error('Error fetching existing towns:', fetchError);
    return { ...results, error: fetchError };
  }

  // Create lookup map for existing towns
  const existingMap = new Map();
  existingTowns.forEach(town => {
    const key = `${town.name.toLowerCase()}_${town.country.toLowerCase()}`;
    existingMap.set(key, town);
  });

  // Process towns in batches
  for (let i = 0; i < normalizedTowns.length; i += batchSize) {
    const batch = normalizedTowns.slice(i, i + batchSize);
    const batchResults = [];

    for (const town of batch) {
      const key = `${town.name.toLowerCase()}_${town.country.toLowerCase()}`;
      const exists = existingMap.has(key);

      if (exists && skipExisting && !updateExisting) {
        results.skipped++;
        batchResults.push({
          town: `${town.name}, ${town.country}`,
          status: 'skipped',
          reason: 'already exists'
        });
        continue;
      }

      // Map town data to database columns
      const townData = mapTownToDatabase(town);

      if (dryRun) {
        console.log(`[DRY RUN] Would import: ${town.name}, ${town.country}`);
        batchResults.push({
          town: `${town.name}, ${town.country}`,
          status: 'dry-run',
          data: townData
        });
        continue;
      }

      try {
        if (exists && updateExisting) {
          // Update existing town
          const { error } = await supabase
            .from('towns')
            .update(townData)
            .eq('id', existingMap.get(key).id);

          if (error) throw error;
          
          results.updated++;
          batchResults.push({
            town: `${town.name}, ${town.country}`,
            status: 'updated'
          });
        } else if (!exists) {
          // Insert new town
          const { error } = await supabase
            .from('towns')
            .insert(townData);

          if (error) throw error;
          
          results.imported++;
          batchResults.push({
            town: `${town.name}, ${town.country}`,
            status: 'imported'
          });
        }
      } catch (error) {
        console.error(`Error processing ${town.name}, ${town.country}:`, error);
        results.errors++;
        batchResults.push({
          town: `${town.name}, ${town.country}`,
          status: 'error',
          error: error.message
        });
      }
    }

    results.details.push(...batchResults);
    
    // Report progress
    if (onProgress) {
      const progress = Math.round(((i + batch.length) / normalizedTowns.length) * 100);
      onProgress(progress, results);
    }
  }

  results.endTime = new Date();
  results.duration = (results.endTime - results.startTime) / 1000; // seconds

  return results;
}

/**
 * Map town data to database columns
 */
function mapTownToDatabase(town) {
  return {
    name: town.name,
    country: town.country,
    // Map continent to region if not provided
    region: town.region || town.continent || null,
    // Map all available fields with defaults
    cost_index: town.cost_index || null,
    healthcare_score: town.healthcare_score || null,
    safety_score: town.safety_score || null,
    climate: town.climate || null,
    description: town.description || null,
    population: town.population || null,
    // Add regions array for better matching
    regions: town.regions || [town.continent, town.category].filter(Boolean),
    // Handle any additional fields
    ...extractAdditionalFields(town)
  };
}

/**
 * Extract additional fields that might be useful
 */
function extractAdditionalFields(town) {
  const additional = {};
  
  // Map category to climate or lifestyle description
  if (town.category) {
    if (town.category.includes('Mediterranean')) {
      additional.climate_description = 'Mediterranean climate';
    } else if (town.category.includes('Caribbean')) {
      additional.climate_description = 'Tropical Caribbean climate';
    }
  }
  
  return additional;
}

/**
 * Normalize country names to match database format
 */
export function normalizeCountryName(country) {
  if (!country) return '';
  
  // Remove parenthetical information
  let normalized = country.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Common replacements
  const replacements = {
    'USA': 'United States',
    'UK': 'United Kingdom',
    '&': 'and',
    'Fed.States': 'Federal States',
    'St.': 'Saint'
  };
  
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  });
  
  return normalized;
}

/**
 * Get current town statistics
 */
export async function getTownStats() {
  const { count, error } = await supabase
    .from('towns')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error getting town stats:', error);
    return null;
  }
  
  // Get country distribution
  const { data: countries } = await supabase
    .from('towns')
    .select('country')
    .order('country');
    
  const countryStats = {};
  if (countries) {
    countries.forEach(({ country }) => {
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
  }
  
  return {
    total: count,
    byCountry: countryStats,
    countries: Object.keys(countryStats).length
  };
}

/**
 * Import towns from CSV content
 */
export async function importFromCSV(csvContent, options = {}) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim());
  
  const towns = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const town = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      if (value) {
        // Map CSV headers to our format
        switch(header.toLowerCase()) {
          case 'town name':
            town.name = value;
            break;
          case 'country':
            town.country = value;
            break;
          case 'continent':
            town.continent = value;
            break;
          case 'region (state/privince)':
          case 'region':
            town.region = value;
            break;
          case 'retirement category':
          case 'category':
            town.category = value;
            break;
          default:
            town[header.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      }
    });
    
    if (town.name && town.country) {
      towns.push(town);
    }
  }
  
  return importTowns(towns, options);
}

/**
 * Validate town data before import
 */
export function validateTownData(towns) {
  const issues = [];
  const required = ['name', 'country'];
  
  towns.forEach((town, index) => {
    const townIssues = [];
    
    // Check required fields
    required.forEach(field => {
      if (!town[field]) {
        townIssues.push(`Missing required field: ${field}`);
      }
    });
    
    // Check data types
    if (town.cost_index && isNaN(town.cost_index)) {
      townIssues.push('cost_index must be a number');
    }
    
    if (town.healthcare_score && (isNaN(town.healthcare_score) || town.healthcare_score < 0 || town.healthcare_score > 10)) {
      townIssues.push('healthcare_score must be a number between 0 and 10');
    }
    
    if (townIssues.length > 0) {
      issues.push({
        index,
        town: `${town.name || 'Unknown'}, ${town.country || 'Unknown'}`,
        issues: townIssues
      });
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}