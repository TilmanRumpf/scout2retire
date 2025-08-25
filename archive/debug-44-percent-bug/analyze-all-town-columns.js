import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeAllTownColumns() {
  console.log('🔬 DEEP ANALYSIS OF ALL TOWN COLUMNS FOR ACTIVITY MAPPING\n');
  console.log('=========================================================\n');
  
  // Get a complete town record
  const { data: sampleTown, error } = await supabase
    .from('towns')
    .select('*')
    .eq('name', 'Barcelona')
    .single();
    
  if (error) {
    console.error('Error fetching sample:', error);
    return;
  }
  
  // Categorize ALL columns
  const columnCategories = {
    infrastructure: [],
    geographic: [],
    climate: [],
    demographic: [],
    economic: [],
    cultural: [],
    safety: [],
    transport: [],
    nature: [],
    facilities: [],
    metadata: []
  };
  
  const allColumns = Object.keys(sampleTown);
  console.log(`Total columns in towns table: ${allColumns.length}\n`);
  
  // Categorize each column
  allColumns.forEach(col => {
    const value = sampleTown[col];
    const type = Array.isArray(value) ? 'array' : typeof value;
    
    // Infrastructure & Facilities
    if (col.includes('count') || col.includes('facilities') || col.includes('courts') || 
        col.includes('courses') || col.includes('spaces') || col.includes('schools') ||
        col.includes('clinics') || col.includes('parks') || col.includes('marinas') ||
        col.includes('hospital') || col.includes('airport')) {
      columnCategories.infrastructure.push({ name: col, type, sample: value });
    }
    // Geographic
    else if (col.includes('geographic') || col.includes('latitude') || col.includes('longitude') ||
             col.includes('elevation') || col.includes('distance') || col.includes('km') ||
             col.includes('region') || col.includes('province') || col.includes('state')) {
      columnCategories.geographic.push({ name: col, type, sample: value });
    }
    // Climate & Weather
    else if (col.includes('climate') || col.includes('temp') || col.includes('humidity') ||
             col.includes('rain') || col.includes('sun') || col.includes('seasonal') ||
             col.includes('weather')) {
      columnCategories.climate.push({ name: col, type, sample: value });
    }
    // Demographics
    else if (col.includes('population') || col.includes('expat') || col.includes('density') ||
             col.includes('age') || col.includes('retirement')) {
      columnCategories.demographic.push({ name: col, type, sample: value });
    }
    // Economic
    else if (col.includes('cost') || col.includes('price') || col.includes('tax') ||
             col.includes('budget') || col.includes('economy') || col.includes('gdp')) {
      columnCategories.economic.push({ name: col, type, sample: value });
    }
    // Cultural & Lifestyle
    else if (col.includes('culture') || col.includes('language') || col.includes('cuisine') ||
             col.includes('nightlife') || col.includes('lifestyle') || col.includes('activities') ||
             col.includes('interests')) {
      columnCategories.cultural.push({ name: col, type, sample: value });
    }
    // Safety & Health
    else if (col.includes('safety') || col.includes('crime') || col.includes('health') ||
             col.includes('emergency') || col.includes('pollution')) {
      columnCategories.safety.push({ name: col, type, sample: value });
    }
    // Transport
    else if (col.includes('transport') || col.includes('transit') || col.includes('airport') ||
             col.includes('walkability') || col.includes('traffic')) {
      columnCategories.transport.push({ name: col, type, sample: value });
    }
    // Nature & Environment
    else if (col.includes('water') || col.includes('beach') || col.includes('trail') ||
             col.includes('forest') || col.includes('mountain') || col.includes('vegetation') ||
             col.includes('ski') || col.includes('nature')) {
      columnCategories.nature.push({ name: col, type, sample: value });
    }
    // Metadata
    else if (col === 'id' || col === 'created_at' || col === 'updated_at' || 
             col === 'name' || col === 'country' || col === 'slug' || col === 'photos') {
      columnCategories.metadata.push({ name: col, type, sample: value });
    }
    // Uncategorized
    else {
      columnCategories.facilities.push({ name: col, type, sample: value });
    }
  });
  
  // Print categorized columns
  Object.entries(columnCategories).forEach(([category, columns]) => {
    if (columns.length > 0) {
      console.log(`\n📁 ${category.toUpperCase()} (${columns.length} columns):`);
      console.log('=' + '='.repeat(50));
      columns.forEach(col => {
        let sampleStr = '';
        if (col.sample !== null && col.sample !== undefined) {
          if (Array.isArray(col.sample)) {
            sampleStr = `[${col.sample.slice(0, 2).join(', ')}${col.sample.length > 2 ? '...' : ''}]`;
          } else if (typeof col.sample === 'object') {
            sampleStr = '{object}';
          } else if (typeof col.sample === 'string' && col.sample.length > 30) {
            sampleStr = col.sample.substring(0, 30) + '...';
          } else {
            sampleStr = String(col.sample);
          }
        }
        console.log(`  ${col.name} (${col.type}): ${sampleStr}`);
      });
    }
  });
  
  // Find KEY columns for activity mapping
  console.log('\n\n🎯 KEY COLUMNS FOR ACTIVITY MAPPING:\n');
  console.log('=' + '='.repeat(50));
  
  const keyColumns = [
    // Sports facilities
    'golf_courses_count',
    'tennis_courts_count',
    'swimming_facilities',
    'fitness_clubs_count',
    'sports_complexes_count',
    
    // Nature & Outdoor
    'hiking_trails_km',
    'beaches_nearby',
    'ski_resorts_within_100km',
    'national_parks_nearby',
    'nature_reserves_nearby',
    'bike_paths_km',
    
    // Water
    'marinas_count',
    'water_bodies',
    'distance_to_ocean_km',
    'lakes_nearby',
    'rivers_nearby',
    
    // Urban amenities
    'museums_count',
    'theaters_count',
    'concert_venues_count',
    'art_galleries_count',
    'nightlife_spots_count',
    'restaurants_count',
    'cafes_count',
    'shopping_centers_count',
    
    // Community
    'coworking_spaces_count',
    'community_centers_count',
    'libraries_count',
    'parks_count',
    'dog_parks_count',
    
    // Demographics
    'expat_population_pct',
    'retirement_population_pct',
    'university_present',
    
    // Climate
    'avg_temp_summer',
    'avg_temp_winter',
    'sunny_days_per_year',
    'rainy_days_per_year'
  ];
  
  // Check which key columns exist
  const existingKeyColumns = [];
  const missingKeyColumns = [];
  
  keyColumns.forEach(col => {
    if (allColumns.includes(col)) {
      existingKeyColumns.push(col);
      const value = sampleTown[col];
      console.log(`✅ ${col}: ${value}`);
    } else {
      missingKeyColumns.push(col);
    }
  });
  
  console.log('\n❌ POTENTIALLY USEFUL BUT MISSING COLUMNS:');
  missingKeyColumns.forEach(col => console.log(`  - ${col}`));
  
  // Check for unexpected useful columns
  console.log('\n💡 DISCOVERED USEFUL COLUMNS NOT IN KEY LIST:');
  allColumns.forEach(col => {
    if (!keyColumns.includes(col) && !['id', 'created_at', 'updated_at', 'name', 'country', 'slug'].includes(col)) {
      const value = sampleTown[col];
      if (value && value !== 0 && value !== false && value !== '0') {
        // Check if it could be useful for activities
        if (col.includes('club') || col.includes('sport') || col.includes('recreation') ||
            col.includes('entertainment') || col.includes('cultural') || col.includes('outdoor') ||
            col.includes('wellness') || col.includes('spa') || col.includes('yoga') ||
            col.includes('dive') || col.includes('surf') || col.includes('fish')) {
          console.log(`  🌟 ${col}: ${value}`);
        }
      }
    }
  });
  
  // Get statistics on infrastructure availability
  console.log('\n\n📊 INFRASTRUCTURE AVAILABILITY STATISTICS:\n');
  console.log('=' + '='.repeat(50));
  
  const { data: stats } = await supabase
    .from('towns')
    .select('golf_courses_count, tennis_courts_count, beaches_nearby, ski_resorts_within_100km, marinas_count, hiking_trails_km');
  
  const availability = {
    golf: stats.filter(t => t.golf_courses_count > 0).length,
    tennis: stats.filter(t => t.tennis_courts_count > 0).length,
    beaches: stats.filter(t => t.beaches_nearby).length,
    skiing: stats.filter(t => t.ski_resorts_within_100km > 0).length,
    marinas: stats.filter(t => t.marinas_count > 0).length,
    hiking: stats.filter(t => t.hiking_trails_km > 0).length
  };
  
  Object.entries(availability).forEach(([activity, count]) => {
    const percentage = ((count / 341) * 100).toFixed(1);
    console.log(`${activity}: ${count}/341 towns (${percentage}%)`);
  });
}

// Run analysis
analyzeAllTownColumns().catch(console.error);