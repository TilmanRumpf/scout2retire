// Apply fix for regional_inspirations RLS policy to allow admins to see unpublished
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

console.log('\n🔧 FIXING REGIONAL_INSPIRATIONS RLS POLICY\n');

const sql = `
-- Fix regional_inspirations RLS policy to allow admins to see unpublished inspirations
-- Public users: only see is_active = true
-- Admins: see ALL inspirations (published and unpublished)

DROP POLICY IF EXISTS "regional_inspirations_unified_select" ON public.regional_inspirations;

CREATE POLICY "regional_inspirations_select_with_admin"
ON public.regional_inspirations FOR SELECT TO authenticated
USING (
  is_active = true  -- Public users see only active inspirations
  OR
  -- Admins see ALL inspirations (including unpublished)
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = users.id
    AND users.admin_role IN ('admin', 'executive_admin', 'auditor')
  )
);
`;

console.log('📋 Executing SQL:\n');
console.log(sql);
console.log('\n');

console.log('⚠️  COPY THE SQL ABOVE AND RUN IT IN SUPABASE DASHBOARD');
console.log('    SQL Editor → New Query → Paste → Run\n');
console.log('Or use: supabase migration up\n');
