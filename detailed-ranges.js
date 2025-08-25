#!/usr/bin/env node

// DETAILED RANGES ANALYSIS - Get missing numerical ranges

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function getDetailedRanges() {
  console.log('🔍 DETAILED RANGES ANALYSIS');
  console.log('=' .repeat(50));

  try {
    // Get all numerical columns and their ranges
    const { data: allTowns } = await supabase
      .from('towns')
      .select('*');

    if (!allTowns || allTowns.length === 0) {
      console.log('❌ No towns data found');
      return;
    }

    console.log(`📊 Analyzing ${allTowns.length} towns...`);

    // Temperature ranges
    console.log('\n🌡️ TEMPERATURE RANGES:');
    const temps = {
      avg_temp_summer: allTowns.map(t => t.avg_temp_summer).filter(v => v !== null && v !== undefined),
      avg_temp_winter: allTowns.map(t => t.avg_temp_winter).filter(v => v !== null && v !== undefined)
    };
    
    if (temps.avg_temp_summer.length > 0) {
      console.log(`   Summer Average: ${Math.min(...temps.avg_temp_summer)}°C - ${Math.max(...temps.avg_temp_summer)}°C`);
    }
    if (temps.avg_temp_winter.length > 0) {
      console.log(`   Winter Average: ${Math.min(...temps.avg_temp_winter)}°C - ${Math.max(...temps.avg_temp_winter)}°C`);
    }

    // Cost ranges
    console.log('\n💰 COST RANGES:');
    const costs = {
      cost_index: allTowns.map(t => t.cost_index).filter(v => v !== null && v !== undefined),
      cost_of_living_usd: allTowns.map(t => t.cost_of_living_usd).filter(v => v !== null && v !== undefined),
      rent_1bed: allTowns.map(t => t.rent_1bed).filter(v => v !== null && v !== undefined),
      rent_2bed_usd: allTowns.map(t => t.rent_2bed_usd).filter(v => v !== null && v !== undefined),
      typical_monthly_living_cost: allTowns.map(t => t.typical_monthly_living_cost).filter(v => v !== null && v !== undefined),
      typical_rent_1bed: allTowns.map(t => t.typical_rent_1bed).filter(v => v !== null && v !== undefined),
      typical_home_price: allTowns.map(t => t.typical_home_price).filter(v => v !== null && v !== undefined),
      purchase_apartment_sqm_usd: allTowns.map(t => t.purchase_apartment_sqm_usd).filter(v => v !== null && v !== undefined)
    };

    Object.entries(costs).forEach(([key, values]) => {
      if (values.length > 0) {
        console.log(`   ${key}: $${Math.min(...values)} - $${Math.max(...values)}`);
      }
    });

    // Distance and elevation
    console.log('\n🌊 DISTANCE & ELEVATION:');
    const geo = {
      distance_to_ocean_km: allTowns.map(t => t.distance_to_ocean_km).filter(v => v !== null && v !== undefined),
      elevation_meters: allTowns.map(t => t.elevation_meters).filter(v => v !== null && v !== undefined),
      airport_distance: allTowns.map(t => t.airport_distance).filter(v => v !== null && v !== undefined),
      nearest_major_hospital_km: allTowns.map(t => t.nearest_major_hospital_km).filter(v => v !== null && v !== undefined)
    };

    Object.entries(geo).forEach(([key, values]) => {
      if (values.length > 0) {
        const unit = key.includes('elevation') ? 'm' : 'km';
        console.log(`   ${key}: ${Math.min(...values)}${unit} - ${Math.max(...values)}${unit}`);
      }
    });

    // Tax rates
    console.log('\n💸 TAX RATES:');
    const taxes = {
      income_tax_rate_pct: allTowns.map(t => t.income_tax_rate_pct).filter(v => v !== null && v !== undefined),
      sales_tax_rate_pct: allTowns.map(t => t.sales_tax_rate_pct).filter(v => v !== null && v !== undefined),
      property_tax_rate_pct: allTowns.map(t => t.property_tax_rate_pct).filter(v => v !== null && v !== undefined)
    };

    Object.entries(taxes).forEach(([key, values]) => {
      if (values.length > 0) {
        console.log(`   ${key}: ${Math.min(...values)}% - ${Math.max(...values)}%`);
      }
    });

    // Quality scores and ratings
    console.log('\n⭐ QUALITY SCORES & RATINGS:');
    const scores = {
      healthcare_score: allTowns.map(t => t.healthcare_score).filter(v => v !== null && v !== undefined),
      safety_score: allTowns.map(t => t.safety_score).filter(v => v !== null && v !== undefined),
      quality_of_life: allTowns.map(t => t.quality_of_life).filter(v => v !== null && v !== undefined),
      nightlife_rating: allTowns.map(t => t.nightlife_rating).filter(v => v !== null && v !== undefined),
      museums_rating: allTowns.map(t => t.museums_rating).filter(v => v !== null && v !== undefined),
      restaurants_rating: allTowns.map(t => t.restaurants_rating).filter(v => v !== null && v !== undefined),
      cultural_rating: allTowns.map(t => t.cultural_rating).filter(v => v !== null && v !== undefined),
      outdoor_rating: allTowns.map(t => t.outdoor_rating).filter(v => v !== null && v !== undefined),
      walkability: allTowns.map(t => t.walkability).filter(v => v !== null && v !== undefined)
    };

    Object.entries(scores).forEach(([key, values]) => {
      if (values.length > 0) {
        console.log(`   ${key}: ${Math.min(...values)} - ${Math.max(...values)}`);
      }
    });

    // Environmental factors
    console.log('\n🌍 ENVIRONMENTAL FACTORS:');
    const env = {
      annual_rainfall: allTowns.map(t => t.annual_rainfall).filter(v => v !== null && v !== undefined),
      sunshine_hours: allTowns.map(t => t.sunshine_hours).filter(v => v !== null && v !== undefined),
      humidity_average: allTowns.map(t => t.humidity_average).filter(v => v !== null && v !== undefined),
      air_quality_index: allTowns.map(t => t.air_quality_index).filter(v => v !== null && v !== undefined),
      natural_disaster_risk_score: allTowns.map(t => t.natural_disaster_risk_score).filter(v => v !== null && v !== undefined)
    };

    Object.entries(env).forEach(([key, values]) => {
      if (values.length > 0) {
        const unit = key.includes('rainfall') ? 'mm' : 
                     key.includes('sunshine') ? 'hours' : 
                     key.includes('humidity') ? '%' : '';
        console.log(`   ${key}: ${Math.min(...values)}${unit} - ${Math.max(...values)}${unit}`);
      }
    });

    // Facility counts
    console.log('\n🏥 FACILITY COUNTS:');
    const facilities = {
      hospital_count: allTowns.map(t => t.hospital_count).filter(v => v !== null && v !== undefined),
      golf_courses_count: allTowns.map(t => t.golf_courses_count).filter(v => v !== null && v !== undefined),
      tennis_courts_count: allTowns.map(t => t.tennis_courts_count).filter(v => v !== null && v !== undefined),
      marinas_count: allTowns.map(t => t.marinas_count).filter(v => v !== null && v !== undefined),
      international_schools_count: allTowns.map(t => t.international_schools_count).filter(v => v !== null && v !== undefined),
      coworking_spaces_count: allTowns.map(t => t.coworking_spaces_count).filter(v => v !== null && v !== undefined),
      veterinary_clinics_count: allTowns.map(t => t.veterinary_clinics_count).filter(v => v !== null && v !== undefined)
    };

    Object.entries(facilities).forEach(([key, values]) => {
      if (values.length > 0) {
        console.log(`   ${key}: ${Math.min(...values)} - ${Math.max(...values)}`);
      }
    });

    // Get safety and crime categorical values
    console.log('\n🛡️ SAFETY & CRIME CATEGORICAL VALUES:');
    const crimeRates = [...new Set(allTowns.map(t => t.crime_rate).filter(v => v))].sort();
    const naturalRisks = [...new Set(allTowns.map(t => t.natural_disaster_risk).filter(v => v))].sort();
    
    console.log('   Crime Rate Values:');
    crimeRates.forEach((rate, index) => {
      console.log(`     ${index + 1}. "${rate}"`);
    });
    
    console.log('   Natural Disaster Risk Values:');
    naturalRisks.forEach((risk, index) => {
      console.log(`     ${index + 1}. "${risk}"`);
    });

    // Get vegetation types
    console.log('\n🌿 VEGETATION TYPES (from vegetation_type_actual):');
    const allVegetation = new Set();
    allTowns.forEach(town => {
      if (town.vegetation_type_actual && Array.isArray(town.vegetation_type_actual)) {
        town.vegetation_type_actual.forEach(veg => allVegetation.add(veg));
      } else if (typeof town.vegetation_type_actual === 'string') {
        allVegetation.add(town.vegetation_type_actual);
      }
    });
    
    [...allVegetation].sort().forEach((veg, index) => {
      console.log(`   ${index + 1}. "${veg}"`);
    });

    console.log('\n✅ Detailed ranges analysis completed!');

  } catch (error) {
    console.error('❌ Error during detailed analysis:', error);
  }
}

// Run the analysis
getDetailedRanges().catch(console.error);