import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function analyzeTownsSchema() {
  console.log('🔍 Analyzing towns table schema...\n');

  try {
    // Get all columns by querying a sample row and using Object.keys
    const { data: sampleData, error: schemaError } = await supabase
      .from('towns')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('Error fetching sample data:', schemaError);
      return;
    }

    // Extract column names from the sample data
    const columns = sampleData && sampleData.length > 0 
      ? Object.keys(sampleData[0]).map(col => ({ 
          column_name: col, 
          data_type: typeof sampleData[0][col] === 'number' ? 'numeric' : 
                     typeof sampleData[0][col] === 'boolean' ? 'boolean' : 'text',
          is_nullable: 'YES'
        }))
      : [];

    // Get sample data to check which columns have values
    const { data: sampleTown, error: sampleError } = await supabase
      .from('towns')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('Error fetching sample town:', sampleError);
    }

    // Get statistics about data population
    const { data: stats, error: statsError } = await supabase
      .from('towns')
      .select('*')
      .limit(1000); // Sample for stats

    // Categorize columns
    const categories = {
      'Core Information': ['id', 'name', 'state', 'state_code', 'country', 'latitude', 'longitude', 'created_at', 'updated_at'],
      'Demographics': ['population', 'population_source', 'median_age', 'senior_population_percentage'],
      'Climate & Weather': ['climate_zone', 'january_avg_temp', 'july_avg_temp', 'annual_rainfall', 'sunny_days_per_year', 'natural_disaster_risk', 'air_quality_index'],
      'Cost of Living': ['overall_cost_index', 'housing_cost_index', 'healthcare_cost_index', 'groceries_cost_index', 'utilities_cost_index', 'transportation_cost_index', 'median_home_price', 'median_rent', 'property_tax_rate', 'sales_tax_rate', 'income_tax_state'],
      'Healthcare': ['healthcare_rating', 'hospital_count', 'doctors_per_capita', 'nearest_major_hospital', 'medicare_advantage_plans', 'medicare_rating'],
      'Lifestyle & Amenities': ['walkability_score', 'transit_score', 'bike_score', 'community_centers', 'golf_courses', 'parks_count', 'restaurants_count', 'shopping_options', 'cultural_attractions', 'outdoor_activities'],
      'Safety & Politics': ['crime_rate', 'crime_index', 'political_lean', 'political_lean_source'],
      'Transportation': ['nearest_airport', 'airport_distance', 'public_transportation', 'traffic_index'],
      'Internet & Tech': ['internet_speed_mbps', 'internet_providers', 'cell_coverage_rating'],
      'Images & Media': ['image_url_1', 'image_url_2', 'image_url_3', 'video_url'],
      'AI Generated Content': ['description', 'pros', 'cons', 'best_for', 'not_great_for', 'health_safety_climate', 'things_to_do'],
      'Additional Metadata': ['data_quality_score', 'last_updated', 'update_source', 'featured', 'active']
    };

    // Count non-null values for each column
    const columnStats = {};
    if (stats && stats.length > 0) {
      Object.keys(stats[0]).forEach(column => {
        columnStats[column] = {
          nonNullCount: stats.filter(row => row[column] !== null && row[column] !== '').length,
          percentage: Math.round((stats.filter(row => row[column] !== null && row[column] !== '').length / stats.length) * 100)
        };
      });
    }

    // Display results
    console.log('📊 TOWNS TABLE SCHEMA ANALYSIS');
    console.log('================================\n');

    console.log(`Total columns: ${columns?.length || 'Unknown'}\n`);

    // Show by category
    Object.entries(categories).forEach(([category, cols]) => {
      console.log(`\n📁 ${category.toUpperCase()}`);
      console.log('-'.repeat(50));
      
      cols.forEach(col => {
        const columnInfo = columns?.find(c => c.column_name === col);
        const stats = columnStats[col] || { nonNullCount: 0, percentage: 0 };
        const dataType = columnInfo?.data_type || 'unknown';
        const nullable = columnInfo?.is_nullable === 'YES' ? '?' : '!';
        const populated = stats.percentage > 75 ? '✅' : stats.percentage > 25 ? '🟡' : '❌';
        
        console.log(`${populated} ${col}${nullable} (${dataType}) - ${stats.percentage}% populated`);
      });
    });

    // Find columns not in categories
    const categorizedColumns = Object.values(categories).flat();
    const uncategorized = columns?.filter(c => !categorizedColumns.includes(c.column_name)) || [];
    
    if (uncategorized.length > 0) {
      console.log('\n📁 UNCATEGORIZED COLUMNS');
      console.log('-'.repeat(50));
      uncategorized.forEach(col => {
        const stats = columnStats[col.column_name] || { nonNullCount: 0, percentage: 0 };
        const populated = stats.percentage > 75 ? '✅' : stats.percentage > 25 ? '🟡' : '❌';
        console.log(`${populated} ${col.column_name} (${col.data_type}) - ${stats.percentage}% populated`);
      });
    }

    // Summary of enrichment opportunities
    console.log('\n🎯 ENRICHMENT OPPORTUNITIES');
    console.log('================================');
    
    const emptyColumns = Object.entries(columnStats)
      .filter(([col, stats]) => stats.percentage === 0)
      .map(([col]) => col);
    
    const partialColumns = Object.entries(columnStats)
      .filter(([col, stats]) => stats.percentage > 0 && stats.percentage < 50)
      .map(([col]) => col);

    console.log(`\n❌ Completely empty columns (${emptyColumns.length}):`);
    emptyColumns.forEach(col => console.log(`   - ${col}`));
    
    console.log(`\n🟡 Partially filled columns (${partialColumns.length}):`);
    partialColumns.forEach(col => {
      const pct = columnStats[col].percentage;
      console.log(`   - ${col} (${pct}% filled)`);
    });

    // Get total towns count
    const { count } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 OVERALL STATISTICS`);
    console.log('================================');
    console.log(`Total towns: ${count}`);
    console.log(`Sample size for stats: ${stats?.length || 0}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the analysis
analyzeTownsSchema();