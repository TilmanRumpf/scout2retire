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

async function getAllColumns() {
  console.log('📊 Fetching all column names from towns table...\n');

  try {
    // Get one town with all columns
    const { data, error } = await supabase
      .from('towns')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    const columns = Object.keys(data).sort();

    console.log(`✅ Found ${columns.length} columns in towns table:\n`);
    columns.forEach((col, index) => {
      console.log(`${String(index + 1).padStart(3, ' ')}. ${col}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

getAllColumns().catch(console.error);
