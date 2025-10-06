import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fullAudit() {
  console.log('🔍 COMPLETE AUDIT - EVERY SINGLE COLUMN\n');
  console.log('='.repeat(80) + '\n');

  const { data: towns, error } = await supabase
    .from('towns')
    .select('*')
    .eq('country', 'Canada')
    .order('name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`📊 Auditing ${towns.length} Canadian towns\n`);

  // Get ALL columns from first town
  const allColumns = Object.keys(towns[0]);
  console.log(`📋 Total columns in towns table: ${allColumns.length}\n`);

  // Track NULLs for EVERY column
  const nullReport = {};

  allColumns.forEach(col => {
    const nullTowns = [];
    towns.forEach(town => {
      const value = town[col];
      if (value === null || value === undefined || value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
        nullTowns.push(town.name);
      }
    });

    if (nullTowns.length > 0) {
      nullReport[col] = {
        count: nullTowns.length,
        towns: nullTowns
      };
    }
  });

  // Sort by number of NULLs (worst first)
  const sorted = Object.entries(nullReport)
    .sort((a, b) => b[1].count - a[1].count);

  console.log('❌ ALL COLUMNS WITH NULL VALUES:\n');
  sorted.forEach(([col, data]) => {
    console.log(`${col}: ${data.count}/${towns.length} towns`);
    if (data.count <= 5) {
      console.log(`   Towns: ${data.towns.join(', ')}`);
    } else {
      console.log(`   Sample: ${data.towns.slice(0, 3).join(', ')}... (${data.count} total)`);
    }
    console.log('');
  });

  // Summary
  console.log('='.repeat(80));
  console.log(`\n📊 AUDIT SUMMARY:`);
  console.log(`Total columns: ${allColumns.length}`);
  console.log(`Columns with NULLs: ${sorted.length}`);
  console.log(`Columns clean: ${allColumns.length - sorted.length}`);

  const criticalNulls = sorted.filter(([col]) =>
    !col.includes('image_url_2') &&
    !col.includes('image_url_3') &&
    !col.includes('id') &&
    !col.includes('created_at') &&
    !col.includes('updated_at')
  );

  console.log(`\n🚨 CRITICAL COLUMNS WITH NULLS: ${criticalNulls.length}`);
  console.log('='.repeat(80) + '\n');

  // Save full report
  fs.writeFileSync(
    '/Users/tilmanrumpf/Desktop/scout2retire/database-utilities/FULL-CANADA-AUDIT.json',
    JSON.stringify({
      totalTowns: towns.length,
      totalColumns: allColumns.length,
      columnsWithNulls: sorted.length,
      details: Object.fromEntries(sorted)
    }, null, 2)
  );

  console.log('✅ Full audit saved to: FULL-CANADA-AUDIT.json\n');
}

fullAudit();
