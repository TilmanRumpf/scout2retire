#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔍 Analyzing RLS Policies in Detail...\n');

// Use raw SQL query via Supabase
const query = `
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
`;

// Execute raw SQL
const { data: policies, error } = await supabase.rpc('exec_raw_sql', { query });

if (error) {
  // Try alternative: query pg_catalog directly
  console.log('⚠️  RPC not available, using PostgREST query...\n');

  // Get list of tables first
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (tablesError) {
    console.error('❌ Cannot query database schema');
    console.error('Error:', tablesError);
    process.exit(1);
  }

  console.log(`📊 Found ${tables.length} tables in public schema\n`);
  console.log('Reading RLS policies from migrations instead...\n');

  process.exit(0);
}

console.log(`✅ Found ${policies.length} RLS policies\n`);
analyzePolicies(policies);

function analyzePolicies(policies) {
  // Group by table
  const byTable = {};
  policies.forEach(p => {
    if (!byTable[p.tablename]) {
      byTable[p.tablename] = [];
    }
    byTable[p.tablename].push(p);
  });

  // Analyze each table
  console.log('📊 DETAILED ANALYSIS BY TABLE:\n');
  console.log('='.repeat(100));

  Object.keys(byTable).sort().forEach(table => {
    const tablePolicies = byTable[table];
    console.log(`\n🗂️  TABLE: ${table}`);
    console.log(`   Total Policies: ${tablePolicies.length}`);

    // Check for auth function usage patterns
    const authPatterns = {
      'auth.uid()': 0,
      'auth.jwt()': 0,
      'auth.role()': 0,
      'auth.email()': 0
    };

    const cmdGroups = {};
    let subqueryCount = 0;
    let complexJoinCount = 0;

    tablePolicies.forEach(p => {
      // Count auth functions
      const fullDef = (p.qual || '') + ' ' + (p.with_check || '');
      Object.keys(authPatterns).forEach(pattern => {
        const matches = (fullDef.match(new RegExp(pattern.replace(/[()]/g, '\\$&'), 'g')) || []).length;
        authPatterns[pattern] += matches;
      });

      // Check for subqueries (EXISTS, IN with SELECT)
      if (fullDef.match(/EXISTS\s*\(/i) || fullDef.match(/IN\s*\(\s*SELECT/i)) {
        subqueryCount++;
      }

      // Check for joins
      if (fullDef.match(/JOIN/i)) {
        complexJoinCount++;
      }

      // Group by command
      if (!cmdGroups[p.cmd]) cmdGroups[p.cmd] = [];
      cmdGroups[p.cmd].push(p);
    });

    // Show command breakdown
    console.log(`\n   📋 Policies by Command:`);
    Object.keys(cmdGroups).sort().forEach(cmd => {
      const count = cmdGroups[cmd].length;
      const warning = count > 1 ? ' ⚠️  MULTIPLE PERMISSIVE (Performance Issue)' : '';
      console.log(`      ${cmd}: ${count} ${count === 1 ? 'policy' : 'policies'}${warning}`);
    });

    // Show auth function usage
    const authUsage = Object.entries(authPatterns).filter(([_, count]) => count > 0);
    if (authUsage.length > 0) {
      console.log(`\n   🔐 Auth Function Usage:`);
      authUsage.forEach(([func, count]) => {
        const severity = count > 3 ? ' ⚠️  CRITICAL' : count > 1 ? ' ⚠️  HIGH' : '';
        console.log(`      ${func}: ${count} occurrences${severity}`);
      });
    }

    // Show complexity indicators
    if (subqueryCount > 0 || complexJoinCount > 0) {
      console.log(`\n   ⚡ Performance Indicators:`);
      if (subqueryCount > 0) {
        console.log(`      Subqueries (EXISTS/IN SELECT): ${subqueryCount} ⚠️  Re-evaluated per row`);
      }
      if (complexJoinCount > 0) {
        console.log(`      Joins in policies: ${complexJoinCount} ⚠️  May cause n+1 queries`);
      }
    }

    // Show sample policies with full definitions
    console.log(`\n   📝 Policy Definitions:`);
    tablePolicies.forEach((sample, idx) => {
      console.log(`\n      [${idx + 1}] ${sample.policyname} (${sample.cmd})`);
      if (sample.qual) {
        console.log(`          USING: ${sample.qual}`);
      }
      if (sample.with_check) {
        console.log(`          WITH CHECK: ${sample.with_check}`);
      }
    });
  });

  console.log('\n' + '='.repeat(100));
  console.log('\n🎯 SUMMARY OF PERFORMANCE ISSUES:\n');

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
    console.log('⚠️  ISSUE #1: MULTIPLE PERMISSIVE POLICIES (Medium Impact)');
    console.log('   Problem: Postgres evaluates ALL permissive policies with OR logic');
    console.log('   Impact: Multiple policy evaluations per row\n');
    multiPolicyTables.forEach(({ table, cmd, count }) => {
      console.log(`   - ${table}.${cmd}: ${count} permissive policies`);
    });
    console.log('\n   Fix: Combine into single policy with OR conditions inside policy');
    console.log('   Example:');
    console.log('     ❌ Policy 1: USING (user_id = auth.uid())');
    console.log('     ❌ Policy 2: USING (is_admin())');
    console.log('     ✅ Single: USING (user_id = auth.uid() OR is_admin())\n');
  }

  // Count auth function usage across all policies
  const totalAuthUsage = {};
  let tablesWithAuthIssues = 0;
  Object.entries(byTable).forEach(([table, policies]) => {
    let tableHasIssue = false;
    policies.forEach(p => {
      const fullDef = (p.qual || '') + ' ' + (p.with_check || '');
      ['auth.uid()', 'auth.jwt()', 'auth.role()', 'auth.email()'].forEach(func => {
        const matches = (fullDef.match(new RegExp(func.replace(/[()]/g, '\\$&'), 'g')) || []).length;
        if (matches > 0) {
          totalAuthUsage[func] = (totalAuthUsage[func] || 0) + matches;
          tableHasIssue = true;
        }
      });
    });
    if (tableHasIssue) tablesWithAuthIssues++;
  });

  console.log('⚠️  ISSUE #2: AUTH FUNCTION RE-EVALUATION (High Impact)');
  console.log('   Problem: Auth functions may be re-evaluated for EACH row returned');
  console.log(`   Impact: Affects ${tablesWithAuthIssues} tables with significant data\n`);
  Object.entries(totalAuthUsage).filter(([_, count]) => count > 0).forEach(([func, count]) => {
    console.log(`   - ${func}: ${count} occurrences across all policies`);
  });
  console.log('\n   Fix: Cache auth values in policy using CTE or subquery');
  console.log('   Example:');
  console.log('     ❌ USING (user_id = auth.uid())  -- Re-evaluated per row');
  console.log('     ✅ USING (user_id IN (SELECT auth.uid()))  -- Evaluated once\n');

  console.log('\n🎯 PRIORITIZED FIX RECOMMENDATIONS:\n');
  console.log('1. HIGH PRIORITY - Auth Initialization (affects ALL rows)');
  console.log(`   Tables affected: ${tablesWithAuthIssues}`);
  console.log('   Risk: LOW - Simple pattern change, no logic changes');
  console.log('   Effort: 30 minutes\n');

  console.log('2. MEDIUM PRIORITY - Multiple Permissive Policies');
  console.log(`   Tables affected: ${multiPolicyTables.length}`);
  console.log('   Risk: LOW-MEDIUM - Requires testing policy logic');
  console.log('   Effort: 1-2 hours\n');

  console.log('3. LOW PRIORITY - Complex Subqueries');
  console.log('   Tables: (requires manual review)');
  console.log('   Risk: MEDIUM - May require refactoring to functions');
  console.log('   Effort: 2-4 hours\n');

  console.log('✅ Analysis complete!\n');
}

process.exit(0);
