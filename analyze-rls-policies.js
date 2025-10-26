import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'present' : 'missing');
  console.error('SUPABASE_KEY:', SUPABASE_KEY ? 'present' : 'missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔍 Analyzing RLS Policies...\n');

// Query to get all RLS policies with their definitions
const { data: policies, error } = await supabase.rpc('exec_sql', {
  sql: `
    SELECT
      n.nspname as schemaname,
      c.relname as tablename,
      pol.polname as policyname,
      CASE pol.polpermissive WHEN true THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as permissive,
      CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
      END as cmd,
      pg_get_expr(pol.polqual, pol.polrelid) as qual,
      pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check,
      ARRAY(
        SELECT rolname
        FROM pg_roles
        WHERE oid = ANY(pol.polroles)
      ) as roles
    FROM pg_policy pol
    JOIN pg_class c ON pol.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY c.relname, pol.polcmd, pol.polname;
  `
});

if (error) {
  console.error('❌ Error fetching policies:', error);
  process.exit(1);
}

console.log(`✅ Found ${policies.length} RLS policies\n`);

// Group by table
const byTable = {};
policies.forEach(p => {
  if (!byTable[p.tablename]) {
    byTable[p.tablename] = [];
  }
  byTable[p.tablename].push(p);
});

// Analyze each table
console.log('📊 ANALYSIS BY TABLE:\n');
console.log('='.repeat(80));

Object.keys(byTable).sort().forEach(table => {
  const tablePolicies = byTable[table];
  console.log(`\n🗂️  TABLE: ${table}`);
  console.log(`   Policies: ${tablePolicies.length}`);

  // Check for auth function usage patterns
  const authPatterns = {
    'auth.uid()': 0,
    'auth.jwt()': 0,
    'auth.role()': 0,
    'auth.email()': 0
  };

  const cmdGroups = {};
  tablePolicies.forEach(p => {
    // Count auth functions
    const fullDef = (p.qual || '') + ' ' + (p.with_check || '');
    Object.keys(authPatterns).forEach(pattern => {
      const matches = (fullDef.match(new RegExp(pattern.replace(/[()]/g, '\\$&'), 'g')) || []).length;
      authPatterns[pattern] += matches;
    });

    // Group by command
    if (!cmdGroups[p.cmd]) cmdGroups[p.cmd] = [];
    cmdGroups[p.cmd].push(p);
  });

  // Show command breakdown
  Object.keys(cmdGroups).forEach(cmd => {
    const count = cmdGroups[cmd].length;
    console.log(`   - ${cmd}: ${count} ${count > 1 ? '⚠️  MULTIPLE PERMISSIVE' : 'policy'}`);
  });

  // Show auth function usage
  const authUsage = Object.entries(authPatterns).filter(([_, count]) => count > 0);
  if (authUsage.length > 0) {
    console.log(`   Auth Functions:`);
    authUsage.forEach(([func, count]) => {
      console.log(`     - ${func}: ${count} occurrences ${count > 2 ? '⚠️  HIGH' : ''}`);
    });
  }

  // Show a sample policy
  if (tablePolicies.length > 0) {
    const sample = tablePolicies[0];
    console.log(`   Sample Policy: "${sample.policyname}"`);
    if (sample.qual) {
      console.log(`     USING: ${sample.qual.substring(0, 100)}${sample.qual.length > 100 ? '...' : ''}`);
    }
    if (sample.with_check) {
      console.log(`     WITH CHECK: ${sample.with_check.substring(0, 100)}${sample.with_check.length > 100 ? '...' : ''}`);
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n🎯 KEY FINDINGS:\n');

// Find tables with multiple permissive policies per command
const multiPolicyTables = [];
Object.entries(byTable).forEach(([table, policies]) => {
  const cmdCounts = {};
  policies.forEach(p => {
    if (p.permissive === 'PERMISSIVE' || p.permissive === true) {
      cmdCounts[p.cmd] = (cmdCounts[p.cmd] || 0) + 1;
    }
  });
  Object.entries(cmdCounts).forEach(([cmd, count]) => {
    if (count > 1) {
      multiPolicyTables.push({ table, cmd, count });
    }
  });
});

if (multiPolicyTables.length > 0) {
  console.log('⚠️  MULTIPLE PERMISSIVE POLICIES (Performance Impact):');
  multiPolicyTables.forEach(({ table, cmd, count }) => {
    console.log(`   - ${table}.${cmd}: ${count} permissive policies`);
  });
  console.log('   Impact: Postgres evaluates ALL permissive policies with OR logic');
  console.log('   Fix: Combine into single policy with OR conditions\n');
}

// Count auth function usage across all policies
const totalAuthUsage = {};
policies.forEach(p => {
  const fullDef = (p.qual || '') + ' ' + (p.with_check || '');
  ['auth.uid()', 'auth.jwt()', 'auth.role()', 'auth.email()'].forEach(func => {
    const matches = (fullDef.match(new RegExp(func.replace(/[()]/g, '\\$&'), 'g')) || []).length;
    totalAuthUsage[func] = (totalAuthUsage[func] || 0) + matches;
  });
});

console.log('⚠️  AUTH FUNCTION USAGE (Re-evaluation Risk):');
Object.entries(totalAuthUsage).filter(([_, count]) => count > 0).forEach(([func, count]) => {
  console.log(`   - ${func}: ${count} occurrences across all policies`);
});
console.log('   Impact: Each occurrence may be re-evaluated per row');
console.log('   Fix: Cache auth values in CTE or security definer function\n');

console.log('✅ Analysis complete!\n');

process.exit(0);
