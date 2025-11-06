#!/usr/bin/env node

/**
 * DATA NORMALIZATION SCRIPT - FIX DROPDOWN FIELDS
 *
 * Problem: Database is storing field names instead of actual values
 * Solution: Map all incorrect field-name values to proper normalized values
 *
 * Affected fields:
 * - InfrastructurePanel: internet_reliability, mobile_coverage, public_transport_quality,
 *   bike_infrastructure, road_quality, traffic_congestion, parking_availability,
 *   government_efficiency_rating, banking_infrastructure, digital_services_availability
 * - ActivitiesPanel: sports_facilities, mountain_activities, beaches_nearby,
 *   water_sports_available, cultural_activities
 * - SafetyPanel: crime_rate, natural_disaster_risk
 * - CulturePanel: english_proficiency_level, pace_of_life_actual, social_atmosphere,
 *   traditional_progressive_lean, expat_community_size, retirement_community_presence,
 *   cultural_events_frequency
 * - ClimatePanel: sunshine_level_actual, precipitation_level_actual,
 *   seasonal_variation_actual, humidity_level_actual, climate_type, natural_disaster_risk
 * - RegionPanel: vegetation_type_actual, urban_rural_character
 *
 * Created: 2025-10-18
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// NORMALIZATION MAPPINGS - Map incorrect values to correct values

// Infrastructure Panel
const INFRASTRUCTURE_MAPPINGS = {
  internet_reliability: {
    'internet_reliability': 'fair',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'very_good': 'very_good',
    'excellent': 'excellent'
  },
  mobile_coverage: {
    'mobile_coverage': 'fair',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  public_transport_quality: {
    'public_transport_quality': 'fair',
    'very_poor': 'very_poor',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  bike_infrastructure: {
    'bike_infrastructure': 'fair',
    'very_poor': 'very_poor',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  road_quality: {
    'road_quality': 'fair',
    'very_poor': 'very_poor',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  traffic_congestion: {
    'traffic_congestion': 'moderate',
    'minimal': 'minimal',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'severe': 'severe'
  },
  parking_availability: {
    'parking_availability': 'fair',
    'very_poor': 'very_poor',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  banking_infrastructure: {
    'banking_infrastructure': 'fair',
    'very_poor': 'very_poor',
    'poor': 'poor',
    'fair': 'fair',
    'good': 'good',
    'excellent': 'excellent'
  },
  digital_services_availability: {
    'digital_services_availability': 'moderate',
    'very_low': 'very_low',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'very_high': 'very_high'
  }
};

// Activities Panel
const ACTIVITIES_MAPPINGS = {
  sports_facilities: {
    'sports_facilities': 'moderate',
    'very_limited': 'very_limited',
    'limited': 'limited',
    'moderate': 'moderate',
    'good': 'good',
    'excellent': 'excellent'
  },
  mountain_activities: {
    'mountain_activities': 'moderate',
    'none': 'none',
    'limited': 'limited',
    'moderate': 'moderate',
    'good': 'good',
    'excellent': 'excellent'
  },
  beaches_nearby: {
    'beaches_nearby': 'several',
    'none': 'none',
    'limited': 'limited',
    'several': 'several',
    'many': 'many',
    'abundant': 'abundant'
  },
  water_sports_available: {
    'water_sports_available': 'moderate',
    'none': 'none',
    'limited': 'limited',
    'moderate': 'moderate',
    'good': 'good',
    'excellent': 'excellent'
  },
  cultural_activities: {
    'cultural_activities': 'moderate',
    'very_limited': 'very_limited',
    'limited': 'limited',
    'moderate': 'moderate',
    'good': 'good',
    'excellent': 'excellent'
  }
};

// Safety Panel
const SAFETY_MAPPINGS = {
  crime_rate: {
    'crime_rate': 'moderate',
    'very_low': 'very_low',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'very_high': 'very_high'
  },
  natural_disaster_risk: {
    'natural_disaster_risk': 'moderate',
    'Natural Disaster Risk': 'moderate',
    'minimal': 'minimal',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'very_high': 'very_high',
    'Very Low': 'minimal',
    'Low': 'low',
    'Moderate': 'moderate',
    'High': 'high',
    'Very High': 'very_high'
  }
};

// Culture Panel
const CULTURE_MAPPINGS = {
  english_proficiency_level: {
    'english_proficiency_level': 'moderate',
    'minimal': 'minimal',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high',
    'widespread': 'widespread'
  },
  pace_of_life_actual: {
    'pace_of_life_actual': 'relaxed',
    'slow': 'slow',
    'relaxed': 'relaxed',
    'moderate': 'moderate',
    'fast': 'fast'
  },
  social_atmosphere: {
    'social_atmosphere': 'moderate',
    'reserved': 'reserved',
    'quiet': 'quiet',
    'moderate': 'moderate',
    'friendly': 'friendly',
    'vibrant': 'vibrant',
    'very friendly': 'very friendly'
  },
  traditional_progressive_lean: {
    'traditional_progressive_lean': 'balanced',
    'traditional': 'traditional',
    'moderate': 'moderate',
    'balanced': 'balanced',
    'progressive': 'progressive'
  },
  expat_community_size: {
    'expat_community_size': 'moderate',
    'small': 'small',
    'moderate': 'moderate',
    'large': 'large'
  },
  retirement_community_presence: {
    'retirement_community_presence': 'moderate',
    'none': 'none',
    'minimal': 'minimal',
    'limited': 'limited',
    'moderate': 'moderate',
    'strong': 'strong',
    'extensive': 'extensive',
    'very_strong': 'very_strong'
  },
  cultural_events_frequency: {
    'cultural_events_frequency': 'occasional',
    'rare': 'rare',
    'occasional': 'occasional',
    'monthly': 'monthly',
    'frequent': 'frequent',
    'weekly': 'weekly'
  }
};

// Climate Panel
const CLIMATE_MAPPINGS = {
  sunshine_level_actual: {
    'sunshine_level_actual': 'balanced',
    'low': 'low',
    'less_sunny': 'less_sunny',
    'balanced': 'balanced',
    'high': 'high',
    'often_sunny': 'often_sunny'
  },
  precipitation_level_actual: {
    'precipitation_level_actual': 'balanced',
    'low': 'low',
    'mostly_dry': 'mostly_dry',
    'balanced': 'balanced',
    'high': 'high',
    'less_dry': 'less_dry'
  },
  seasonal_variation_actual: {
    'seasonal_variation_actual': 'moderate',
    'low': 'low',
    'minimal': 'minimal',
    'moderate': 'moderate',
    'distinct_seasons': 'distinct_seasons',
    'high': 'high',
    'extreme': 'extreme'
  },
  humidity_level_actual: {
    'humidity_level_actual': 'moderate',
    'low': 'low',
    'moderate': 'moderate',
    'high': 'high'
  },
  climate_type: {
    'climate_type': 'Temperate',
    'Alpine': 'Alpine',
    'Arctic': 'Arctic',
    'Atlantic Maritime': 'Atlantic Maritime',
    'Continental': 'Continental',
    'Desert': 'Desert',
    'Highland': 'Highland',
    'Highland Tropical': 'Highland Tropical',
    'Humid Subtropical': 'Humid Subtropical',
    'Maritime': 'Maritime',
    'Mediterranean': 'Mediterranean',
    'Monsoon': 'Monsoon',
    'Oceanic': 'Oceanic',
    'Savanna': 'Savanna',
    'Semi-arid': 'Semi-arid',
    'Subtropical': 'Subtropical',
    'Temperate': 'Temperate',
    'Tropical': 'Tropical'
  }
};

// Region Panel
const REGION_MAPPINGS = {
  vegetation_type_actual: {
    'vegetation_type_actual': 'mixed',
    'tropical': 'tropical',
    'temperate': 'temperate',
    'arid': 'arid',
    'mixed': 'mixed',
    'alpine': 'alpine'
  },
  urban_rural_character: {
    'urban_rural_character': 'suburban',
    'rural': 'rural',
    'suburban': 'suburban',
    'urban': 'urban'
  }
};

// Combine all mappings
const ALL_MAPPINGS = {
  ...INFRASTRUCTURE_MAPPINGS,
  ...ACTIVITIES_MAPPINGS,
  ...SAFETY_MAPPINGS,
  ...CULTURE_MAPPINGS,
  ...CLIMATE_MAPPINGS,
  ...REGION_MAPPINGS
};

async function analyzeNormalizationIssues() {
  console.log('🔍 ANALYZING DATA NORMALIZATION ISSUES');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Get all towns
    const { data: towns, error } = await supabase
      .from('towns')
      .select('id, name, country, ' + Object.keys(ALL_MAPPINGS).join(', '));

    if (error) {
      console.error('❌ Error querying towns:', error.message);
      return null;
    }

    console.log(`✅ Loaded ${towns.length} towns`);
    console.log('');

    // Analyze each field
    const issuesByField = {};
    const townIssues = {};

    Object.keys(ALL_MAPPINGS).forEach(field => {
      const values = {};
      towns.forEach(town => {
        const value = town[field];
        if (value !== null && value !== undefined && value !== '') {
          if (!values[value]) {
            values[value] = [];
          }
          values[value].push(town.id);
        }
      });

      // Check for incorrect values (field name as value)
      const incorrectValues = Object.keys(values).filter(v =>
        v === field || !ALL_MAPPINGS[field][v]
      );

      if (incorrectValues.length > 0) {
        issuesByField[field] = {
          incorrectValues: incorrectValues.map(v => ({
            value: v,
            count: values[v].length,
            townIds: values[v]
          })),
          totalAffected: incorrectValues.reduce((sum, v) => sum + values[v].length, 0)
        };

        // Track which towns have issues
        incorrectValues.forEach(v => {
          values[v].forEach(townId => {
            if (!townIssues[townId]) {
              townIssues[townId] = [];
            }
            townIssues[townId].push({ field, incorrectValue: v });
          });
        });
      }
    });

    // Report findings
    console.log('📊 NORMALIZATION ISSUES FOUND:');
    console.log('-'.repeat(80));
    console.log('');

    if (Object.keys(issuesByField).length === 0) {
      console.log('✅ NO ISSUES FOUND - All fields are properly normalized!');
      return { towns, issuesByField: {}, townIssues: {} };
    }

    Object.entries(issuesByField).forEach(([field, data]) => {
      console.log(`\n${field}:`);
      console.log(`   Total affected: ${data.totalAffected} towns`);
      data.incorrectValues.forEach(({ value, count }) => {
        const correctValue = ALL_MAPPINGS[field][value] || 'UNMAPPED';
        console.log(`   - "${value}" (${count} towns) → should be "${correctValue}"`);
      });
    });

    console.log('');
    console.log('='.repeat(80));
    console.log(`\n📍 SUMMARY:`);
    console.log(`   Fields with issues: ${Object.keys(issuesByField).length}`);
    console.log(`   Towns affected: ${Object.keys(townIssues).length}`);
    console.log(`   Total issues: ${Object.values(issuesByField).reduce((sum, d) => sum + d.totalAffected, 0)}`);
    console.log('');

    return { towns, issuesByField, townIssues };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return null;
  }
}

async function fixNormalizationIssues(analysisResults) {
  if (!analysisResults || Object.keys(analysisResults.issuesByField).length === 0) {
    console.log('✅ No issues to fix!');
    return;
  }

  console.log('🔧 FIXING NORMALIZATION ISSUES');
  console.log('='.repeat(80));
  console.log('');

  const { towns, issuesByField, townIssues } = analysisResults;

  let fixedCount = 0;
  let errorCount = 0;

  for (const [townId, issues] of Object.entries(townIssues)) {
    const town = towns.find(t => t.id === townId);
    if (!town) continue;

    // Build update object
    const updates = {};
    issues.forEach(({ field, incorrectValue }) => {
      const correctValue = ALL_MAPPINGS[field][incorrectValue];
      if (correctValue) {
        updates[field] = correctValue;
      }
    });

    if (Object.keys(updates).length === 0) continue;

    // Update town
    try {
      const { error } = await supabase
        .from('towns')
        .update(updates)
        .eq('id', townId);

      if (error) {
        console.error(`❌ Error updating ${town.town_name} (${townId}):`, error.message);
        errorCount++;
      } else {
        fixedCount++;
        console.log(`✅ Fixed ${town.town_name}, ${town.country} (${Object.keys(updates).length} fields)`);
      }
    } catch (error) {
      console.error(`❌ Exception updating ${town.town_name} (${townId}):`, error);
      errorCount++;
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log(`\n📊 FIX SUMMARY:`);
  console.log(`   Towns fixed: ${fixedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('');
}

async function verifyFixes() {
  console.log('🔍 VERIFYING FIXES');
  console.log('='.repeat(80));
  console.log('');

  const results = await analyzeNormalizationIssues();

  if (!results) {
    console.log('❌ Could not verify fixes');
    return;
  }

  if (Object.keys(results.issuesByField).length === 0) {
    console.log('✅ VERIFICATION PASSED - All fields are properly normalized!');
  } else {
    console.log('⚠️ VERIFICATION FAILED - Issues still remain');
  }
}

async function main() {
  console.log('\n🚀 DATA NORMALIZATION SCRIPT - STARTING\n');

  // Step 1: Analyze
  const analysisResults = await analyzeNormalizationIssues();

  if (!analysisResults) {
    console.log('❌ Analysis failed, aborting');
    return;
  }

  if (Object.keys(analysisResults.issuesByField).length === 0) {
    console.log('✅ All data is already normalized!');
    return;
  }

  // Step 2: Confirm
  console.log('⚠️  This will update the database. Continue? (Ctrl+C to abort)');
  console.log('');

  // Wait 3 seconds for user to abort
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Fix
  await fixNormalizationIssues(analysisResults);

  // Step 4: Verify
  console.log('');
  await verifyFixes();

  console.log('\n✅ DATA NORMALIZATION COMPLETE\n');
}

main().catch(console.error);
