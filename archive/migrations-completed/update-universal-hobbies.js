#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUniversalHobbies() {
    console.log('🔄 UPDATING UNIVERSAL HOBBIES');
    console.log('================================================================================');

    const sql = `
        UPDATE hobbies
        SET 
          category = CASE 
            WHEN name IN ('Creative Writing', 'Crochet', 'Crossword Puzzles', 'Drawing', 'Embroidery', 'Journaling', 'Jigsaw Puzzles') THEN 'interest'
            WHEN name IN ('Cooking Classes', 'Herb Gardening') THEN 'activity'
            ELSE category
          END,
          verification_method = 'universal',
          verification_query = NULL,
          verification_notes = CASE
            WHEN name = 'Creative Writing' THEN 'Writing possible anywhere. Online communities and workshops available.'
            WHEN name = 'Crochet' THEN 'Craft requiring yarn and hook. Can practice anywhere.'
            WHEN name = 'Crossword Puzzles' THEN 'Mental activity. Books, newspapers, apps available everywhere.'
            WHEN name = 'Drawing' THEN 'Art form requiring minimal supplies. Can practice anywhere.'
            WHEN name = 'Embroidery' THEN 'Needlework craft. Requires thread and fabric. Portable hobby.'
            WHEN name = 'Journaling' THEN 'Personal writing. Requires only pen and paper or digital device.'
            WHEN name = 'Jigsaw Puzzles' THEN 'Indoor activity. Puzzles available everywhere, online options too.'
            WHEN name = 'Herb Gardening' THEN 'Can grow herbs indoors or outdoors anywhere. Pots and windowsills work.'
            WHEN name = 'Genealogy' THEN 'Research hobby. Mostly online databases and records.'
            WHEN name = 'Digital Photography' THEN 'Digital cameras and phones available everywhere. Online sharing.'
            WHEN name = 'Film Appreciation' THEN 'Movies available via streaming everywhere. Online discussions.'
            WHEN name = 'Jazz Appreciation' THEN 'Music available via streaming. Online and local communities.'
            WHEN name = 'Jewelry Making' THEN 'Craft with basic tools and materials. Can practice anywhere.'
            ELSE 'Universal hobby available everywhere.'
          END
        WHERE name IN (
          'Creative Writing', 'Crochet', 'Crossword Puzzles', 'Drawing', 'Embroidery',
          'Journaling', 'Jigsaw Puzzles', 'Herb Gardening', 'Genealogy',
          'Digital Photography', 'Film Appreciation', 'Jazz Appreciation', 'Jewelry Making'
        )
        AND verification_method IS NULL;
    `;

    try {
        // Execute the update
        const { data, error, count } = await supabase.rpc('execute_sql_with_count', { 
            sql_query: sql 
        });

        if (error) {
            // Try alternative method if RPC doesn't exist
            console.log('RPC method failed, trying direct update...');
            
            // Update each hobby individually to get accurate count
            const hobbyNames = [
                'Creative Writing', 'Crochet', 'Crossword Puzzles', 'Drawing', 'Embroidery',
                'Journaling', 'Jigsaw Puzzles', 'Herb Gardening', 'Genealogy',
                'Digital Photography', 'Film Appreciation', 'Jazz Appreciation', 'Jewelry Making'
            ];

            let totalUpdated = 0;

            for (const hobbyName of hobbyNames) {
                let category = 'interest';
                if (['Cooking Classes', 'Herb Gardening'].includes(hobbyName)) {
                    category = 'activity';
                }

                let notes = 'Universal hobby available everywhere.';
                switch (hobbyName) {
                    case 'Creative Writing':
                        notes = 'Writing possible anywhere. Online communities and workshops available.';
                        break;
                    case 'Crochet':
                        notes = 'Craft requiring yarn and hook. Can practice anywhere.';
                        break;
                    case 'Crossword Puzzles':
                        notes = 'Mental activity. Books, newspapers, apps available everywhere.';
                        break;
                    case 'Drawing':
                        notes = 'Art form requiring minimal supplies. Can practice anywhere.';
                        break;
                    case 'Embroidery':
                        notes = 'Needlework craft. Requires thread and fabric. Portable hobby.';
                        break;
                    case 'Journaling':
                        notes = 'Personal writing. Requires only pen and paper or digital device.';
                        break;
                    case 'Jigsaw Puzzles':
                        notes = 'Indoor activity. Puzzles available everywhere, online options too.';
                        break;
                    case 'Herb Gardening':
                        notes = 'Can grow herbs indoors or outdoors anywhere. Pots and windowsills work.';
                        break;
                    case 'Genealogy':
                        notes = 'Research hobby. Mostly online databases and records.';
                        break;
                    case 'Digital Photography':
                        notes = 'Digital cameras and phones available everywhere. Online sharing.';
                        break;
                    case 'Film Appreciation':
                        notes = 'Movies available via streaming everywhere. Online discussions.';
                        break;
                    case 'Jazz Appreciation':
                        notes = 'Music available via streaming. Online and local communities.';
                        break;
                    case 'Jewelry Making':
                        notes = 'Craft with basic tools and materials. Can practice anywhere.';
                        break;
                }

                const { error: updateError, count: updateCount } = await supabase
                    .from('hobbies')
                    .update({
                        category: category,
                        verification_method: 'universal',
                        verification_query: null,
                        verification_notes: notes
                    })
                    .eq('name', hobbyName)
                    .is('verification_method', null);

                if (updateError) {
                    console.error(`❌ Error updating ${hobbyName}:`, updateError);
                } else {
                    if (updateCount && updateCount > 0) {
                        console.log(`✅ Updated: ${hobbyName}`);
                        totalUpdated += updateCount;
                    } else {
                        console.log(`⚠️ No update needed for: ${hobbyName} (already processed)`);
                    }
                }
            }

            console.log('================================================================================');
            console.log(`🎯 TOTAL RECORDS UPDATED: ${totalUpdated}`);
            console.log('================================================================================');

        } else {
            console.log(`✅ Updated ${count || data} records successfully`);
        }

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

// Run the update
updateUniversalHobbies().then(() => {
    console.log('✅ Universal hobbies update completed!');
    process.exit(0);
});