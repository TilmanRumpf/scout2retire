#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

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