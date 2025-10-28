import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  console.log(`\n⚙️  ${description}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });

    if (error) {
      // Try alternative: direct query
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql_string: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`✅ ${description} complete`);
      return await response.json();
    }

    console.log(`✅ ${description} complete`);
    return data;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function runGeographicMigration() {
  console.log('🚀 Starting Geographic Standardization Migration');
  console.log('=' .repeat(70));

  try {
    // Step 1: Add new columns
    await executeSQL(
      `ALTER TABLE towns
       ADD COLUMN IF NOT EXISTS town_name VARCHAR(255),
       ADD COLUMN IF NOT EXISTS country_code VARCHAR(2),
       ADD COLUMN IF NOT EXISTS subdivision_code VARCHAR(10)`,
      'Step 1: Adding new columns (town_name, country_code, subdivision_code)'
    );

    // Step 2: Copy data from name to town_name
    await executeSQL(
      `UPDATE towns SET town_name = name WHERE town_name IS NULL`,
      'Step 2: Copying data from name to town_name'
    );

    // Step 3: Add column comments
    await executeSQL(
      `COMMENT ON COLUMN towns.town_name IS 'Name of the town/city (formerly "name")'`,
      'Step 3a: Adding comment to town_name'
    );

    await executeSQL(
      `COMMENT ON COLUMN towns.country_code IS 'ISO 3166-1 alpha-2 country code (US, AE, CA, etc.)'`,
      'Step 3b: Adding comment to country_code'
    );

    await executeSQL(
      `COMMENT ON COLUMN towns.subdivision_code IS 'ISO 3166-2 subdivision code (FL, AZ, ON, etc.) - NULL if no standard code exists'`,
      'Step 3c: Adding comment to subdivision_code'
    );

    await executeSQL(
      `COMMENT ON COLUMN towns.name IS 'DEPRECATED: Use town_name instead. Kept for backward compatibility during migration.'`,
      'Step 3d: Adding deprecation comment to name'
    );

    // Step 4: Create indexes
    await executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_towns_town_name ON towns(town_name)`,
      'Step 4a: Creating index on town_name'
    );

    await executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_towns_country_code ON towns(country_code)`,
      'Step 4b: Creating index on country_code'
    );

    await executeSQL(
      `CREATE INDEX IF NOT EXISTS idx_towns_subdivision_code ON towns(subdivision_code) WHERE subdivision_code IS NOT NULL`,
      'Step 4c: Creating partial index on subdivision_code'
    );

    console.log('\n🔍 Verifying migration...');

    // Verify data was copied
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('id, name, town_name, country, country_code, region, subdivision_code')
      .limit(5);

    if (townsError) {
      throw new Error(`Verification query failed: ${townsError.message}`);
    }

    console.log('\n📊 Sample data after migration:');
    towns.forEach(town => {
      console.log(`  - ${town.town_name} (name: "${town.name}", matches: ${town.name === town.town_name ? '✅' : '❌'})`);
    });

    // Count verification
    const { count: totalCount } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });

    const { count: townNameCount } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('town_name', 'is', null);

    const { count: nameCount } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true })
      .not('name', 'is', null);

    console.log('\n✅ VERIFICATION RESULTS:');
    console.log(`  Total towns: ${totalCount}`);
    console.log(`  Towns with name: ${nameCount}`);
    console.log(`  Towns with town_name: ${townNameCount}`);

    if (totalCount === townNameCount && townNameCount === nameCount) {
      console.log(`  ✅ Perfect! All ${totalCount} towns have both name and town_name populated!`);
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('  1. Update code to use town_name instead of name');
      console.log('  2. Test all features');
      console.log('  3. Verify no errors');
      console.log('  4. Drop old "name" column after full verification');
      return true;
    } else {
      console.log(`  ⚠️  Warning: Counts don't match!`);
      return false;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n🔄 To rollback:');
    console.error('  node restore-database-snapshot.js 2025-10-28T03-40-05');
    return false;
  }
}

console.log('Starting migration...\n');
runGeographicMigration().then(success => {
  process.exit(success ? 0 : 1);
});
