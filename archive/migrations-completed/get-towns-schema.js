#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function getTownsSchema() {
  console.log('🔍 Getting towns table schema with 170+ columns...\n');

  try {
    // Get a sample row to see all columns
    const { data: sampleRow, error } = await supabase
      .from('towns')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (sampleRow && sampleRow.length > 0) {
      const columns = Object.keys(sampleRow[0]);
      console.log(`✅ Found ${columns.length} columns in towns table:\n`);
      
      // Categorize columns
      const categories = {
        'REGION & GEOGRAPHY': [],
        'CLIMATE & WEATHER': [],
        'CULTURE & LIFESTYLE': [],
        'HOBBIES & ACTIVITIES': [],
        'ADMIN & HEALTHCARE': [],
        'COSTS & ECONOMICS': [],
        'OTHER': []
      };

      columns.forEach(col => {
        const lower = col.toLowerCase();
        if (lower.includes('region') || lower.includes('country') || lower.includes('state') || 
            lower.includes('latitude') || lower.includes('longitude') || lower.includes('elevation') ||
            lower.includes('coastal') || lower.includes('mountain') || lower.includes('geographic')) {
          categories['REGION & GEOGRAPHY'].push(col);
        } else if (lower.includes('climate') || lower.includes('temp') || lower.includes('rain') || 
                   lower.includes('humid') || lower.includes('sun') || lower.includes('weather') ||
                   lower.includes('season') || lower.includes('winter') || lower.includes('summer')) {
          categories['CLIMATE & WEATHER'].push(col);
        } else if (lower.includes('culture') || lower.includes('museum') || lower.includes('event') ||
                   lower.includes('nightlife') || lower.includes('restaurant') || lower.includes('cuisine') ||
                   lower.includes('language') || lower.includes('expat') || lower.includes('english')) {
          categories['CULTURE & LIFESTYLE'].push(col);
        } else if (lower.includes('sport') || lower.includes('golf') || lower.includes('beach') ||
                   lower.includes('hiking') || lower.includes('activity') || lower.includes('outdoor') ||
                   lower.includes('water') || lower.includes('hobby') || lower.includes('recreation')) {
          categories['HOBBIES & ACTIVITIES'].push(col);
        } else if (lower.includes('visa') || lower.includes('healthcare') || lower.includes('safety') ||
                   lower.includes('hospital') || lower.includes('doctor') || lower.includes('tax') ||
                   lower.includes('residency') || lower.includes('admin')) {
          categories['ADMIN & HEALTHCARE'].push(col);
        } else if (lower.includes('cost') || lower.includes('price') || lower.includes('rent') ||
                   lower.includes('budget') || lower.includes('economy') || lower.includes('income') ||
                   lower.includes('usd') || lower.includes('monthly')) {
          categories['COSTS & ECONOMICS'].push(col);
        } else {
          categories['OTHER'].push(col);
        }
      });

      // Print categorized columns
      Object.entries(categories).forEach(([category, cols]) => {
        if (cols.length > 0) {
          console.log(`\n=== ${category} (${cols.length} columns) ===`);
          cols.sort().forEach(col => {
            const value = sampleRow[0][col];
            const preview = value !== null ? 
              (typeof value === 'string' ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` : value) : 
              'null';
            console.log(`  - ${col}: ${preview}`);
          });
        }
      });

      console.log(`\n📊 Total columns: ${columns.length}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getTownsSchema();