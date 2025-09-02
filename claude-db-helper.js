#!/usr/bin/env node

// CLAUDE CODE DATABASE HELPER - COMPREHENSIVE USER DATA INVESTIGATION
// This is the CORRECT way to execute SQL against the ONLINE Supabase instance
// Modified to investigate ALL user data for tobiasrumpf@gmx.de

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

const TOBIAS_EMAIL = 'tobiasrumpf@gmx.de';
const TOBIAS_USER_ID = 'd1039857-71e2-4562-86aa-1f0b4a0c17c8';

async function runQueries() {
  console.log('🔧 FIXING BATCH 15 HOBBIES WITH SENSIBLE CLASSIFICATIONS');
  console.log('=' .repeat(80));
  console.log('Updating Sudoku, Surfing, Swimming, Swimming Laps, Tai Chi, Tango, Tennis, Theater, Travel Planning, Trivia Nights');
  console.log('=' .repeat(80));
  console.log('');

  try {
    const hobbiesUpdates = [
      {
        name: 'Sudoku',
        updates: {
          category: 'interest',
          verification_method: 'universal',
          is_universal: true,
          verification_query: null,
          verification_notes: 'Number puzzles available in books, newspapers, apps. Can solve anywhere. No equipment needed.',
          required_conditions: null
        }
      },
      {
        name: 'Tai Chi',
        updates: {
          category: 'activity',
          verification_method: 'universal',
          is_universal: true,
          verification_query: null,
          verification_notes: 'Gentle martial art practiced anywhere. Online videos, apps teach forms. Parks and classes enhance.',
          required_conditions: null
        }
      },
      {
        name: 'Travel Planning',
        updates: {
          category: 'interest',
          verification_method: 'universal',
          is_universal: true,
          verification_query: null,
          verification_notes: 'Research and plan trips anywhere. Online tools, guides, booking sites. Travel agents enhance.',
          required_conditions: null
        }
      },
      {
        name: 'Tango',
        updates: {
          category: 'activity',
          verification_method: 'universal',
          is_universal: true,
          verification_query: null,
          verification_notes: 'Can learn basic steps at home with videos. Partner dancing. Milongas and classes enhance.',
          required_conditions: null
        }
      },
      {
        name: 'Surfing',
        updates: {
          verification_query: 'Find surf breaks, surf schools, or suitable ocean conditions for surfing near {town}',
          verification_notes: 'Requires ocean waves and surfboards. Coastal areas with breaks. Surf schools teach beginners.',
          required_conditions: null
        }
      },
      {
        name: 'Swimming',
        updates: {
          verification_query: 'Find swimming pools, beaches, lakes, or aquatic centers in {town}',
          verification_notes: 'Requires water access. Pools, beaches, lakes. Most towns have public pools.',
          required_conditions: null
        }
      },
      {
        name: 'Swimming Laps',
        updates: {
          verification_query: 'Find lap pools, aquatic centers, or gyms with pools for lap swimming in {town}',
          verification_notes: 'Requires lap pool access. Gyms, YMCAs, aquatic centers. Lane swimming times vary.',
          required_conditions: null
        }
      },
      {
        name: 'Tennis',
        updates: {
          verification_query: 'Find tennis courts, clubs, or recreation centers with tennis facilities in {town}',
          verification_notes: 'Requires courts and equipment. Public parks, clubs, schools often have courts.',
          required_conditions: null
        }
      },
      {
        name: 'Theater',
        updates: {
          category: 'interest',
          verification_query: 'Find theaters, playhouses, or performing arts venues in {town}',
          verification_notes: 'Live performances at local venues. Community theaters, professional stages vary by city.',
          required_conditions: null
        }
      },
      {
        name: 'Trivia Nights',
        updates: {
          verification_query: 'Find bars, restaurants, or venues hosting trivia nights in {town}',
          verification_notes: 'Pub quiz events at bars, restaurants. Weekly schedules vary. Social team activity.',
          required_conditions: null
        }
      }
    ];

    let updatedCount = 0;
    let errorCount = 0;

    for (const hobbyUpdate of hobbiesUpdates) {
      console.log(`\n🔧 Updating ${hobbyUpdate.name}...`);
      
      const { data, error } = await supabase
        .from('hobbies')
        .update(hobbyUpdate.updates)
        .eq('name', hobbyUpdate.name)
        .select();

      if (error) {
        console.log(`❌ Error updating ${hobbyUpdate.name}: ${error.message}`);
        errorCount++;
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${hobbyUpdate.name} successfully`);
        updatedCount++;
      } else {
        console.log(`⚠️ No rows updated for ${hobbyUpdate.name} (hobby not found?)`);
        errorCount++;
      }
    }

    console.log(`\n📊 UPDATE SUMMARY:`);
    console.log(`   Successful updates: ${updatedCount}`);
    console.log(`   Errors/Not found: ${errorCount}`);
    console.log(`   Total attempted: ${hobbiesUpdates.length}`);

    // Verify the updates
    console.log(`\n🔍 VERIFYING BATCH 15 UPDATES:`);
    console.log('=' .repeat(80));
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('hobbies')
      .select('name, category, verification_method, is_universal, verification_notes')
      .in('name', hobbiesUpdates.map(h => h.name))
      .order('name');

    if (verifyError) {
      console.log('❌ Error verifying updates:', verifyError.message);
      return;
    }

    verifyData.forEach(hobby => {
      console.log(`\n${hobby.name}:`);
      console.log(`   Category: ${hobby.category || 'NULL'}`);
      console.log(`   Method: ${hobby.verification_method || 'NULL'}`);
      console.log(`   Universal: ${hobby.is_universal ? 'YES' : 'NO'}`);
      console.log(`   Notes: ${hobby.verification_notes ? `${hobby.verification_notes.substring(0, 60)}...` : 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the queries
runQueries().catch(console.error);