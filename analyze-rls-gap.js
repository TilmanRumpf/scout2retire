#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrationsDir = './supabase/migrations';

console.log('\n🔍 ANALYZING RLS OPTIMIZATION GAP\n');
console.log('='.repeat(100));

// Read all migration files
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

// Parse ALL policies from migrations
const allPolicies = [];
files.forEach(file => {
  const content = readFileSync(join(migrationsDir, file), 'utf8');
  const policyRegex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(\w+)\s+FOR\s+(\w+)[\s\S]*?USING\s*\(([\s\S]*?)\)(?:\s+WITH\s+CHECK\s*\(([\s\S]*?)\))?;/gi;
  
  let match;
  while ((match = policyRegex.exec(content)) !== null) {
    const [_, policyName, tableName, command, usingClause, withCheckClause] = match;
    allPolicies.push({
      file,
      policyName,
      tableName,
      command,
      usingClause: usingClause?.trim(),
      withCheckClause: withCheckClause?.trim()
    });
  }
});

// Read the optimization migration file
const optimizationFile = readFileSync(
  join(migrationsDir, '20251103_rls_optimization_safe.sql'),
  'utf8'
);

// Tables mentioned in optimization file
const optimizedTables = new Set([
  'notifications',
  'chat_messages',
  'group_chat_members',
  'scotty_conversations',
  'scotty_messages',
  'scotty_chat_usage',
  'thread_read_status',
  'discovery_views'
]);

// Analyze each table
const tableAnalysis = {};
allPolicies.forEach(policy => {
  const table = policy.tableName;
  if (!tableAnalysis[table]) {
    tableAnalysis[table] = {
      totalPolicies: 0,
      authUidCount: 0,
      getHelperCount: 0,
      isOptimized: optimizedTables.has(table),
      policies: []
    };
  }
  
  tableAnalysis[table].totalPolicies++;
  tableAnalysis[table].policies.push(policy);
  
  const fullDef = (policy.usingClause || '') + ' ' + (policy.withCheckClause || '');
  const authUidMatches = (fullDef.match(/auth\.uid\(\)/g) || []).length;
  const helperMatches = (fullDef.match(/get_current_user_id\(\)/g) || []).length;
  
  tableAnalysis[table].authUidCount += authUidMatches;
  tableAnalysis[table].getHelperCount += helperMatches;
});

// Categorize tables
const needsOptimization = [];
const alreadyOptimized = [];
const noAuthNeeded = [];

Object.entries(tableAnalysis).forEach(([table, data]) => {
  if (data.authUidCount > 0) {
    needsOptimization.push({ table, ...data });
  } else if (data.getHelperCount > 0 || data.isOptimized) {
    alreadyOptimized.push({ table, ...data });
  } else {
    noAuthNeeded.push({ table, ...data });
  }
});

// Sort by impact (auth calls × policies)
needsOptimization.sort((a, b) => (b.authUidCount * b.totalPolicies) - (a.authUidCount * a.totalPolicies));

console.log('\n📊 OVERALL STATISTICS:\n');
console.log(`Total tables with RLS: ${Object.keys(tableAnalysis).length}`);
console.log(`Tables needing optimization: ${needsOptimization.length} ❌`);
console.log(`Tables already optimized: ${alreadyOptimized.length} ✅`);
console.log(`Tables without auth checks: ${noAuthNeeded.length} ℹ️`);

const totalAuthCalls = needsOptimization.reduce((sum, t) => sum + t.authUidCount, 0);
console.log(`\nTotal auth.uid() calls to fix: ${totalAuthCalls}`);

console.log('\n\n🔴 TABLES STILL NEEDING OPTIMIZATION (${needsOptimization.length} tables):\n');
console.log('='.repeat(100));

needsOptimization.forEach(({ table, totalPolicies, authUidCount, isOptimized, policies }) => {
  const impact = authUidCount * totalPolicies;
  const priority = impact > 10 ? '🔥 CRITICAL' : impact > 5 ? '⚠️  HIGH' : '⚡ MEDIUM';
  
  console.log(`\n${priority} - ${table}`);
  console.log(`   Policies: ${totalPolicies}`);
  console.log(`   auth.uid() calls: ${authUidCount}`);
  console.log(`   Impact score: ${impact} (calls × policies)`);
  console.log(`   Mentioned in optimization file: ${isOptimized ? 'YES (but still has auth.uid())' : 'NO'}`);
  
  // Show sample policy
  const samplePolicy = policies[0];
  console.log(`   Sample: "${samplePolicy.policyName}"`);
  const sampleClause = samplePolicy.usingClause?.substring(0, 80) || '';
  console.log(`   USING: ${sampleClause}${sampleClause.length >= 80 ? '...' : ''}`);
});

console.log('\n\n✅ TABLES ALREADY OPTIMIZED (${alreadyOptimized.length} tables):\n');
console.log('='.repeat(100));

alreadyOptimized.forEach(({ table, totalPolicies, getHelperCount, isOptimized }) => {
  console.log(`✓ ${table}`);
  console.log(`   Policies: ${totalPolicies}`);
  console.log(`   Uses get_current_user_id(): ${getHelperCount > 0 ? 'YES' : 'N/A'}`);
  console.log(`   In optimization migration: ${isOptimized ? 'YES' : 'NO'}`);
  console.log('');
});

console.log('\nℹ️  TABLES WITHOUT AUTH CHECKS (${noAuthNeeded.length} tables):\n');
console.log('='.repeat(100));
console.log('These likely use other authorization methods (admin functions, public access, etc.)\n');
noAuthNeeded.forEach(({ table, totalPolicies }) => {
  console.log(`   ${table} (${totalPolicies} policies)`);
});

console.log('\n\n🎯 PRIORITIZED ACTION PLAN:\n');
console.log('='.repeat(100));

const critical = needsOptimization.filter(t => (t.authUidCount * t.totalPolicies) > 10);
const high = needsOptimization.filter(t => {
  const impact = t.authUidCount * t.totalPolicies;
  return impact > 5 && impact <= 10;
});
const medium = needsOptimization.filter(t => (t.authUidCount * t.totalPolicies) <= 5);

if (critical.length > 0) {
  console.log(`\n🔥 CRITICAL PRIORITY (Impact > 10):\n`);
  critical.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.table} (${t.authUidCount} calls × ${t.totalPolicies} policies = ${t.authUidCount * t.totalPolicies} impact)`);
  });
}

if (high.length > 0) {
  console.log(`\n⚠️  HIGH PRIORITY (Impact 6-10):\n`);
  high.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.table} (${t.authUidCount} calls × ${t.totalPolicies} policies = ${t.authUidCount * t.totalPolicies} impact)`);
  });
}

if (medium.length > 0) {
  console.log(`\n⚡ MEDIUM PRIORITY (Impact ≤ 5):\n`);
  medium.forEach((t, i) => {
    console.log(`   ${i+1}. ${t.table} (${t.authUidCount} calls × ${t.totalPolicies} policies = ${t.authUidCount * t.totalPolicies} impact)`);
  });
}

console.log(`\n\n📋 NEXT STEPS:\n`);
console.log(`1. Fix CRITICAL tables first (${critical.length} tables)`);
console.log(`2. Then fix HIGH priority (${high.length} tables)`);
console.log(`3. Medium priority can wait (${medium.length} tables)`);
console.log(`\nEstimated time: ${critical.length * 15 + high.length * 10 + medium.length * 5} minutes`);
console.log(`Expected performance gain: ${Math.round((totalAuthCalls / (totalAuthCalls + 1)) * 100)}% reduction in auth checks\n`);

process.exit(0);
