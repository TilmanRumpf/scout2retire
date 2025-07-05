import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRetirementDataStructure() {
  console.log('Checking retirement data structure for Tilman...\n');

  try {
    // Get the specific user's data
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', '83d285b2-b21b-4d13-a1a1-6d51b6733d52');

    if (error) {
      console.error('Error fetching data:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No onboarding data found for this user');
      return;
    }

    const record = data[0];
    console.log('Found onboarding record');
    console.log('current_status structure:', JSON.stringify(record.current_status, null, 2));
    
    const timeline = record.current_status?.retirement_timeline;
    if (timeline) {
      console.log('\nRetirement timeline:');
      console.log('- status:', timeline.status);
      console.log('- target_year:', timeline.target_year, typeof timeline.target_year);
      console.log('- target_month:', timeline.target_month, typeof timeline.target_month);
      console.log('- target_day:', timeline.target_day, typeof timeline.target_day);
      console.log('- flexibility:', timeline.flexibility);
      
      // Check if month is stored as a string or missing
      if (timeline.target_month === undefined || timeline.target_month === null) {
        console.log('\n⚠️  target_month is missing!');
        
        // Fix it by setting target_month to 1
        console.log('\nFixing by setting target_month to 1...');
        
        const updatedCurrentStatus = {
          ...record.current_status,
          retirement_timeline: {
            ...timeline,
            target_month: 1
          }
        };
        
        const { error: updateError } = await supabase
          .from('onboarding_responses')
          .update({ current_status: updatedCurrentStatus })
          .eq('id', record.id);
          
        if (updateError) {
          console.error('Error updating:', updateError);
        } else {
          console.log('✅ Successfully added target_month = 1');
          
          // Verify the fix
          const { data: verifyData } = await supabase
            .from('onboarding_responses')
            .select('current_status')
            .eq('id', record.id);
            
          console.log('\nUpdated retirement_timeline:', 
            JSON.stringify(verifyData[0].current_status.retirement_timeline, null, 2));
        }
      } else {
        console.log('\n✅ target_month already exists with value:', timeline.target_month);
      }
    } else {
      console.log('\nNo retirement_timeline found in current_status');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkRetirementDataStructure();