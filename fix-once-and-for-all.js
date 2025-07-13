import { createClient } from '@supabase/supabase-js';

// Use service role key for full access
const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.1LGk_ib8U3b7mqMmmc5aLdW4DNa5pbG6xXMFqSuPESI',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function fixOnceAndForAll() {
  console.log('🔧 FIXING MEDELLIN AND ST TROPEZ ONCE AND FOR ALL\n');
  
  try {
    // Get ALL files from bucket with service role access
    const { data: files, error } = await supabase
      .storage
      .from('town-images')
      .list('', { limit: 1000 });
    
    if (error) {
      console.error('Error accessing bucket:', error);
      return;
    }
    
    console.log(`Found ${files.length} files in bucket\n`);
    
    // Find files containing medellin or tropez
    const medellinFiles = files.filter(f => 
      f.name.toLowerCase().includes('medellin')
    );
    
    const tropezFiles = files.filter(f => 
      f.name.toLowerCase().includes('tropez') || 
      f.name.toLowerCase().includes('saint')
    );
    
    console.log('MEDELLIN FILES:');
    medellinFiles.forEach(f => {
      console.log(`  - ${f.name}`);
      console.log(`    URL: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${f.name}`);
    });
    
    console.log('\nST TROPEZ FILES:');
    tropezFiles.forEach(f => {
      console.log(`  - ${f.name}`);
      console.log(`    URL: https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${f.name}`);
    });
    
    // Now update the database with the EXACT filenames
    if (medellinFiles.length > 0) {
      const medellinUrl = `https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${medellinFiles[0].name}`;
      
      const { error: medellinError } = await supabase
        .from('towns')
        .update({ image_url_1: medellinUrl })
        .eq('name', 'Medellin');
        
      if (!medellinError) {
        console.log(`\n✅ FIXED MEDELLIN: ${medellinUrl}`);
        
        // Test it
        const response = await fetch(medellinUrl);
        console.log(`   Test: ${response.status} ${response.statusText}`);
      } else {
        console.log('❌ Error updating Medellin:', medellinError);
      }
    }
    
    if (tropezFiles.length > 0) {
      const tropezUrl = `https://axlruvvsjepsulcbqlho.supabase.co/storage/v1/object/public/town-images/${tropezFiles[0].name}`;
      
      const { error: tropezError } = await supabase
        .from('towns')
        .update({ image_url_1: tropezUrl })
        .eq('name', 'Saint-Tropez');
        
      if (!tropezError) {
        console.log(`\n✅ FIXED ST TROPEZ: ${tropezUrl}`);
        
        // Test it
        const response = await fetch(tropezUrl);
        console.log(`   Test: ${response.status} ${response.statusText}`);
      } else {
        console.log('❌ Error updating St Tropez:', tropezError);
      }
    }
    
    console.log('\n🎉 DONE! Both towns should now display images.');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

fixOnceAndForAll();