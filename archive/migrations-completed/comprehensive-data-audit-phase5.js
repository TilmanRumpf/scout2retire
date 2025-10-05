import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 5: INFRASTRUCTURE/TRANSPORT DATA
 *
 * Checking 15 infrastructure/transport columns across 341 towns:
 * - internet_speed, public_transport_quality, nearest_airport, airport_distance, walkability
 * - has_uber, has_public_transit, requires_car, train_station, international_flights_direct
 * - local_mobility_options, regional_connectivity, international_access
 * - travel_connectivity_rating, distance_to_urban_center
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase5Audit() {
  console.log('🔍 PHASE 5: INFRASTRUCTURE/TRANSPORT DATA AUDIT\n');
  console.log('Checking 15 infrastructure/transport columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      internet_speed, public_transport_quality, nearest_airport, airport_distance, walkability,
      has_uber, has_public_transit, requires_car, train_station, international_flights_direct,
      local_mobility_options, regional_connectivity, international_access,
      travel_connectivity_rating, distance_to_urban_center
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Internet speed validation
  console.log('CHECK 1: Internet speed validation...');
  towns.forEach(town => {
    if (town.internet_speed !== null) {
      if (town.internet_speed < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'internet_speed',
          issue: 'Negative internet speed',
          severity: 'HIGH',
          current_value: town.internet_speed
        });
      }
      if (town.internet_speed > 10000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'internet_speed',
          issue: 'Unusually high internet speed (>10Gbps) - verify accuracy',
          severity: 'MEDIUM',
          current_value: town.internet_speed
        });
      }
      if (town.internet_speed < 1) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'internet_speed',
          issue: 'Very slow internet speed (<1 Mbps) - verify for remote locations',
          severity: 'MEDIUM',
          current_value: town.internet_speed
        });
      }
    }
  });

  const internetIssues = issues.high.filter(i => i.field === 'internet_speed').length +
                         issues.medium.filter(i => i.field === 'internet_speed').length;
  console.log(`   Found ${internetIssues} internet speed issues\n`);

  // Check 2: Public transport quality validation
  console.log('CHECK 2: Public transport quality validation...');
  towns.forEach(town => {
    if (town.public_transport_quality !== null) {
      if (town.public_transport_quality < 0 || town.public_transport_quality > 10) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'public_transport_quality',
          issue: 'Public transport quality outside valid range (0-10)',
          severity: 'HIGH',
          current_value: town.public_transport_quality
        });
      }
    }
  });

  const transitQualityIssues = issues.high.filter(i => i.field === 'public_transport_quality').length;
  console.log(`   Found ${transitQualityIssues} public transport quality issues\n`);

  // Check 3: Airport distance validation
  console.log('CHECK 3: Airport distance validation...');
  towns.forEach(town => {
    if (town.airport_distance !== null) {
      const distanceStr = String(town.airport_distance).replace(/[^0-9.]/g, '');
      const distanceNum = parseFloat(distanceStr);

      if (isNaN(distanceNum)) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'airport_distance',
          issue: 'Invalid airport distance format',
          severity: 'MEDIUM',
          current_value: town.airport_distance
        });
      } else {
        if (distanceNum < 0) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'airport_distance',
            issue: 'Negative airport distance',
            severity: 'HIGH',
            current_value: town.airport_distance
          });
        }
        if (distanceNum > 1000) {
          issues.medium.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: 'airport_distance',
            issue: 'Very distant airport (>1,000km) - verify for remote locations',
            severity: 'MEDIUM',
            current_value: town.airport_distance
          });
        }
      }
    }
  });

  const airportDistanceIssues = issues.high.filter(i => i.field === 'airport_distance').length +
                                issues.medium.filter(i => i.field === 'airport_distance').length;
  console.log(`   Found ${airportDistanceIssues} airport distance issues\n`);

  // Check 4: Walkability score validation
  console.log('CHECK 4: Walkability score validation...');
  towns.forEach(town => {
    if (town.walkability !== null) {
      if (town.walkability < 0 || town.walkability > 10) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'walkability',
          issue: 'Walkability score outside valid range (0-10)',
          severity: 'HIGH',
          current_value: town.walkability
        });
      }
    }
  });

  const walkabilityIssues = issues.high.filter(i => i.field === 'walkability').length;
  console.log(`   Found ${walkabilityIssues} walkability issues\n`);

  // Check 5: Distance to urban center validation
  console.log('CHECK 5: Distance to urban center validation...');
  towns.forEach(town => {
    if (town.distance_to_urban_center !== null) {
      if (town.distance_to_urban_center < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'distance_to_urban_center',
          issue: 'Negative distance to urban center',
          severity: 'HIGH',
          current_value: town.distance_to_urban_center
        });
      }
      if (town.distance_to_urban_center > 500) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'distance_to_urban_center',
          issue: 'Very distant from urban center (>500km) - verify for remote locations',
          severity: 'LOW',
          current_value: town.distance_to_urban_center
        });
      }
    }
  });

  const urbanCenterIssues = issues.high.filter(i => i.field === 'distance_to_urban_center').length +
                            issues.low.filter(i => i.field === 'distance_to_urban_center').length;
  console.log(`   Found ${urbanCenterIssues} distance to urban center issues\n`);

  // Check 6: Travel connectivity rating validation
  console.log('CHECK 6: Travel connectivity rating validation...');
  towns.forEach(town => {
    if (town.travel_connectivity_rating !== null) {
      if (town.travel_connectivity_rating < 0 || town.travel_connectivity_rating > 10) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'travel_connectivity_rating',
          issue: 'Travel connectivity rating outside valid range (0-10)',
          severity: 'HIGH',
          current_value: town.travel_connectivity_rating
        });
      }
    }
  });

  const connectivityIssues = issues.high.filter(i => i.field === 'travel_connectivity_rating').length;
  console.log(`   Found ${connectivityIssues} travel connectivity issues\n`);

  // Check 7: Boolean fields validation
  console.log('CHECK 7: Boolean fields validation...');
  const booleanFields = ['has_uber', 'has_public_transit', 'requires_car', 'train_station', 'international_flights_direct'];

  towns.forEach(town => {
    booleanFields.forEach(field => {
      const value = town[field];
      if (value !== null && typeof value !== 'boolean') {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: field,
          issue: `${field} should be boolean (true/false)`,
          severity: 'MEDIUM',
          current_value: value
        });
      }
    });
  });

  const booleanIssues = issues.medium.filter(i => booleanFields.includes(i.field)).length;
  console.log(`   Found ${booleanIssues} boolean field type issues\n`);

  // Check 8: Consistency checks
  console.log('CHECK 8: Consistency checks...');
  towns.forEach(town => {
    // If distance_to_urban_center is 0, it should be urban itself
    if (town.distance_to_urban_center === 0) {
      // This is expected for major cities - not an issue
    }

    // If has_public_transit is true, public_transport_quality should have a value
    if (town.has_public_transit === true && town.public_transport_quality === null) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'public_transport_quality',
        issue: 'Has public transit but missing quality rating',
        severity: 'LOW',
        current_value: { has_transit: true, quality: null }
      });
    }

    // If requires_car is false, should have decent walkability or transit
    if (town.requires_car === false &&
        town.walkability !== null && town.walkability < 5 &&
        town.has_public_transit === false) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'requires_car',
        issue: 'Marked as not requiring car but has low walkability and no public transit',
        severity: 'LOW',
        current_value: {
          requires_car: false,
          walkability: town.walkability,
          has_transit: town.has_public_transit
        }
      });
    }
  });

  const consistencyIssues = issues.low.filter(i =>
    i.issue.includes('consistency') ||
    i.issue.includes('Has public transit') ||
    i.issue.includes('requiring car')
  ).length;
  console.log(`   Found ${consistencyIssues} consistency issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 5 SUMMARY:\n');
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
    phase: 5,
    phase_name: 'Infrastructure/Transport Data',
    columns_checked: [
      'internet_speed', 'public_transport_quality', 'nearest_airport', 'airport_distance', 'walkability',
      'has_uber', 'has_public_transit', 'requires_car', 'train_station', 'international_flights_direct',
      'local_mobility_options', 'regional_connectivity', 'international_access',
      'travel_connectivity_rating', 'distance_to_urban_center'
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
    'database-utilities/audit-phase5-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 5 report saved to: database-utilities/audit-phase5-report.json\n');

  return report;
}

phase5Audit().catch(console.error);