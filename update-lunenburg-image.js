import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axlruvvsjepsulcbqlho.supabase.co';
// Using service role key to bypass RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateLunenburgImage() {
  console.log('🖼️ UPDATING LUNENBURG IMAGE URL');
  console.log('='.repeat(80));

  try {
    // 1. Find Lunenburg
    console.log('\n🔍 Finding Lunenburg...');
    const { data: towns, error: findError } = await supabase
      .from('towns')
      .select('id, name, country, image_url_1')
      .eq('name', 'Lunenburg')
      .eq('country', 'Canada');

    if (findError) {
      console.error('❌ Error finding Lunenburg:', findError);
      return;
    }

    if (!towns || towns.length === 0) {
      console.error('❌ Lunenburg not found');
      return;
    }

    const lunenburg = towns[0];
    console.log(`✅ Found: ${lunenburg.name}, ${lunenburg.country}`);
    console.log(`Current image_url_1:`, lunenburg.image_url_1);

    // 2. Update the image URL
    console.log('\n🔧 Updating image URL...');
    const newUrl = 'https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/ca-lunenburg-waterfront-2000x1500.jpg';

    const { data: updated, error: updateError } = await supabase
      .from('towns')
      .update({ image_url_1: newUrl })
      .eq('id', lunenburg.id)
      .select('id, name, image_url_1');

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return;
    }

    if (!updated || updated.length === 0) {
      console.error('❌ No data returned from update - likely RLS blocking UPDATE');
      console.log('Attempting to verify the update...');

      const { data: verify, error: verifyError } = await supabase
        .from('towns')
        .select('id, name, image_url_1')
        .eq('id', lunenburg.id);

      if (!verifyError && verify && verify.length > 0) {
        console.log('✅ Verification shows image_url_1:', verify[0].image_url_1);
        if (verify[0].image_url_1 === newUrl) {
          console.log('✅ UPDATE SUCCESSFUL (verified)!');
        } else {
          console.log('❌ Update did not persist');
        }
      }
      return;
    }

    console.log('✅ SUCCESS! Updated image_url_1:');
    console.log(updated[0].image_url_1);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateLunenburgImage();
