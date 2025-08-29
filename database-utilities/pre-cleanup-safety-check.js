import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfc2VydmljZV9yb2xlIiwiaWF0IjoxNzQ4NzA2MzQ1LCJleHAiOjIwNjQyODIzNDV9.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

console.log('🔍 MASTER CLEANUP PLAN V5.0 - PRE-FLIGHT SAFETY CHECK');
console.log('=' .repeat(60));

async function checkSystemState() {
  try {
    // 1. Check environment
    const PRODUCTION_URL = 'axlruvvsjepsulcbqlho';
    const isProduction = process.env.SUPABASE_URL?.includes(PRODUCTION_URL) || true; // We know it's production
    
    console.log('\n📊 ENVIRONMENT CHECK:');
    console.log(`Environment: ${isProduction ? '🔴 PRODUCTION DATABASE' : '✅ Development'}`);
    console.log(`Project ID: ${PRODUCTION_URL}`);
    
    // 2. Check current data state
    console.log('\n📊 CURRENT DATA STATE:');
    
    // Count records
    const { count: userCount } = await supabase
      .from('user_preferences')
      .select('*', { count: 'exact', head: true });
    
    const { count: townCount } = await supabase
      .from('towns')
      .select('*', { count: 'exact', head: true });
    
    console.log(`User preferences: ${userCount} records`);
    console.log(`Towns: ${townCount} records`);
    
    // 3. Check for case issues
    console.log('\n🔍 CHECKING FOR CASE ISSUES:');
    
    // Sample user preferences
    const { data: users } = await supabase
      .from('user_preferences')
      .select('user_id, email, geographic_features, vegetation_types, activities')
      .limit(5);
    
    let userCaseIssues = 0;
    users?.forEach(user => {
      const hasGeoCase = user.geographic_features?.some(f => f && f !== f.toLowerCase());
      const hasVegCase = user.vegetation_types?.some(v => v && v !== v.toLowerCase());
      const hasActCase = user.activities?.some(a => a && a !== a.toLowerCase());
      
      if (hasGeoCase || hasVegCase || hasActCase) {
        userCaseIssues++;
        console.log(`  ⚠️ User ${user.email} has mixed case data`);
      }
    });
    
    // Sample towns
    const { data: towns } = await supabase
      .from('towns')
      .select('id, name, geographic_features_actual, vegetation_type_actual')
      .limit(5);
    
    let townCaseIssues = 0;
    towns?.forEach(town => {
      const hasGeoCase = town.geographic_features_actual && 
                         town.geographic_features_actual !== town.geographic_features_actual.toLowerCase();
      const hasVegCase = town.vegetation_type_actual && 
                         town.vegetation_type_actual !== town.vegetation_type_actual.toLowerCase();
      
      if (hasGeoCase || hasVegCase) {
        townCaseIssues++;
        console.log(`  ⚠️ Town ${town.name} has mixed case data`);
      }
    });
    
    console.log(`\n📊 CASE ISSUE SUMMARY:`);
    console.log(`Users with case issues: ${userCaseIssues}/${users?.length || 0} sampled`);
    console.log(`Towns with case issues: ${townCaseIssues}/${towns?.length || 0} sampled`);
    
    // 4. Check for existing backups
    console.log('\n🔍 CHECKING EXISTING BACKUPS:');
    
    const { data: tables } = await supabase.rpc('get_table_names');
    const backupTables = tables?.filter(t => 
      t.table_name.includes('backup') || 
      t.table_name.includes('_backup_')
    );
    
    if (backupTables?.length > 0) {
      console.log('  ⚠️ Found existing backup tables:');
      backupTables.forEach(t => console.log(`    - ${t.table_name}`));
    } else {
      console.log('  ✅ No existing backup tables found');
    }
    
    // 5. Check system flags table
    console.log('\n🔍 CHECKING SYSTEM FLAGS:');
    try {
      const { data: flags } = await supabase
        .from('system_flags')
        .select('*')
        .eq('key', 'maintenance_mode');
      
      if (flags?.length > 0) {
        console.log(`  Maintenance mode: ${flags[0].value ? '🔴 ENABLED' : '✅ Disabled'}`);
      } else {
        console.log('  ℹ️ System flags table not configured yet');
      }
    } catch (e) {
      console.log('  ℹ️ System flags table does not exist (will be created)');
    }
    
    // 6. Final safety prompt
    console.log('\n' + '=' .repeat(60));
    console.log('⚠️  SAFETY CONFIRMATION REQUIRED');
    console.log('=' .repeat(60));
    console.log('\nYou are about to execute the Master Cleanup Plan V5.0 on:');
    console.log(`  🔴 PRODUCTION DATABASE: ${PRODUCTION_URL}`);
    console.log(`  📊 Affecting ${userCount} users and ${townCount} towns`);
    console.log('\nThis will:');
    console.log('  1. Normalize all data to lowercase in the database');
    console.log('  2. Update all scoring algorithms');
    console.log('  3. Implement transformation layer for UI');
    console.log('  4. Create multiple backups');
    console.log('\n⚠️  THIS IS A PRODUCTION OPERATION');
    
    const answer = await prompt('\nType "PROCEED WITH CLEANUP" to continue, or anything else to abort: ');
    
    if (answer !== 'PROCEED WITH CLEANUP') {
      console.log('\n✅ Operation CANCELLED - No changes made');
      process.exit(0);
    }
    
    console.log('\n✅ Safety check passed - Ready to proceed with cleanup');
    console.log('\nNext steps:');
    console.log('  1. Create enhanced safety scripts');
    console.log('  2. Fix critical blockers');
    console.log('  3. Execute Phase 0 (Pre-flight checks)');
    console.log('  4. Continue with remaining phases');
    
  } catch (error) {
    console.error('❌ Error during safety check:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the check
checkSystemState();