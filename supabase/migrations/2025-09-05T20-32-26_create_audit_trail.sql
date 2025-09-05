-- Audit Trail Table for Data Enrichment

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
  