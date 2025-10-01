import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 6: GEOGRAPHY/ENVIRONMENT DATA
 *
 * Checking 14 geography/environment columns across 341 towns:
 * - region, regions, water_bodies, geographic_features_actual, vegetation_type_actual
 * - air_quality_index, geographic_features, elevation_meters, distance_to_ocean_km
 * - humidity_average, natural_disaster_risk, natural_disaster_risk_score
 * - environmental_factors, geo_region
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase6Audit() {
  console.log('🔍 PHASE 6: GEOGRAPHY/ENVIRONMENT DATA AUDIT\n');
  console.log('Checking 14 geography/environment columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      region, regions, water_bodies, geographic_features_actual, vegetation_type_actual,
      air_quality_index, geographic_features, elevation_meters, distance_to_ocean_km,
      humidity_average, natural_disaster_risk, natural_disaster_risk_score,
      environmental_factors, geo_region
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Elevation validation
  console.log('CHECK 1: Elevation validation...');
  towns.forEach(town => {
    if (town.elevation_meters !== null) {
      const elevationStr = String(town.elevation_meters).replace(/[^0-9.-]/g, '');
      const elevationNum = parseFloat(elevationStr);

      if (isNaN(elevationNum)) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'elevation_meters',
          issue: 'Invalid elevation format',
          severity: 'MEDIUM',
          current_value: town.elevation_meters
        });
      } else {
        // Dead Sea is -430m, Everest Base Camp is 5,364m
        if (elevationNum < -500 || elevationNum > 6000) {
          issues.medium.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'elevation_meters',
            issue: 'Elevation outside typical range (-500m to 6,000m)',
            severity: 'MEDIUM',
            current_value: elevationNum
          });
        }
      }
    }
  });

  const elevationIssues = issues.medium.filter(i => i.field === 'elevation_meters').length;
  console.log(`   Found ${elevationIssues} elevation issues\n`);

  // Check 2: Distance to ocean validation
  console.log('CHECK 2: Distance to ocean validation...');
  towns.forEach(town => {
    if (town.distance_to_ocean_km !== null) {
      const distanceStr = String(town.distance_to_ocean_km).replace(/[^0-9.]/g, '');
      const distanceNum = parseFloat(distanceStr);

      if (isNaN(distanceNum)) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'distance_to_ocean_km',
          issue: 'Invalid ocean distance format',
          severity: 'MEDIUM',
          current_value: town.distance_to_ocean_km
        });
      } else {
        if (distanceNum < 0) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'distance_to_ocean_km',
            issue: 'Negative ocean distance',
            severity: 'HIGH',
            current_value: distanceNum
          });
        }
        // Max distance from ocean is ~2,500km (Central Asia)
        if (distanceNum > 3000) {
          issues.medium.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'distance_to_ocean_km',
            issue: 'Unusually far from ocean (>3,000km) - verify accuracy',
            severity: 'MEDIUM',
            current_value: distanceNum
          });
        }
      }
    }
  });

  const oceanDistanceIssues = issues.high.filter(i => i.field === 'distance_to_ocean_km').length +
                              issues.medium.filter(i => i.field === 'distance_to_ocean_km').length;
  console.log(`   Found ${oceanDistanceIssues} ocean distance issues\n`);

  // Check 3: Air quality index validation
  console.log('CHECK 3: Air quality index validation...');
  towns.forEach(town => {
    if (town.air_quality_index !== null) {
      // AQI typically ranges from 0 (best) to 500 (hazardous)
      if (town.air_quality_index < 0 || town.air_quality_index > 500) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'air_quality_index',
          issue: 'Air quality index outside valid range (0-500)',
          severity: 'HIGH',
          current_value: town.air_quality_index
        });
      }
      if (town.air_quality_index > 300) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'air_quality_index',
          issue: 'Very poor air quality (>300) - hazardous level',
          severity: 'MEDIUM',
          current_value: town.air_quality_index
        });
      }
    }
  });

  const aqiIssues = issues.high.filter(i => i.field === 'air_quality_index').length +
                    issues.medium.filter(i => i.field === 'air_quality_index').length;
  console.log(`   Found ${aqiIssues} air quality issues\n`);

  // Check 4: Humidity average validation
  console.log('CHECK 4: Humidity average validation...');
  towns.forEach(town => {
    if (town.humidity_average !== null) {
      // Humidity is percentage 0-100
      if (town.humidity_average < 0 || town.humidity_average > 100) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'humidity_average',
          issue: 'Humidity outside valid range (0-100%)',
          severity: 'HIGH',
          current_value: town.humidity_average
        });
      }
    }
  });

  const humidityIssues = issues.high.filter(i => i.field === 'humidity_average').length;
  console.log(`   Found ${humidityIssues} humidity issues\n`);

  // Check 5: Natural disaster risk validation
  console.log('CHECK 5: Natural disaster risk validation...');
  towns.forEach(town => {
    // natural_disaster_risk is typically 0-10 scale
    if (town.natural_disaster_risk !== null) {
      if (town.natural_disaster_risk < 0 || town.natural_disaster_risk > 10) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'natural_disaster_risk',
          issue: 'Natural disaster risk outside typical range (0-10)',
          severity: 'HIGH',
          current_value: town.natural_disaster_risk
        });
      }
    }

    // natural_disaster_risk_score validation
    if (town.natural_disaster_risk_score !== null) {
      if (town.natural_disaster_risk_score < 0 || town.natural_disaster_risk_score > 10) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'natural_disaster_risk_score',
          issue: 'Natural disaster risk score outside typical range (0-10)',
          severity: 'HIGH',
          current_value: town.natural_disaster_risk_score
        });
      }
    }
  });

  const disasterIssues = issues.high.filter(i =>
    i.field.includes('natural_disaster')
  ).length;
  console.log(`   Found ${disasterIssues} natural disaster risk issues\n`);

  // Check 6: Array fields validation
  console.log('CHECK 6: Array fields validation...');
  const arrayFields = ['regions', 'water_bodies', 'geographic_features_actual', 'vegetation_type_actual', 'geographic_features'];

  towns.forEach(town => {
    arrayFields.forEach(field => {
      const value = town[field];
      if (value !== null && !Array.isArray(value)) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: field,
          issue: `${field} should be an array`,
          severity: 'MEDIUM',
          current_value: typeof value
        });
      }
      // Check for empty arrays
      if (Array.isArray(value) && value.length === 0) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: field,
          issue: `${field} is an empty array`,
          severity: 'LOW',
          current_value: 'empty array'
        });
      }
    });
  });

  const arrayIssues = issues.medium.filter(i => arrayFields.includes(i.field)).length;
  const emptyArrayIssues = issues.low.filter(i => i.current_value === 'empty array').length;
  console.log(`   Found ${arrayIssues} array type issues and ${emptyArrayIssues} empty arrays\n`);

  // Check 7: Region/geo_region consistency
  console.log('CHECK 7: Region/geo_region consistency...');
  towns.forEach(town => {
    // Both region and geo_region should ideally be populated
    if (town.region && !town.geo_region) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'geo_region',
        issue: 'Has region but missing geo_region',
        severity: 'LOW',
        current_value: { region: town.region, geo_region: null }
      });
    }
    if (!town.region && town.geo_region) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'region',
        issue: 'Has geo_region but missing region',
        severity: 'LOW',
        current_value: { region: null, geo_region: town.geo_region }
      });
    }
  });

  const regionConsistencyIssues = issues.low.filter(i =>
    (i.field === 'region' || i.field === 'geo_region') &&
    i.issue.includes('missing')
  ).length;
  console.log(`   Found ${regionConsistencyIssues} region consistency issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 6 SUMMARY:\n');
  console.log(`🔴 CRITICAL issues: ${issues.critical.length}`);
  console.log(`🟠 HIGH issues: ${issues.high.length}`);
  console.log(`🟡 MEDIUM issues: ${issues.medium.length}`);
  console.log(`🟢 LOW issues: ${issues.low.length}`);
  console.log(`\n📊 Total issues found: ${issues.critical.length + issues.high.length + issues.medium.length + issues.low.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sample some HIGH severity issues
  if (issues.high.length > 0) {
    console.log('🟠 Sample HIGH severity issues:');
    issues.high.slice(0, 5).forEach(issue => {
      console.log(`   - ${issue.town_name}, ${issue.country}: ${issue.issue}`);
      console.log(`     Current value: ${JSON.stringify(issue.current_value)}`);
    });
    if (issues.high.length > 5) {
      console.log(`   ... and ${issues.high.length - 5} more HIGH issues\n`);
    }
  }

  // Save detailed report
  const report = {
    phase: 6,
    phase_name: 'Geography/Environment Data',
    columns_checked: [
      'region', 'regions', 'water_bodies', 'geographic_features_actual', 'vegetation_type_actual',
      'air_quality_index', 'geographic_features', 'elevation_meters', 'distance_to_ocean_km',
      'humidity_average', 'natural_disaster_risk', 'natural_disaster_risk_score',
      'environmental_factors', 'geo_region'
    ],
    towns_analyzed: towns.length,
    timestamp: new Date().toISOString(),
    issues: issues,
    summary: {
      critical: issues.critical.length,
      high: issues.high.length,
      medium: issues.medium.length,
      low: issues.low.length,
      total: issues.critical.length + issues.high.length + issues.medium.length + issues.low.length
    }
  };

  fs.writeFileSync(
    'database-utilities/audit-phase6-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 6 report saved to: database-utilities/audit-phase6-report.json\n');

  return report;
}

phase6Audit().catch(console.error);