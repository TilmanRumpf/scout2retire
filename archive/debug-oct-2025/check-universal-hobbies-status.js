#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUniversalHobbiesStatus() {
    console.log('🔍 CHECKING UNIVERSAL HOBBIES STATUS');
    console.log('================================================================================');

    const hobbyNames = [
        'Creative Writing', 'Crochet', 'Crossword Puzzles', 'Drawing', 'Embroidery',
        'Journaling', 'Jigsaw Puzzles', 'Herb Gardening', 'Genealogy',
        'Digital Photography', 'Film Appreciation', 'Jazz Appreciation', 'Jewelry Making'
    ];

    try {
        const { data: hobbies, error } = await supabase
            .from('hobbies')
            .select('name, category, verification_method, verification_notes')
            .in('name', hobbyNames)
            .order('name');

        if (error) {
            console.error('❌ Error fetching hobbies:', error);
            return;
        }

        console.log(`📊 Found ${hobbies.length} hobbies:`);
        console.log('================================================================================');

        let processedCount = 0;
        let unprocessedCount = 0;

        for (const hobby of hobbies) {
            const isProcessed = hobby.verification_method !== null;
            if (isProcessed) {
                processedCount++;
                console.log(`✅ ${hobby.name}`);
                console.log(`   Category: ${hobby.category}`);
                console.log(`   Method: ${hobby.verification_method}`);
                console.log(`   Notes: ${hobby.verification_notes || 'None'}`);
            } else {
                unprocessedCount++;
                console.log(`⚠️ ${hobby.name} - NOT PROCESSED`);
                console.log(`   Category: ${hobby.category}`);
            }
            console.log('   ---');
        }

        console.log('================================================================================');
        console.log(`📈 SUMMARY:`);
        console.log(`   ✅ Processed: ${processedCount}`);
        console.log(`   ⚠️ Unprocessed: ${unprocessedCount}`);
        console.log(`   📊 Total: ${hobbies.length}`);
        console.log('================================================================================');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

// Run the check
checkUniversalHobbiesStatus().then(() => {
    console.log('✅ Status check completed!');
    process.exit(0);
});