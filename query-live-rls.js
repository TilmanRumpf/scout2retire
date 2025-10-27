import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryLivePolicies() {
  console.log('\n🔍 QUERYING LIVE DATABASE RLS POLICIES\n');
  console.log('='.repeat(100));

  // Direct query to get policy statistics
  const { data, error } = await supabase
    .from('pg_policies')
    .select('schemaname, tablename, policyname, cmd, qual, with_check')
    .eq('schemaname', 'public');

  if (error) {
    console.error('❌ Error querying policies (trying alternative):', error.message);

    // Alternative: Count tables and general info
    const { count: tableCount } = await supabase
      .from('pg_tables')
      .select('*', { count: 'exact', head: true })
      .eq('schemaname', 'public');

    console.log(`\nFound ${tableCount} tables in public schema`);
    console.log('\n⚠️  Cannot query pg_policies view directly via SDK.');
    console.log('This is expected - RLS policies require direct SQL access.\n');
    return;
  }

  if (!data || data.length === 0) {
    console.log('No policies found or insufficient permissions');
    return;
  }

  // Analyze the live data
  const byTable = {};
  const authUidUsage = [];
  const helperUsage = [];

  data.forEach(policy => {
    const table = policy.tablename;
    if (!byTable[table]) {
      byTable[table] = [];
    }
    byTable[table].push(policy);

    const qual = policy.qual || '';
    const withCheck = policy.with_check || '';
    const fullDef = qual + ' ' + withCheck;

    if (fullDef.includes('auth.uid()')) {
      authUidUsage.push({ table, policy: policy.policyname, cmd: policy.cmd });
    }
    if (fullDef.includes('get_current_user_id()')) {
      helperUsage.push({ table, policy: policy.policyname, cmd: policy.cmd });
    }
  });

  console.log(`\n📊 LIVE DATABASE STATISTICS:\n`);
  console.log(`Total policies: ${data.length}`);
  console.log(`Tables with RLS: ${Object.keys(byTable).length}`);
  console.log(`Policies using auth.uid(): ${authUidUsage.length}`);
  console.log(`Policies using get_current_user_id(): ${helperUsage.length}`);

  console.log(`\n\n❌ POLICIES STILL USING auth.uid() DIRECTLY:\n`);
  const authByTable = {};
  authUidUsage.forEach(({ table, policy, cmd }) => {
    if (!authByTable[table]) authByTable[table] = [];
    authByTable[table].push({ policy, cmd });
  });

  Object.entries(authByTable)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([table, policies]) => {
      console.log(`\n${table} (${policies.length} policies):`);
      policies.forEach(({ policy, cmd }) => {
        console.log(`   - ${policy} (${cmd})`);
      });
    });

  if (helperUsage.length > 0) {
    console.log(`\n\n✅ POLICIES USING HELPER FUNCTION:\n`);
    const helperByTable = {};
    helperUsage.forEach(({ table, policy, cmd }) => {
      if (!helperByTable[table]) helperByTable[table] = [];
      helperByTable[table].push({ policy, cmd });
    });

    Object.entries(helperByTable)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([table, policies]) => {
        console.log(`\n${table} (${policies.length} policies):`);
        policies.forEach(({ policy, cmd }) => {
          console.log(`   ✓ ${policy} (${cmd})`);
        });
      });
  }
}

queryLivePolicies()
  .catch(console.error)
  .finally(() => process.exit(0));
