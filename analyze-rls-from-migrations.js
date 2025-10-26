#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrationsDir = './supabase/migrations';

console.log('🔍 Analyzing RLS Policies from Migration Files...\n');

// Read all migration files
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`📁 Found ${files.length} migration files\n`);

// Parse all policies
const policies = [];
const authUsage = {
  'auth.uid()': [],
  'auth.role()': [],
  'auth.jwt()': [],
  'auth.email()': []
};

const multiPolicyTables = {};

files.forEach(file => {
  const content = readFileSync(join(migrationsDir, file), 'utf8');

  // Extract CREATE POLICY statements (simplified regex)
  const policyRegex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(\w+)\s+FOR\s+(\w+)[\s\S]*?USING\s*\(([\s\S]*?)\)(?:\s+WITH\s+CHECK\s*\(([\s\S]*?)\))?;/gi;

  let match;
  while ((match = policyRegex.exec(content)) !== null) {
    const [_, policyName, tableName, command, usingClause, withCheckClause] = match;

    policies.push({
      file,
      policyName,
      tableName,
      command,
      usingClause: usingClause?.trim(),
      withCheckClause: withCheckClause?.trim()
    });

    // Count auth functions
    const fullDef = (usingClause || '') + ' ' + (withCheckClause || '');
    Object.keys(authUsage).forEach(func => {
      const matches = (fullDef.match(new RegExp(func.replace(/[()]/g, '\\$&'), 'g')) || []).length;
      if (matches > 0) {
        authUsage[func].push({ tableName, policyName, matches });
      }
    });

    // Track multiple policies per table/command
    const key = `${tableName}.${command}`;
    multiPolicyTables[key] = (multiPolicyTables[key] || 0) + 1;
  }
});

console.log(`✅ Extracted ${policies.length} policies from migrations\n`);
console.log('='.repeat(100));

// Group by table
const byTable = {};
policies.forEach(p => {
  if (!byTable[p.tableName]) {
    byTable[p.tableName] = [];
  }
  byTable[p.tableName].push(p);
});

// Detailed analysis by table
console.log('\n📊 DETAILED ANALYSIS BY TABLE:\n');

