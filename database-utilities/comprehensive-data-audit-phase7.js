import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * COMPREHENSIVE DATA AUDIT - PHASE 7: LIFESTYLE/AMENITIES DATA
 *
 * Checking 30+ lifestyle/amenities columns across 341 towns:
 * - Ratings: outdoor_activities_rating, cultural_events_rating, shopping_rating, wellness_rating
 * - Facilities: golf_courses_count, tennis_courts_count, hiking_trails_km, ski_resorts_within_100km
 * - marinas_count, farmers_markets, veterinary_clinics_count, dog_parks_count
 * - international_schools_count, coworking_spaces_count
 * - Booleans: beaches_nearby, international_schools_available, childcare_available
 * - Arrays: activities_available, interests_supported, top_hobbies
 * - Others: expat_community_size, retirement_community_presence
 */

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

async function phase7Audit() {
  console.log('🔍 PHASE 7: LIFESTYLE/AMENITIES DATA AUDIT\n');
  console.log('Checking 30+ lifestyle/amenities columns across 341 towns...\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select(`
      id, name, country,
      outdoor_activities_rating, cultural_events_rating, shopping_rating, wellness_rating,
      golf_courses_count, tennis_courts_count, hiking_trails_km, ski_resorts_within_100km,
      marinas_count, farmers_markets, veterinary_clinics_count, dog_parks_count,
      international_schools_count, coworking_spaces_count,
      beaches_nearby, international_schools_available, childcare_available,
      activities_available, interests_supported, top_hobbies,
      expat_community_size, retirement_community_presence,
      nightlife_rating, museums_rating, cultural_rating, outdoor_rating,
      restaurants_rating, swimming_facilities, pet_friendly_rating,
      cultural_events_frequency, expat_groups
    `)
    .order('name');

  if (error) {
    console.error('❌ Error fetching towns:', error);
    return;
  }

  console.log(`📊 Analyzing ${towns.length} towns...\n`);

  // Check 1: Rating fields validation (0-10 scale)
  console.log('CHECK 1: Rating fields validation...');
  const ratingFields = [
    'outdoor_activities_rating', 'cultural_events_rating', 'shopping_rating', 'wellness_rating',
    'nightlife_rating', 'museums_rating', 'cultural_rating', 'outdoor_rating', 'restaurants_rating',
    'pet_friendly_rating'
  ];

  towns.forEach(town => {
    ratingFields.forEach(field => {
      const value = town[field];
      if (value !== null) {
        if (value < 0 || value > 10) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: field,
            issue: `${field} outside valid range (0-10)`,
            severity: 'HIGH',
            current_value: value
          });
        }
      }
    });
  });

  const ratingIssues = issues.high.filter(i => i.field.includes('_rating')).length;
  console.log(`   Found ${ratingIssues} rating issues\n`);

  // Check 2: Count fields validation (non-negative integers)
  console.log('CHECK 2: Count fields validation...');
  const countFields = [
    'golf_courses_count', 'tennis_courts_count', 'ski_resorts_within_100km',
    'marinas_count', 'veterinary_clinics_count', 'dog_parks_count',
    'international_schools_count', 'coworking_spaces_count'
  ];

  towns.forEach(town => {
    countFields.forEach(field => {
      const value = town[field];
      if (value !== null) {
        if (value < 0) {
          issues.high.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: field,
            issue: `Negative count for ${field}`,
            severity: 'HIGH',
            current_value: value
          });
        }
        if (value > 200 && !['golf_courses_count', 'tennis_courts_count'].includes(field)) {
          issues.medium.push({
            town_id: town.id,
            town_name: town.name,
            country: town.country,
            field: field,
            issue: `Very high count for ${field} (>200) - verify accuracy`,
            severity: 'MEDIUM',
            current_value: value
          });
        }
      }
    });
  });

  const countIssues = issues.high.filter(i => i.field.includes('_count')).length +
                      issues.medium.filter(i => i.field.includes('_count')).length;
  console.log(`   Found ${countIssues} count issues\n`);

  // Check 3: Distance/measurement fields
  console.log('CHECK 3: Distance/measurement fields validation...');
  towns.forEach(town => {
    // hiking_trails_km
    if (town.hiking_trails_km !== null) {
      if (town.hiking_trails_km < 0) {
        issues.high.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'hiking_trails_km',
          issue: 'Negative hiking trails distance',
          severity: 'HIGH',
          current_value: town.hiking_trails_km
        });
      }
      if (town.hiking_trails_km > 10000) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'hiking_trails_km',
          issue: 'Very extensive hiking trails (>10,000km) - verify accuracy',
          severity: 'MEDIUM',
          current_value: town.hiking_trails_km
        });
      }
    }
  });

  const distanceIssues = issues.high.filter(i => i.field === 'hiking_trails_km').length +
                         issues.medium.filter(i => i.field === 'hiking_trails_km').length;
  console.log(`   Found ${distanceIssues} distance/measurement issues\n`);

  // Check 4: Boolean fields validation
  console.log('CHECK 4: Boolean fields validation...');
  const booleanFields = ['beaches_nearby', 'international_schools_available', 'childcare_available', 'farmers_markets'];

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
          current_value: typeof value
        });
      }
    });
  });

  const booleanIssues = issues.medium.filter(i => booleanFields.includes(i.field)).length;
  console.log(`   Found ${booleanIssues} boolean field type issues\n`);

  // Check 5: Array fields validation
  console.log('CHECK 5: Array fields validation...');
  const arrayFields = ['activities_available', 'interests_supported', 'top_hobbies'];

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
      // Check for empty arrays (informational only)
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
      // Check for very large arrays (might indicate data issue)
      if (Array.isArray(value) && value.length > 200) {
        issues.medium.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: field,
          issue: `${field} has unusually many items (>${value.length})`,
          severity: 'MEDIUM',
          current_value: `${value.length} items`
        });
      }
    });
  });

  const arrayIssues = issues.medium.filter(i => arrayFields.includes(i.field) && !i.issue.includes('empty')).length;
  const emptyArrayIssues = issues.low.filter(i => i.current_value === 'empty array').length;
  console.log(`   Found ${arrayIssues} array type issues and ${emptyArrayIssues} empty arrays\n`);

  // Check 6: Categorical fields validation
  console.log('CHECK 6: Categorical fields validation...');

  // Updated 2025-09-30: Use centralized validation with expanded value sets
  const validExpatSizes = ['small', 'moderate', 'large', null];
  const validRetirementPresence = [
    'none', 'minimal', 'limited', 'moderate', 'strong', 'extensive', 'very_strong', null
  ];
  const validCulturalFrequency = [
    'rare', 'occasional', 'monthly', 'frequent', 'weekly', 'constant', 'daily', null
  ];

  towns.forEach(town => {
    // expat_community_size
    if (town.expat_community_size && !validExpatSizes.includes(town.expat_community_size.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'expat_community_size',
        issue: `Invalid expat community size value`,
        severity: 'MEDIUM',
        current_value: town.expat_community_size,
        expected: 'small, moderate, large'
      });
    }

    // retirement_community_presence
    if (town.retirement_community_presence && !validRetirementPresence.includes(town.retirement_community_presence.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'retirement_community_presence',
        issue: `Invalid retirement community presence value`,
        severity: 'MEDIUM',
        current_value: town.retirement_community_presence,
        expected: 'low, moderate, high'
      });
    }

    // cultural_events_frequency
    if (town.cultural_events_frequency && !validCulturalFrequency.includes(town.cultural_events_frequency.toLowerCase())) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'cultural_events_frequency',
        issue: `Invalid cultural events frequency value`,
        severity: 'MEDIUM',
        current_value: town.cultural_events_frequency,
        expected: 'rare, occasional, frequent, constant'
      });
    }
  });

  const categoricalIssues = issues.medium.filter(i =>
    ['expat_community_size', 'retirement_community_presence', 'cultural_events_frequency'].includes(i.field)
  ).length;
  console.log(`   Found ${categoricalIssues} categorical field issues\n`);

  // Check 7: Consistency checks
  console.log('CHECK 7: Consistency checks...');
  towns.forEach(town => {
    // If international_schools_count > 0, international_schools_available should be true
    if (town.international_schools_count > 0 && town.international_schools_available === false) {
      issues.medium.push({
        town_id: town.id,
        town_name: town.name,
        country: town.country,
        field: 'international_schools_available',
        issue: 'Has international schools count but marked as not available',
        severity: 'MEDIUM',
        current_value: { count: town.international_schools_count, available: false }
      });
    }

    // If golf_courses_count is 0 but activities_available includes golf
    if (Array.isArray(town.activities_available) && town.golf_courses_count === 0) {
      const hasGolf = town.activities_available.some(a =>
        a && a.toLowerCase && a.toLowerCase().includes('golf')
      );
      if (hasGolf) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'golf_courses_count',
          issue: 'Activities include golf but golf courses count is 0',
          severity: 'LOW',
          current_value: { golf_courses: 0, has_golf_activity: true }
        });
      }
    }

    // If dog_parks_count is 0 but interests include pets/dogs
    if (Array.isArray(town.interests_supported) && town.dog_parks_count === 0) {
      const hasPetInterest = town.interests_supported.some(i =>
        i && i.toLowerCase && (i.toLowerCase().includes('pet') || i.toLowerCase().includes('dog'))
      );
      if (hasPetInterest) {
        issues.low.push({
          town_id: town.id,
          town_name: town.name,
          country: town.country,
          field: 'dog_parks_count',
          issue: 'Interests include pets/dogs but dog parks count is 0',
          severity: 'LOW',
          current_value: { dog_parks: 0, has_pet_interest: true }
        });
      }
    }
  });

  const consistencyIssues = issues.medium.filter(i => i.issue.includes('but marked')).length +
                            issues.low.filter(i => i.issue.includes('but ') && i.issue.includes(' is 0')).length;
  console.log(`   Found ${consistencyIssues} consistency issues\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PHASE 7 SUMMARY:\n');
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
    phase: 7,
    phase_name: 'Lifestyle/Amenities Data',
    columns_checked: [
      'outdoor_activities_rating', 'cultural_events_rating', 'shopping_rating', 'wellness_rating',
      'golf_courses_count', 'tennis_courts_count', 'hiking_trails_km', 'ski_resorts_within_100km',
      'marinas_count', 'farmers_markets', 'veterinary_clinics_count', 'dog_parks_count',
      'international_schools_count', 'coworking_spaces_count',
      'beaches_nearby', 'international_schools_available', 'childcare_available',
      'activities_available', 'interests_supported', 'top_hobbies',
      'expat_community_size', 'retirement_community_presence',
      'nightlife_rating', 'museums_rating', 'cultural_rating', 'outdoor_rating',
      'restaurants_rating', 'swimming_facilities', 'pet_friendly_rating',
      'cultural_events_frequency', 'expat_groups'
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
    'database-utilities/audit-phase7-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Phase 7 report saved to: database-utilities/audit-phase7-report.json\n');

  return report;
}

phase7Audit().catch(console.error);