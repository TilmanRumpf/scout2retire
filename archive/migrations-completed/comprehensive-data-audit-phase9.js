import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 9: CROSS-VALIDATION
 *
 * Cross-field consistency checks across all data:
 * - Climate vs location consistency
 * - Cost vs country consistency
 * - Population vs amenities consistency
 * - Geographic features vs location
 * - And more comprehensive relationship checks
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase9Audit() {
  console.log('🔍 PHASE 9: CROSS-VALIDATION CHECKS\n');
  console.log('Running comprehensive cross-field consistency checks...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns for cross-field consistency...\n`);

  // Check 1: Beach proximity vs distance to ocean
  console.log('CHECK 1: Beach proximity vs distance to ocean...');
  towns.forEach(town => {
    if (town.beaches_nearby === true && town.distance_to_ocean_km) {
      const oceanDist = parseFloat(String(town.distance_to_ocean_km).replace(/[^0-9.]/g, ''));
      if (!isNaN(oceanDist) && oceanDist > 100) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'beaches_vs_ocean_distance',
          issue: 'Marked as having beaches but >100km from ocean',
          severity: 'MEDIUM',
          current_value: { beaches_nearby: true, ocean_distance_km: oceanDist }
        });
      }
    }

    if (town.beaches_nearby === false && town.distance_to_ocean_km) {
      const oceanDist = parseFloat(String(town.distance_to_ocean_km).replace(/[^0-9.]/g, ''));
      if (!isNaN(oceanDist) && oceanDist < 5) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'beaches_vs_ocean_distance',
          issue: 'Marked as no beaches but <5km from ocean',
          severity: 'LOW',
          current_value: { beaches_nearby: false, ocean_distance_km: oceanDist }
        });
      }
    }
  });

  const beachIssues = issues.medium.filter(i => i.check === 'beaches_vs_ocean_distance').length +
                      issues.low.filter(i => i.check === 'beaches_vs_ocean_distance').length;
  console.log(`   Found ${beachIssues} beach/ocean consistency issues\n`);

  // Check 2: Ski resorts vs climate/latitude
  console.log('CHECK 2: Ski resorts vs climate/latitude...');
  towns.forEach(town => {
    if (town.ski_resorts_within_100km > 0) {
      // Ski resorts typically require cold winters or high elevation
      if (town.avg_temp_winter !== null && town.avg_temp_winter > 15) {
        // Warm winters - check elevation
        const elevation = town.elevation_meters ? parseFloat(String(town.elevation_meters).replace(/[^0-9.-]/g, '')) : 0;
        if (elevation < 1000) {
          issues.low.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            check: 'ski_resorts_vs_climate',
            issue: 'Has ski resorts but warm winters and low elevation',
            severity: 'LOW',
            current_value: {
              ski_resorts: town.ski_resorts_within_100km,
              winter_temp: town.avg_temp_winter,
              elevation_m: elevation
            }
          });
        }
      }

      // Tropical latitudes with ski resorts are unusual
      if (town.latitude !== null && Math.abs(town.latitude) < 20) {
        const elevation = town.elevation_meters ? parseFloat(String(town.elevation_meters).replace(/[^0-9.-]/g, '')) : 0;
        if (elevation < 2000) {
          issues.low.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            check: 'ski_resorts_vs_location',
            issue: 'Has ski resorts but in tropical latitude with low elevation',
            severity: 'LOW',
            current_value: {
              ski_resorts: town.ski_resorts_within_100km,
              latitude: town.latitude,
              elevation_m: elevation
            }
          });
        }
      }
    }
  });

  const skiIssues = issues.low.filter(i => i.check.includes('ski_resorts')).length;
  console.log(`   Found ${skiIssues} ski resort consistency issues\n`);

  // Check 3: Cost of living vs rent consistency
  console.log('CHECK 3: Cost of living vs rent consistency...');
  towns.forEach(town => {
    if (town.cost_of_living_usd && town.rent_1bed) {
      // Rent typically 30-50% of cost of living
      const rentPercentage = (town.rent_1bed / town.cost_of_living_usd) * 100;

      if (rentPercentage > 80) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'cost_vs_rent',
          issue: 'Rent is >80% of total cost of living (unusual)',
          severity: 'MEDIUM',
          current_value: {
            cost_of_living: town.cost_of_living_usd,
            rent_1bed: town.rent_1bed,
            rent_percentage: rentPercentage.toFixed(1)
          }
        });
      }

      if (rentPercentage < 10 && town.rent_1bed > 0) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'cost_vs_rent',
          issue: 'Rent is <10% of total cost of living (unusual)',
          severity: 'MEDIUM',
          current_value: {
            cost_of_living: town.cost_of_living_usd,
            rent_1bed: town.rent_1bed,
            rent_percentage: rentPercentage.toFixed(1)
          }
        });
      }
    }
  });

  const costRentIssues = issues.medium.filter(i => i.check === 'cost_vs_rent').length;
  console.log(`   Found ${costRentIssues} cost/rent consistency issues\n`);

  // Check 4: Population vs amenities consistency
  console.log('CHECK 4: Population vs amenities consistency...');
  towns.forEach(town => {
    if (town.population > 1000000) {
      // Large city - should have good public transport
      if (town.public_transport_quality !== null && town.public_transport_quality < 5) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'population_vs_transit',
          issue: 'Large city (>1M) but low public transport quality (<5)',
          severity: 'LOW',
          current_value: {
            population: town.population,
            transit_quality: town.public_transport_quality
          }
        });
      }

      // Should have hospitals
      if (town.hospital_count !== null && town.hospital_count === 0) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          check: 'population_vs_hospitals',
          issue: 'Large city (>1M) but no hospitals listed',
          severity: 'MEDIUM',
          current_value: {
            population: town.population,
            hospitals: town.hospital_count
          }
        });
      }

      // Should have international airport nearby
      if (town.airport_distance) {
        const airportDist = parseFloat(String(town.airport_distance).replace(/[^0-9.]/g, ''));
        if (!isNaN(airportDist) && airportDist > 200) {
          issues.low.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            check: 'population_vs_airport',
            issue: 'Large city (>1M) but airport >200km away',
            severity: 'LOW',
            current_value: {
              population: town.population,
              airport_distance_km: airportDist
            }
          });
        }
      }
    }

    // Small town with many international schools is unusual
    if (town.population < 20000 && town.international_schools_count > 3) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'population_vs_schools',
        issue: 'Small town (<20K) but >3 international schools',
        severity: 'LOW',
        current_value: {
          population: town.population,
          international_schools: town.international_schools_count
        }
      });
    }
  });

  const populationAmenitiesIssues = issues.medium.filter(i => i.check.includes('population')).length +
                                     issues.low.filter(i => i.check.includes('population')).length;
  console.log(`   Found ${populationAmenitiesIssues} population/amenities consistency issues\n`);

  // Check 5: Climate vs geography consistency
  console.log('CHECK 5: Climate vs geography consistency...');
  towns.forEach(town => {
    // Desert climate but high rainfall
    if (town.climate && town.climate.toLowerCase().includes('desert') && town.annual_rainfall > 500) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'climate_vs_rainfall',
        issue: 'Desert climate but high rainfall (>500mm)',
        severity: 'MEDIUM',
        current_value: {
          climate: town.climate,
          rainfall_mm: town.annual_rainfall
        }
      });
    }

    // Tropical climate but cold winter
    if (town.climate && town.climate.toLowerCase().includes('tropical') && town.avg_temp_winter !== null && town.avg_temp_winter < 10) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'climate_vs_temperature',
        issue: 'Tropical climate but cold winter (<10°C)',
        severity: 'MEDIUM',
        current_value: {
          climate: town.climate,
          winter_temp: town.avg_temp_winter
        }
      });
    }

    // High latitude but hot summer
    if (town.latitude !== null && Math.abs(town.latitude) > 60 && town.avg_temp_summer > 30) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'latitude_vs_temperature',
        issue: 'High latitude (>60°) but very hot summer (>30°C)',
        severity: 'LOW',
        current_value: {
          latitude: town.latitude,
          summer_temp: town.avg_temp_summer
        }
      });
    }
  });

  const climateGeoIssues = issues.medium.filter(i => i.check.includes('climate') || i.check.includes('latitude')).length +
                           issues.low.filter(i => i.check.includes('climate') || i.check.includes('latitude')).length;
  console.log(`   Found ${climateGeoIssues} climate/geography consistency issues\n`);

  // Check 6: Healthcare score vs facilities
  console.log('CHECK 6: Healthcare score vs facilities consistency...');
  towns.forEach(town => {
    // High healthcare score but no hospitals
    if (town.healthcare_score >= 8 && town.hospital_count === 0) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'healthcare_score_vs_facilities',
        issue: 'High healthcare score (≥8) but no hospitals listed',
        severity: 'MEDIUM',
        current_value: {
          healthcare_score: town.healthcare_score,
          hospitals: town.hospital_count
        }
      });
    }

    // Low healthcare score but many hospitals
    if (town.healthcare_score <= 3 && town.hospital_count > 5) {
      issues.low.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        check: 'healthcare_score_vs_facilities',
        issue: 'Low healthcare score (≤3) but >5 hospitals listed',
        severity: 'LOW',
        current_value: {
          healthcare_score: town.healthcare_score,
          hospitals: town.hospital_count
        }
      });
    }
  });

  const healthcareIssues = issues.medium.filter(i => i.check === 'healthcare_score_vs_facilities').length +
                           issues.low.filter(i => i.check === 'healthcare_score_vs_facilities').length;
  console.log(`   Found ${healthcareIssues} healthcare consistency issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 9 SUMMARY:\n');
  console.log(`🔴 CRITICAL issues: ${issues.critical.length}`);
  console.log(`🟠 HIGH issues: ${issues.high.length}`);
  console.log(`🟡 MEDIUM issues: ${issues.medium.length}`);
  console.log(`🟢 LOW issues: ${issues.low.length}`);
  console.log(`\n📊 Total issues found: ${issues.critical.length + issues.high.length + issues.medium.length + issues.low.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sample some MEDIUM severity issues
  if (issues.medium.length > 0) {
    console.log('🟡 Sample MEDIUM severity cross-validation issues:');
    issues.medium.slice(0, 10).forEach(issue => {
      console.log(`   - ${issue.town_name}, ${issue.country}: ${issue.issue}`);
      console.log(`     Values: ${JSON.stringify(issue.current_value)}`);
    });
    if (issues.medium.length > 10) {
      console.log(`   ... and ${issues.medium.length - 10} more MEDIUM issues\n`);
    }
  }

  // Save detailed report
  const report = {
    phase: 9,
    phase_name: 'Cross-Validation Checks',
    checks_performed: [
      'Beach proximity vs distance to ocean',
      'Ski resorts vs climate/latitude',
      'Cost of living vs rent consistency',
      'Population vs amenities consistency',
      'Climate vs geography consistency',
      'Healthcare score vs facilities consistency'
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
    'database-utilities/audit-phase9-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 9 report saved to: database-utilities/audit-phase9-report.json\n');

  return report;
}

phase9Audit().catch(console.error);