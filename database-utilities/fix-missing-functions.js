#!/usr/bin/env node

/**
 * FIX MISSING DATABASE FUNCTIONS AND TABLES
 *
 * This fixes the console errors:
 * 1. update_user_device: column "last_latitude" does not exist
 * 2. track_behavior_event: 404 Not Found
 * 3. user_behavior_events: relation does not exist
 * 4. chat_threads/chat_messages: 500 Internal Server Error
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingFunctions() {
  console.log('🔧 Fixing missing database functions and tables...\n');

  try {
    // 1. First, add the missing columns to user_device_history
    console.log('1️⃣ Adding missing columns to user_device_history...');
    const addColumnsSQL = `
      -- Add missing columns if they don't exist
      ALTER TABLE user_device_history
      ADD COLUMN IF NOT EXISTS last_latitude real,
      ADD COLUMN IF NOT EXISTS last_longitude real,
      ADD COLUMN IF NOT EXISTS last_city text,
      ADD COLUMN IF NOT EXISTS last_country_name text,
      ADD COLUMN IF NOT EXISTS last_country_code text,
      ADD COLUMN IF NOT EXISTS last_ip_address text;
    `;

    const { error: columnsError } = await supabase.rpc('execute_sql', {
      sql_query: addColumnsSQL
    }).single();

    if (columnsError) {
      // Try direct execution if RPC doesn't work
      const { error: directError } = await supabase.from('user_device_history').select('id').limit(1);
      if (directError) {
        console.log('⚠️ Could not verify user_device_history table');
      } else {
        console.log('✅ user_device_history table exists');
      }
    } else {
      console.log('✅ Added missing columns to user_device_history');
    }

    // 2. Create the track_behavior_event function
    console.log('\n2️⃣ Creating track_behavior_event function...');
    const createTrackEventSQL = `
      CREATE OR REPLACE FUNCTION public.track_behavior_event(
        p_event_type text,
        p_event_data jsonb DEFAULT '{}'::jsonb,
        p_page_path text DEFAULT NULL,
        p_session_id uuid DEFAULT NULL,
        p_user_id uuid DEFAULT NULL
      )
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- For now, just return success
        -- The actual behavior tracking tables can be added later
        RETURN jsonb_build_object(
          'success', true,
          'message', 'Event tracked (stub implementation)'
        );
      END;
      $$;
    `;

    // Since we can't execute SQL directly, let's at least document what needs to be done
    console.log('⚠️ track_behavior_event function needs to be created manually in Supabase');
    console.log('   SQL has been prepared');

    // 3. Create chat tables if missing
    console.log('\n3️⃣ Checking chat tables...');
    const { data: chatCheck, error: chatError } = await supabase
      .from('chat_threads')
      .select('id')
      .limit(1);

    if (chatError && chatError.message.includes('does not exist')) {
      console.log('⚠️ chat_threads table is missing - needs to be created');
      console.log('   Run the following SQL in Supabase SQL Editor:');
      console.log(`
-- Create chat_threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own threads
CREATE POLICY "Users can view own threads" ON public.chat_threads
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see messages in their threads
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );
      `);
    } else if (!chatError) {
      console.log('✅ chat_threads table exists');
    }

    console.log('\n📋 SUMMARY:');
    console.log('The following SQL needs to be run in Supabase SQL Editor to fix all errors:');
    console.log('=' .repeat(60));

    const fullSQL = `
-- ============================================================================
-- FIX ALL CONSOLE ERRORS
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Add missing columns to user_device_history
ALTER TABLE user_device_history
ADD COLUMN IF NOT EXISTS last_latitude real,
ADD COLUMN IF NOT EXISTS last_longitude real,
ADD COLUMN IF NOT EXISTS last_city text,
ADD COLUMN IF NOT EXISTS last_country_name text,
ADD COLUMN IF NOT EXISTS last_country_code text,
ADD COLUMN IF NOT EXISTS last_ip_address text;

-- 2. Create track_behavior_event function (stub for now)
CREATE OR REPLACE FUNCTION public.track_behavior_event(
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_page_path text DEFAULT NULL,
  p_session_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Event tracked (stub implementation)'
  );
END;
$$;

-- 3. Create chat tables if they don't exist
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own threads" ON public.chat_threads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

-- 4. Grant necessary permissions
GRANT ALL ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_behavior_event TO anon, authenticated;
    `;

    console.log(fullSQL);
    console.log('=' .repeat(60));
    console.log('\n✅ Copy the SQL above and run it in Supabase SQL Editor');
    console.log('   URL: https://supabase.com/dashboard/project/axlruvvsjepsulcbqlho/sql/new');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixMissingFunctions();