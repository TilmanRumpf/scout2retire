#!/usr/bin/env node

// SCHEMA ANALYSIS SCRIPT for TOWNS_PREFERENCES_MAPPING document
// Gathers comprehensive schema and data range information

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function analyzeSchema() {
  console.log('🔍 SCHEMA ANALYSIS - Scout2Retire Database');
  console.log('📅 Analysis Date: August 25, 2025');
  console.log('=' .repeat(60));

  try {
    // 1. Get column information for both tables
    console.log('\n1️⃣ COLUMN INFORMATION');
    console.log('-'.repeat(40));

    // Towns table columns
    console.log('\n📊 TOWNS TABLE COLUMNS:');
    const { data: townsData, error: townsError } = await supabase
      .from('towns')
      .select('*')
      .limit(1);

    if (townsError) {
      console.error('❌ Error accessing towns table:', townsError.message);
    } else if (townsData && townsData.length > 0) {
      const townsColumns = Object.keys(townsData[0]);
      console.log(`   Total columns: ${townsColumns.length}`);
      townsColumns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
    }

    // User preferences table columns
    console.log('\n👤 USER_PREFERENCES TABLE COLUMNS:');
    const { data: userPrefData, error: userPrefError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);

    if (userPrefError) {
      console.error('❌ Error accessing user_preferences table:', userPrefError.message);
    } else if (userPrefData && userPrefData.length > 0) {
      const userPrefColumns = Object.keys(userPrefData[0]);
      console.log(`   Total columns: ${userPrefColumns.length}`);
      userPrefColumns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
    }

    // 2. Get numerical value ranges
    console.log('\n\n2️⃣ NUMERICAL VALUE RANGES');
    console.log('-'.repeat(40));

    // Temperature ranges
    console.log('\n🌡️ TEMPERATURE RANGES:');
    const { data: tempData } = await supabase
      .from('towns')
      .select('summer_temperature_high, summer_temperature_low, winter_temperature_high, winter_temperature_low')
      .not('summer_temperature_high', 'is', null)
      .not('winter_temperature_low', 'is', null);

    if (tempData && tempData.length > 0) {
      const summerHighs = tempData.map(t => t.summer_temperature_high).filter(t => t !== null);
      const summerLows = tempData.map(t => t.summer_temperature_low).filter(t => t !== null);
      const winterHighs = tempData.map(t => t.winter_temperature_high).filter(t => t !== null);
      const winterLows = tempData.map(t => t.winter_temperature_low).filter(t => t !== null);

      console.log(`   Summer High: ${Math.min(...summerHighs)}°F - ${Math.max(...summerHighs)}°F`);
      console.log(`   Summer Low: ${Math.min(...summerLows)}°F - ${Math.max(...summerLows)}°F`);
      console.log(`   Winter High: ${Math.min(...winterHighs)}°F - ${Math.max(...winterHighs)}°F`);
      console.log(`   Winter Low: ${Math.min(...winterLows)}°F - ${Math.max(...winterLows)}°F`);
    }

    // Cost ranges
    console.log('\n💰 COST RANGES:');
    const { data: costData } = await supabase
      .from('towns')
      .select('cost_of_living_index, housing_cost_median, overall_cost_rating')
      .not('cost_of_living_index', 'is', null);

    if (costData && costData.length > 0) {
      const costIndices = costData.map(c => c.cost_of_living_index).filter(c => c !== null);
      const housingCosts = costData.map(c => c.housing_cost_median).filter(c => c !== null);
      const overallRatings = costData.map(c => c.overall_cost_rating).filter(c => c !== null);

      if (costIndices.length > 0) {
        console.log(`   Cost of Living Index: ${Math.min(...costIndices)} - ${Math.max(...costIndices)}`);
      }
      if (housingCosts.length > 0) {
        console.log(`   Housing Cost Median: $${Math.min(...housingCosts)} - $${Math.max(...housingCosts)}`);
      }
      if (overallRatings.length > 0) {
        console.log(`   Overall Cost Rating: ${Math.min(...overallRatings)} - ${Math.max(...overallRatings)}`);
      }
    }

    // Population ranges
    console.log('\n👥 POPULATION RANGES:');
    const { data: popData } = await supabase
      .from('towns')
      .select('population')
      .not('population', 'is', null);

    if (popData && popData.length > 0) {
      const populations = popData.map(p => p.population).filter(p => p !== null);
      if (populations.length > 0) {
        console.log(`   Population: ${Math.min(...populations).toLocaleString()} - ${Math.max(...populations).toLocaleString()}`);
      }
    }

    // Distance to ocean ranges
    console.log('\n🌊 DISTANCE TO OCEAN RANGES:');
    const { data: oceanData } = await supabase
      .from('towns')
      .select('distance_to_ocean')
      .not('distance_to_ocean', 'is', null);

    if (oceanData && oceanData.length > 0) {
      const distances = oceanData.map(d => d.distance_to_ocean).filter(d => d !== null);
      if (distances.length > 0) {
        console.log(`   Distance to Ocean: ${Math.min(...distances)} - ${Math.max(...distances)} miles`);
      }
    }

    // Elevation ranges
    console.log('\n⛰️ ELEVATION RANGES:');
    const { data: elevData } = await supabase
      .from('towns')
      .select('elevation')
      .not('elevation', 'is', null);

    if (elevData && elevData.length > 0) {
      const elevations = elevData.map(e => e.elevation).filter(e => e !== null);
      if (elevations.length > 0) {
        console.log(`   Elevation: ${Math.min(...elevations)} - ${Math.max(...elevations)} feet`);
      }
    }

    // Tax rates
    console.log('\n💸 TAX RANGES:');
    const { data: taxData } = await supabase
      .from('towns')
      .select('state_income_tax, property_tax_rate, sales_tax_rate')
      .not('property_tax_rate', 'is', null);

    if (taxData && taxData.length > 0) {
      const propTaxRates = taxData.map(t => t.property_tax_rate).filter(t => t !== null);
      const salesTaxRates = taxData.map(t => t.sales_tax_rate).filter(t => t !== null);
      const stateTaxRates = taxData.map(t => t.state_income_tax).filter(t => t !== null);

      if (propTaxRates.length > 0) {
        console.log(`   Property Tax Rate: ${Math.min(...propTaxRates)}% - ${Math.max(...propTaxRates)}%`);
      }
      if (salesTaxRates.length > 0) {
        console.log(`   Sales Tax Rate: ${Math.min(...salesTaxRates)}% - ${Math.max(...salesTaxRates)}%`);
      }
      if (stateTaxRates.length > 0) {
        console.log(`   State Income Tax: ${Math.min(...stateTaxRates)}% - ${Math.max(...stateTaxRates)}%`);
      }
    }

    // Air quality
    console.log('\n🌬️ AIR QUALITY RANGES:');
    const { data: airData } = await supabase
      .from('towns')
      .select('air_quality_index')
      .not('air_quality_index', 'is', null);

    if (airData && airData.length > 0) {
      const airIndices = airData.map(a => a.air_quality_index).filter(a => a !== null);
      if (airIndices.length > 0) {
        console.log(`   Air Quality Index: ${Math.min(...airIndices)} - ${Math.max(...airIndices)}`);
      }
    }

    // 3. Get categorical values
    console.log('\n\n3️⃣ CATEGORICAL VALUES');
    console.log('-'.repeat(40));

    // Climate types
    console.log('\n🌤️ CLIMATE TYPES:');
    const { data: climateData } = await supabase
      .from('towns')
      .select('climate')
      .not('climate', 'is', null);

    if (climateData) {
      const climateTypes = [...new Set(climateData.map(c => c.climate).filter(c => c))].sort();
      climateTypes.forEach((climate, index) => {
        console.log(`   ${index + 1}. "${climate}"`);
      });
    }

    // Urban/Rural character
    console.log('\n🏙️ URBAN/RURAL CHARACTER VALUES:');
    const { data: urbanData } = await supabase
      .from('towns')
      .select('urban_rural_character')
      .not('urban_rural_character', 'is', null);

    if (urbanData) {
      const urbanTypes = [...new Set(urbanData.map(u => u.urban_rural_character).filter(u => u))].sort();
      urbanTypes.forEach((type, index) => {
        console.log(`   ${index + 1}. "${type}"`);
      });
    }

    // Pace of life
    console.log('\n⚡ PACE OF LIFE VALUES:');
    const { data: paceData } = await supabase
      .from('towns')
      .select('pace_of_life')
      .not('pace_of_life', 'is', null);

    if (paceData) {
      const paceTypes = [...new Set(paceData.map(p => p.pace_of_life).filter(p => p))].sort();
      paceTypes.forEach((pace, index) => {
        console.log(`   ${index + 1}. "${pace}"`);
      });
    }

    // Safety/Crime levels
    console.log('\n🛡️ SAFETY/CRIME LEVELS:');
    const { data: safetyData } = await supabase
      .from('towns')
      .select('crime_rate, safety_rating')
      .not('crime_rate', 'is', null);

    if (safetyData) {
      const crimeRates = [...new Set(safetyData.map(s => s.crime_rate).filter(s => s))].sort();
      const safetyRatings = [...new Set(safetyData.map(s => s.safety_rating).filter(s => s))].sort();
      
      console.log('   Crime Rate Values:');
      crimeRates.forEach((rate, index) => {
        console.log(`     ${index + 1}. "${rate}"`);
      });
      
      console.log('   Safety Rating Values:');
      safetyRatings.forEach((rating, index) => {
        console.log(`     ${index + 1}. "${rating}"`);
      });
    }

    // Expat community size
    console.log('\n🌍 EXPAT COMMUNITY SIZE VALUES:');
    const { data: expatData } = await supabase
      .from('towns')
      .select('expat_community_size')
      .not('expat_community_size', 'is', null);

    if (expatData) {
      const expatSizes = [...new Set(expatData.map(e => e.expat_community_size).filter(e => e))].sort();
      expatSizes.forEach((size, index) => {
        console.log(`   ${index + 1}. "${size}"`);
      });
    }

    // 4. Get array field samples
    console.log('\n\n4️⃣ ARRAY FIELD SAMPLES');
    console.log('-'.repeat(40));

    // Geographic features
    console.log('\n🗺️ GEOGRAPHIC FEATURES SAMPLES:');
    const { data: geoData } = await supabase
      .from('towns')
      .select('geographic_features_actual')
      .not('geographic_features_actual', 'is', null)
      .limit(10);

    if (geoData) {
      const allGeoFeatures = new Set();
      geoData.forEach(town => {
        if (town.geographic_features_actual && Array.isArray(town.geographic_features_actual)) {
          town.geographic_features_actual.forEach(feature => allGeoFeatures.add(feature));
        }
      });
      
      [...allGeoFeatures].sort().forEach((feature, index) => {
        console.log(`   ${index + 1}. "${feature}"`);
      });
    }

    // Vegetation types
    console.log('\n🌿 VEGETATION TYPES SAMPLES:');
    const { data: vegData } = await supabase
      .from('towns')
      .select('vegetation')
      .not('vegetation', 'is', null)
      .limit(10);

    if (vegData) {
      const allVegetation = new Set();
      vegData.forEach(town => {
        if (town.vegetation && Array.isArray(town.vegetation)) {
          town.vegetation.forEach(veg => allVegetation.add(veg));
        }
      });
      
      [...allVegetation].sort().forEach((veg, index) => {
        console.log(`   ${index + 1}. "${veg}"`);
      });
    }

    // Regions
    console.log('\n🌎 REGIONS SAMPLES:');
    const { data: regionData } = await supabase
      .from('towns')
      .select('regions')
      .not('regions', 'is', null)
      .limit(10);

    if (regionData) {
      const allRegions = new Set();
      regionData.forEach(town => {
        if (town.regions && Array.isArray(town.regions)) {
          town.regions.forEach(region => allRegions.add(region));
        }
      });
      
      [...allRegions].sort().forEach((region, index) => {
        console.log(`   ${index + 1}. "${region}"`);
      });
    }

    // Activities available
    console.log('\n🎯 ACTIVITIES AVAILABLE SAMPLES:');
    const { data: activityData } = await supabase
      .from('towns')
      .select('activities_available')
      .not('activities_available', 'is', null)
      .limit(10);

    if (activityData) {
      const allActivities = new Set();
      activityData.forEach(town => {
        if (town.activities_available && Array.isArray(town.activities_available)) {
          town.activities_available.forEach(activity => allActivities.add(activity));
        }
      });
      
      [...allActivities].sort().forEach((activity, index) => {
        console.log(`   ${index + 1}. "${activity}"`);
      });
    }

    // 5. Get total counts
    console.log('\n\n5️⃣ DATABASE STATISTICS');
    console.log('-'.repeat(40));

    const { data: townCountData } = await supabase
      .from('towns')
      .select('id', { count: 'exact' });

    const { data: userPrefCountData } = await supabase
      .from('user_preferences')
      .select('id', { count: 'exact' });

    console.log(`\n📊 Total towns: ${townCountData ? townCountData.length : 'Unknown'}`);
    console.log(`👤 Total user preferences: ${userPrefCountData ? userPrefCountData.length : 'Unknown'}`);

    console.log('\n✅ Schema analysis completed successfully!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Error during schema analysis:', error);
  }
}

// Run the analysis
analyzeSchema().catch(console.error);