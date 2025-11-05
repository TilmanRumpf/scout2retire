import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  console.log('📊 Creating data_verification_dismissals table...\n');

  const sql = `
-- Create table for tracking dismissed data verification issues
CREATE TABLE IF NOT EXISTS public.data_verification_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Which town and field has the dismissed issue
    town_id UUID NOT NULL REFERENCES public.towns(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,

    -- What type of issue was dismissed
    issue_type TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    dismissed_value JSONB,

    -- Who dismissed it and when
    dismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dismissed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Why was it dismissed (required explanation)
    dismissal_comment TEXT NOT NULL,

    -- Allow un-dismissing if needed
    undismissed_at TIMESTAMPTZ,
    undismissed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    undismissal_comment TEXT,

    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure we don't have duplicate dismissals for same issue
    UNIQUE(town_id, field_name, issue_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dismissals_town ON public.data_verification_dismissals(town_id);
CREATE INDEX IF NOT EXISTS idx_dismissals_field ON public.data_verification_dismissals(field_name);
CREATE INDEX IF NOT EXISTS idx_dismissals_active ON public.data_verification_dismissals(town_id, field_name)
    WHERE undismissed_at IS NULL;

-- Enable RLS
ALTER TABLE public.data_verification_dismissals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view dismissals" ON public.data_verification_dismissals;
DROP POLICY IF EXISTS "Authenticated users can dismiss issues" ON public.data_verification_dismissals;
DROP POLICY IF EXISTS "Users can undismiss their own dismissals" ON public.data_verification_dismissals;

-- Policies: All authenticated users can read dismissals
CREATE POLICY "Anyone can view dismissals"
    ON public.data_verification_dismissals
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users can dismiss issues
CREATE POLICY "Authenticated users can dismiss issues"
    ON public.data_verification_dismissals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = dismissed_by);

-- Only the person who dismissed can undismiss
CREATE POLICY "Users can undismiss their own dismissals"
    ON public.data_verification_dismissals
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = dismissed_by);
  `;

  // Execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Table created successfully!');
  console.log('\n📝 Table structure:');
  console.log('   - town_id, field_name (what issue)');
  console.log('   - issue_type, issue_description (why flagged)');
  console.log('   - dismissed_by, dismissed_at (who & when)');
  console.log('   - dismissal_comment (required explanation)');
  console.log('   - undismissed_at (if later undismissed)');
}

createTable();
