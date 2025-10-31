/**
 * CREATE 18 PRODUCTION TEMPLATES
 *
 * Generates and inserts all 18 custom templates into field_search_templates table.
 * Each template includes:
 * - Professional Google search query with subdivision
 * - Proper Expected format based on valid categorical values
 * - Human-readable description
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for direct inserts
);

// Template definitions - all 18 fields
const templates = [
  // HIGH PRIORITY - Climate categorical fields
  {
    field_name: 'summer_climate_actual',
    search_template: 'What is the summer climate in {town_name}, {subdivision}, {country}?',
    expected_format: 'cold | cool | mild | warm | hot',
    human_description: 'Summer climate conditions (categorical)'
  },
  {
    field_name: 'winter_climate_actual',
    search_template: 'What is the winter climate in {town_name}, {subdivision}, {country}?',
    expected_format: 'cold | cool | mild | warm | hot',
    human_description: 'Winter climate conditions (categorical)'
  },
  {
    field_name: 'sunshine_level_actual',
    search_template: 'How sunny is {town_name}, {subdivision}, {country} throughout the year?',
    expected_format: 'low | less sunny | balanced | high | often sunny',
    human_description: 'Amount of sunshine throughout the year (categorical)'
  },
  {
    field_name: 'precipitation_level_actual',
    search_template: 'How much rainfall does {town_name}, {subdivision}, {country} receive annually?',
    expected_format: 'low | mostly dry | balanced | high | less dry',
    human_description: 'Amount of rainfall/precipitation (categorical)'
  },
  {
    field_name: 'seasonal_variation_actual',
    search_template: 'How much does the climate vary between seasons in {town_name}, {subdivision}, {country}?',
    expected_format: 'low | minimal | moderate | distinct seasons | high | extreme',
    human_description: 'How much climate varies between seasons (categorical)'
  },
  {
    field_name: 'humidity_level_actual',
    search_template: 'What is the humidity level in {town_name}, {subdivision}, {country}?',
    expected_format: 'dry | balanced | humid',
    human_description: 'General humidity level throughout the year (categorical)'
  },

  // HIGH PRIORITY - Tax fields
  {
    field_name: 'income_tax_rate_pct',
    search_template: 'What is the personal income tax rate in {town_name}, {subdivision}, {country}?',
    expected_format: 'Percentage (e.g., 15%, 22%, 0%)',
    human_description: 'Personal income tax rate percentage'
  },
  {
    field_name: 'property_tax_rate_pct',
    search_template: 'What is the annual property tax rate in {town_name}, {subdivision}, {country}?',
    expected_format: 'Percentage (e.g., 1.2%, 0.8%, 0%)',
    human_description: 'Property tax rate percentage (annual)'
  },
  {
    field_name: 'sales_tax_rate_pct',
    search_template: 'What is the sales tax or VAT rate in {town_name}, {subdivision}, {country}?',
    expected_format: 'Percentage (e.g., 7%, 20%, 0%)',
    human_description: 'Sales/VAT tax rate percentage'
  },

  // HIGH PRIORITY - Culture categorical fields
  {
    field_name: 'english_proficiency_level',
    search_template: 'How widely is English spoken in {town_name}, {subdivision}, {country}?',
    expected_format: 'low | moderate | high | very high | widespread | native',
    human_description: 'How widely English is spoken (categorical)'
  },
  {
    field_name: 'pace_of_life_actual',
    search_template: 'What is the pace of life in {town_name}, {subdivision}, {country}?',
    expected_format: 'slow | relaxed | moderate | fast',
    human_description: 'General pace of daily life (categorical)'
  },

  // MEDIUM PRIORITY - Medical specialties
  {
    field_name: 'medical_specialties_rating',
    search_template: 'What medical specialties are available in {town_name}, {subdivision}, {country} and how would you rate their quality on a scale of 1-10?',
    expected_format: 'Rating 1-10',
    human_description: 'Quality and availability of medical specialists (1-10 scale)'
  },
  {
    field_name: 'medical_specialties_available',
    search_template: 'What medical specialties are available in hospitals in {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list (e.g., Cardiology, Neurology, Orthopedics)',
    human_description: 'List of available medical specialties'
  },
  {
    field_name: 'healthcare_specialties_available',
    search_template: 'What healthcare specialties and specialized medical services are available in {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list (e.g., Oncology, Pediatrics, Geriatrics)',
    human_description: 'Specific healthcare specialties in the area'
  },

  // MEDIUM PRIORITY - Geographic features
  {
    field_name: 'geographic_features_actual',
    search_template: 'What are the main geographic features of {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list (e.g., coastal, mountainous, forested, plains, desert)',
    human_description: 'Main geographic features of the area'
  },
  {
    field_name: 'vegetation_type_actual',
    search_template: 'What type of vegetation and natural landscape surrounds {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list (e.g., tropical forest, grassland, desert, temperate forest)',
    human_description: 'Type of vegetation and natural landscape'
  },

  // LOW PRIORITY - List fields
  {
    field_name: 'water_bodies',
    search_template: 'What are the nearby water bodies (oceans, lakes, rivers) near {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list of water body names',
    human_description: 'Names of nearby water bodies (oceans, lakes, rivers)'
  },
  {
    field_name: 'activities_available',
    search_template: 'What recreational activities are available in {town_name}, {subdivision}, {country}?',
    expected_format: 'Comma-separated list of activities',
    human_description: 'Comma-separated list of available activities in the area'
  }
];

async function insertTemplates() {
  console.log('📝 CREATING 18 PRODUCTION TEMPLATES\n');
  console.log(`Inserting templates into field_search_templates table...\n`);

  // Get authenticated user (for updated_by field)
  // With service role key, this might not work, so we'll use a fallback
  let userId = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      console.log(`✓ Authenticated as: ${user.email || user.id}\n`);
    }
  } catch (err) {
    // Service role key doesn't support getUser(), get first admin user instead
    console.log('Using service role key - finding admin user...');
    const { data: adminUsers } = await supabase
      .from('users')
      .select('id, email')
      .eq('admin_role', 'executive_admin')
      .limit(1);

    if (adminUsers && adminUsers.length > 0) {
      userId = adminUsers[0].id;
      console.log(`✓ Using admin: ${adminUsers[0].email}\n`);
    } else {
      console.log('⚠ No admin user found - creating templates without updated_by field\n');
    }
  }

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const template of templates) {
    try {
      const templateData = {
        ...template,
        status: 'active'
      };

      // Only add updated_by if we have a userId
      if (userId) {
        templateData.updated_by = userId;
      }

      const { data, error } = await supabase
        .from('field_search_templates')
        .upsert(templateData, {
          onConflict: 'field_name'
        })
        .select();

      if (error) throw error;

      console.log(`✓ ${template.field_name}`);
      console.log(`  Query: ${template.search_template}`);
      console.log(`  Expected: ${template.expected_format}\n`);
      successCount++;
    } catch (error) {
      console.error(`✗ ${template.field_name}: ${error.message}`);
      errorCount++;
      errors.push({ field: template.field_name, error: error.message });
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✓ Successfully created: ${successCount} templates`);
  console.log(`✗ Errors: ${errorCount} templates\n`);

  if (errors.length > 0) {
    console.log('ERRORS:\n');
    errors.forEach(e => {
      console.log(`  ${e.field}: ${e.error}`);
    });
  }

  // Verify final count
  const { count, error: countError } = await supabase
    .from('field_search_templates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (!countError) {
    console.log(`\nTotal active templates in database: ${count}`);
  }

  console.log('\n✅ Template creation complete!\n');

  process.exit(errorCount > 0 ? 1 : 0);
}

insertTemplates().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
