#!/usr/bin/env node

/**
 * SETUP AUDIT TRAIL TABLE
 * Creates the town_data_audit table for tracking all enrichment changes
 * Provides complete history and rollback capability
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use service role key for DDL operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAuditTrail() {
  console.log('Setting up audit trail table...\n');
  
  // Create the audit table
  const createTableSQL = `
    -- Drop table if exists (for testing)
    -- DROP TABLE IF EXISTS town_data_audit CASCADE;
    
    -- Create audit trail table
    CREATE TABLE IF NOT EXISTS town_data_audit (
      id SERIAL PRIMARY KEY,
      town_id INTEGER REFERENCES towns(id) ON DELETE CASCADE,
      column_name TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      data_source TEXT,
      enrichment_method TEXT,
      cost_usd DECIMAL(10,6),
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      operator TEXT DEFAULT 'unified-enrichment',
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT,
      rollback_id INTEGER REFERENCES town_data_audit(id),
      batch_id TEXT
    );
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_audit_town_id ON town_data_audit(town_id);
    CREATE INDEX IF NOT EXISTS idx_audit_column ON town_data_audit(column_name);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON town_data_audit(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_batch ON town_data_audit(batch_id);
    CREATE INDEX IF NOT EXISTS idx_audit_success ON town_data_audit(success);
    
    -- Create view for recent changes
    CREATE OR REPLACE VIEW recent_enrichments AS
    SELECT 
      t.name as town_name,
      t.country,
      a.column_name,
      a.old_value,
      a.new_value,
      a.data_source,
      a.cost_usd,
      a.timestamp,
      a.success
    FROM town_data_audit a
    JOIN towns t ON a.town_id = t.id
    WHERE a.timestamp > NOW() - INTERVAL '7 days'
    ORDER BY a.timestamp DESC;
    
    -- Create summary view
    CREATE OR REPLACE VIEW enrichment_summary AS
    SELECT 
      column_name,
      COUNT(*) as total_updates,
      COUNT(DISTINCT town_id) as towns_updated,
      SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_updates,
      SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_updates,
      SUM(cost_usd) as total_cost,
      MIN(timestamp) as first_update,
      MAX(timestamp) as last_update
    FROM town_data_audit
    GROUP BY column_name
    ORDER BY total_updates DESC;
  `;
  
  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: createTableSQL
  });
  
  if (error) {
    // Try alternative approach without exec_sql
    console.log('exec_sql not available, trying direct approach...');
    
    // We'll need to create this via migration file instead
    const migrationContent = `-- Audit Trail Table for Data Enrichment
${createTableSQL}`;
    
    const fs = await import('fs/promises');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const migrationPath = `./supabase/migrations/${timestamp}_create_audit_trail.sql`;
    
    await fs.writeFile(migrationPath, migrationContent);
    console.log(`✅ Migration file created: ${migrationPath}`);
    console.log('Run "supabase db push" to apply the migration\n');
    
    return;
  }
  
  console.log('✅ Audit trail table created successfully!\n');
  
  // Test the table with a sample insert
  console.log('Testing audit trail with sample insert...');
  const { error: insertError } = await supabase
    .from('town_data_audit')
    .insert({
      town_id: 1,
      column_name: 'test_column',
      old_value: null,
      new_value: 'test_value',
      data_source: 'setup_test',
      enrichment_method: 'manual',
      cost_usd: 0,
      operator: 'setup-script',
      success: true
    });
  
  if (insertError) {
    console.log('❌ Test insert failed:', insertError.message);
  } else {
    console.log('✅ Test insert successful!');
    
    // Clean up test record
    const { error: deleteError } = await supabase
      .from('town_data_audit')
      .delete()
      .eq('data_source', 'setup_test');
    
    if (!deleteError) {
      console.log('✅ Test record cleaned up');
    }
  }
  
  // Show summary of what was created
  console.log('\n📊 Audit Trail Setup Complete:');
  console.log('- Table: town_data_audit');
  console.log('- View: recent_enrichments (last 7 days)');
  console.log('- View: enrichment_summary (column statistics)');
  console.log('- Indexes: town_id, column_name, timestamp, batch_id, success');
  
  console.log('\n💡 Usage Examples:');
  console.log('-- View recent enrichments:');
  console.log('SELECT * FROM recent_enrichments LIMIT 10;');
  console.log('\n-- View enrichment statistics:');
  console.log('SELECT * FROM enrichment_summary;');
  console.log('\n-- Find all changes for a specific town:');
  console.log("SELECT * FROM town_data_audit WHERE town_id = 123 ORDER BY timestamp DESC;");
  console.log('\n-- Rollback a specific change:');
  console.log("UPDATE towns SET column_name = old_value FROM town_data_audit WHERE ...");
}

// Helper function to query audit data
export async function queryAuditTrail(options = {}) {
  const { townId, columnName, dateFrom, limit = 100 } = options;
  
  let query = supabase
    .from('town_data_audit')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (townId) query = query.eq('town_id', townId);
  if (columnName) query = query.eq('column_name', columnName);
  if (dateFrom) query = query.gte('timestamp', dateFrom);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error querying audit trail:', error);
    return null;
  }
  
  return data;
}

// Helper function to rollback changes
export async function rollbackChanges(batchId) {
  console.log(`Rolling back batch: ${batchId}`);
  
  // Get all changes from this batch
  const { data: changes, error: fetchError } = await supabase
    .from('town_data_audit')
    .select('*')
    .eq('batch_id', batchId)
    .eq('success', true)
    .order('timestamp', { ascending: false });
  
  if (fetchError) {
    console.error('Error fetching changes:', fetchError);
    return false;
  }
  
  console.log(`Found ${changes.length} changes to rollback`);
  
  // Rollback each change
  let rollbackCount = 0;
  for (const change of changes) {
    const updateData = {};
    updateData[change.column_name] = change.old_value ? JSON.parse(change.old_value) : null;
    
    const { error: updateError } = await supabase
      .from('towns')
      .update(updateData)
      .eq('id', change.town_id);
    
    if (updateError) {
      console.error(`Failed to rollback town ${change.town_id}:`, updateError);
    } else {
      rollbackCount++;
      
      // Record the rollback
      await supabase.from('town_data_audit').insert({
        town_id: change.town_id,
        column_name: change.column_name,
        old_value: change.new_value,
        new_value: change.old_value,
        data_source: 'rollback',
        enrichment_method: 'rollback',
        operator: 'rollback-script',
        rollback_id: change.id,
        batch_id: `rollback_${batchId}`
      });
    }
  }
  
  console.log(`✅ Successfully rolled back ${rollbackCount}/${changes.length} changes`);
  return true;
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAuditTrail().catch(console.error);
}