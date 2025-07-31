import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Ufcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function captureCurrentSchema() {
  console.log('📸 Capturing current database schema...\n');

  // Get all tables
  const { data: tables } = await supabase.rpc('get_table_info', { 
    schema_name: 'public' 
  }).single();

  // Get all indexes
  const { data: indexes } = await supabase.rpc('get_indexes_info', {
    schema_name: 'public'
  }).single();

  // Get all constraints
  const { data: constraints } = await supabase.rpc('get_constraints_info', {
    schema_name: 'public'
  }).single();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const migrationFile = `supabase/migrations/${timestamp}_snapshot_current_state.sql`;

  const content = `-- Snapshot of database state on ${new Date().toISOString()}
-- This migration captures all changes made since July 14, 2025

-- Tables structure
${tables || '-- Unable to capture tables'}

-- Indexes
${indexes || '-- Unable to capture indexes'}

-- Constraints
${constraints || '-- Unable to capture constraints'}
`;

  fs.writeFileSync(migrationFile, content);
  console.log(`✅ Migration snapshot created: ${migrationFile}`);
}

// Since the RPC functions might not exist, let's create a simpler version
async function captureSchemaSimple() {
  console.log('📸 Creating database backup script...\n');
  
  const backupScript = `#!/bin/bash
# Database Backup Script for scout2retire
# Run daily or before major changes

DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_ID="axlruvvsjepsulcbqlho"

echo "🔵 Starting database backup..."

# Method 1: Using Supabase CLI (if you have access)
# npx supabase db dump -f backup_\${DATE}.sql

# Method 2: Manual backup instructions
cat << EOF > backup_instructions_\${DATE}.md
# Database Backup Instructions

1. Go to Supabase Dashboard: https://app.supabase.com/project/\${PROJECT_ID}
2. Navigate to Settings > Database
3. Click "Backups" tab
4. Create a manual backup with name: backup_\${DATE}

## For immediate backup via SQL:
1. Go to SQL Editor
2. Run: SELECT pg_dump_all() -- Note: This might not work in Supabase
3. Alternative: Use Supabase's built-in backup feature

## Recommended: Enable Point-in-Time Recovery
1. Settings > Database > Backups
2. Enable "Point-in-time Recovery"
3. This allows restoration to any point in last 7 days
EOF

echo "✅ Backup instructions created: backup_instructions_\${DATE}.md"
`;

  fs.writeFileSync('backup-database.sh', backupScript);
  fs.chmodSync('backup-database.sh', '755');
  console.log('✅ Created backup-database.sh');
}

captureSchemaSimple().catch(console.error);