Object.keys(byTable).sort().forEach(table => {
  const tablePolicies = byTable[table];
  console.log(`\n🗂️  TABLE: ${table}`);
  console.log(`   Total Policies: ${tablePolicies.length}`);

  // Group by command
  const cmdGroups = {};
  tablePolicies.forEach(p => {
    if (!cmdGroups[p.command]) cmdGroups[p.command] = [];
    cmdGroups[p.command].push(p);
  });

  // Show command breakdown
  console.log(`\n   📋 Policies by Command:`);
  Object.keys(cmdGroups).sort().forEach(cmd => {
    const count = cmdGroups[cmd].length;
    const warning = count > 1 ? ' ⚠️  MULTIPLE PERMISSIVE' : '';
    console.log(`      ${cmd}: ${count}${warning}`);
  });

  // Count auth patterns in this table
  const tableAuthCount = {};
  tablePolicies.forEach(p => {
    const fullDef = (p.usingClause || '') + ' ' + (p.withCheckClause || '');
    Object.keys(authUsage).forEach(func => {
      const matches = (fullDef.match(new RegExp(func.replace(/[()]/g, '\\$&'), 'g')) || []).length;
      if (matches > 0) {
        tableAuthCount[func] = (tableAuthCount[func] || 0) + matches;
      }
    });
  });

  if (Object.keys(tableAuthCount).length > 0) {
    console.log(`\n   🔐 Auth Function Usage:`);
    Object.entries(tableAuthCount).forEach(([func, count]) => {
      const severity = count > 3 ? ' ⚠️  CRITICAL' : count > 1 ? ' ⚠️  HIGH' : '';
      console.log(`      ${func}: ${count} occurrences${severity}`);
    });
  }

  // Check for performance red flags
  const redFlags = [];
  tablePolicies.forEach(p => {
    const fullDef = (p.usingClause || '') + ' ' + (p.withCheckClause || '');
    if (fullDef.match(/EXISTS\s*\(/i)) redFlags.push('EXISTS subquery');
    if (fullDef.match(/IN\s*\(\s*SELECT/i)) redFlags.push('IN (SELECT) subquery');
    if (fullDef.match(/JOIN/i)) redFlags.push('JOIN in policy');
  });

  if (redFlags.length > 0) {
    console.log(`\n   ⚡ Performance Red Flags:`);
    [...new Set(redFlags)].forEach(flag => {
      console.log(`      - ${flag}`);
    });
  }

  // Show sample policy
  if (tablePolicies.length > 0) {
    console.log(`\n   📝 Sample Policy: "${tablePolicies[0].policyName}"`);
    console.log(`      USING: ${tablePolicies[0].usingClause?.substring(0, 100)}...`);
  }
});

console.log('\n' + '='.repeat(100));
console.log('\n🎯 SUMMARY OF KEY ISSUES:\n');

// Issue #1: Auth function re-evaluation
console.log('⚠️  ISSUE #1: AUTH FUNCTION RE-EVALUATION (HIGH IMPACT)\n');
Object.entries(authUsage).forEach(([func, occurrences]) => {
  if (occurrences.length > 0) {
    const tables = [...new Set(occurrences.map(o => o.tableName))];
    console.log(`   ${func}: ${occurrences.length} total occurrences across ${tables.length} tables`);
    console.log(`   Tables: ${tables.slice(0, 10).join(', ')}${tables.length > 10 ? '...' : ''}`);
  }
});

console.log('\n   Problem: Auth functions evaluated for EACH row in result set');
console.log('   Impact: On tables with 100+ rows, can cause 100+ function calls');
console.log('   Example: Query returns 352 towns → auth.uid() called 352 times\n');

// Issue #2: Multiple permissive policies
const multiPolicyIssues = Object.entries(multiPolicyTables).filter(([_, count]) => count > 1);
console.log('⚠️  ISSUE #2: MULTIPLE PERMISSIVE POLICIES (MEDIUM IMPACT)\n');
console.log(`   Found ${multiPolicyIssues.length} table.command combinations with multiple policies\n`);
multiPolicyIssues.slice(0, 15).forEach(([key, count]) => {
  console.log(`   - ${key}: ${count} policies (evaluated with OR logic)`);
});
if (multiPolicyIssues.length > 15) {
  console.log(`   ... and ${multiPolicyIssues.length - 15} more`);
}

console.log('\n   Problem: Postgres must evaluate ALL permissive policies');
console.log('   Impact: 2 policies = 2x evaluation overhead per row\n');

console.log('\n🎯 EXAMPLE PROBLEMATIC PATTERNS:\n');

// Find worst offenders
const worstOffenders = [];
Object.entries(byTable).forEach(([table, policies]) => {
  let authCount = 0;
  let policyCount = policies.length;
  policies.forEach(p => {
    const fullDef = (p.usingClause || '') + ' ' + (p.withCheckClause || '');
    Object.keys(authUsage).forEach(func => {
      authCount += (fullDef.match(new RegExp(func.replace(/[()]/g, '\\$&'), 'g')) || []).length;
    });
  });
  if (authCount > 0) {
    worstOffenders.push({ table, authCount, policyCount });
  }
});

worstOffenders.sort((a, b) => b.authCount - a.authCount).slice(0, 5).forEach(({ table, authCount, policyCount }) => {
  console.log(`\n📍 ${table}`);
  console.log(`   - ${policyCount} policies`);
  console.log(`   - ${authCount} auth function calls`);
  console.log(`   - Impact per query: ${authCount} × row_count function evaluations`);

  const tablePolicies = byTable[table];
  const sample = tablePolicies[0];
  if (sample.usingClause) {
    console.log(`   - Sample: ${sample.usingClause.substring(0, 80)}...`);
  }
});

console.log('\n\n🎯 RECOMMENDED FIXES (Prioritized by Risk/Effort):\n');

console.log('1️⃣  FIX AUTH INITIALIZATION ISSUES (30 min, LOW RISK)\n');
console.log('   Pattern: Change auth.uid() to cached version');
console.log('   Before: USING (user_id = auth.uid())');
console.log('   After:  USING (user_id IN (SELECT auth.uid()))\n');
console.log('   OR create helper function:');
console.log('   CREATE FUNCTION get_current_user_id() RETURNS UUID AS $$');
console.log('     SELECT auth.uid()');
console.log('   $$ LANGUAGE SQL STABLE;  -- STABLE = cached within transaction\n');
console.log('   Then: USING (user_id = get_current_user_id())\n');

console.log('2️⃣  CONSOLIDATE MULTIPLE PERMISSIVE POLICIES (1-2 hours, LOW-MEDIUM RISK)\n');
console.log('   Pattern: Combine with OR inside single policy');
console.log('   Before:');
console.log('     Policy 1: USING (user_id = auth.uid())');
console.log('     Policy 2: USING (is_public = true)');
console.log('   After:');
console.log('     Single Policy: USING (user_id = auth.uid() OR is_public = true)\n');

console.log('3️⃣  OPTIMIZE SUBQUERIES (2-4 hours, MEDIUM RISK)\n');
console.log('   Pattern: Replace expensive EXISTS with function or materialized check');
console.log('   Requires: Case-by-case analysis, testing\n');

console.log('\n✅ Analysis complete!\n');
console.log('📊 Next steps:');
console.log('   1. Review the worst offenders above');
console.log('   2. Start with auth initialization fixes (quick wins)');
console.log('   3. Test each fix in staging before production');
console.log('   4. Monitor query performance after each change\n');

process.exit(0);
