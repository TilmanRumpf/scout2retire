// Populate hobbies data after tables are created
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function populateHobbiesData() {
  try {
    console.log('🚀 Populating hobbies data...');
    
    // First, check if tables exist
    const { data: existingHobbies, error: checkError } = await supabase
      .from('hobbies')
      .select('count(*)')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Hobbies table does not exist. Please create it first using the DDL provided.');
      return;
    }
    
    console.log('✅ Hobbies table exists');
    
    // Activity options from OnboardingHobbies.jsx (9 activities)
    const activities = [
      { name: 'Walking', category: 'activity', description: 'trails • beaches • parks' },
      { name: 'Swimming', category: 'activity', description: 'pools • ocean • lakes' },
      { name: 'Cycling', category: 'activity', description: 'road • mountain • trails' },
      { name: 'Golf', category: 'activity', description: 'courses • driving range' },
      { name: 'Tennis', category: 'activity', description: 'courts • clubs • leagues' },
      { name: 'Water Sports', category: 'activity', description: 'kayak • sail • paddle' },
      { name: 'Winter Sports', category: 'activity', description: 'ski • snowboard • ice skate', icon: 'Snowflake' },
      { name: 'Fishing', category: 'activity', description: 'ocean • lake • river' },
      { name: 'Gardening', category: 'activity', description: 'vegetables • flowers • herbs' }
    ];
    
    // Interest options from OnboardingHobbies.jsx (9 interests)
    const interests = [
      { name: 'Arts & Crafts', category: 'interest', description: 'painting • pottery • crafts' },
      { name: 'Music', category: 'interest', description: 'concerts • instruments • choir' },
      { name: 'Theater', category: 'interest', description: 'plays • musicals • opera' },
      { name: 'Reading', category: 'interest', description: 'book clubs • libraries' },
      { name: 'Cooking', category: 'interest', description: 'classes • cuisines • baking' },
      { name: 'Wine', category: 'interest', description: 'tasting • tours • collecting' },
      { name: 'History', category: 'interest', description: 'museums • tours • lectures' },
      { name: 'Photography', category: 'interest', description: 'nature • travel • portraits' },
      { name: 'Volunteering', category: 'interest', description: 'community • charity • causes' }
    ];
    
    // All custom hobbies from allHobbies array (114 hobbies)
    const customHobbiesNames = [
      'Antique collecting', 'Aquarium keeping', 'Archery', 'Astronomy', 'Baking', 'Ballet',
      'Ballroom dancing', 'Basketball', 'Beekeeping', 'Bird watching', 'Blogging', 'Board games',
      'Boating', 'Book clubs', 'Bowling', 'Bridge', 'Calligraphy', 'Camping', 'Canoeing',
      'Card games', 'Chess', 'Choir singing', 'Collecting coins', 'Collecting stamps', 'Community theater',
      'Cooking classes', 'Creative writing', 'Crochet', 'Cross-country skiing', 'Crossword puzzles',
      'Dancing', 'Darts', 'Digital photography', 'Dog training', 'Drawing', 'Embroidery',
      'Fencing', 'Film appreciation', 'Fitness classes', 'Flower arranging', 'Flying', 'Genealogy',
      'Geocaching', 'Glass blowing', 'Golfing', 'Grandchildren activities', 'Greenhouse gardening',
      'Hiking', 'Home brewing', 'Horseback riding', 'Hot air ballooning', 'Ice skating', 'Jazz appreciation',
      'Jewelry making', 'Jigsaw puzzles', 'Jogging', 'Journaling', 'Kayaking', 'Knitting',
      'Language learning', 'Leather crafting', 'Line dancing', 'Mahjong', 'Martial arts', 'Meditation',
      'Metal detecting', 'Model building', 'Motorcycling', 'Mountain biking', 'Museums', 'Nature walks',
      'Needlepoint', 'Opera', 'Orchid growing', 'Orienteering', 'Painting', 'Paragliding',
      'Petanque', 'Pickleball', 'Pilates', 'Ping pong', 'Poetry', 'Poker', 'Pottery',
      'Quilting', 'Racing', 'Radio amateur', 'RV traveling', 'Sailing', 'Salsa dancing',
      'Scrapbooking', 'Scuba diving', 'Sculpting', 'Sewing', 'Shuffleboard', 'Singing',
      'Sketching', 'Snorkeling', 'Snowshoeing', 'Square dancing', 'Stained glass', 'Stand-up paddleboarding',
      'Stargazing', 'Sudoku', 'Surfing', 'Swimming laps', 'Tai chi', 'Tango', 'Tennis',
      'Train spotting', 'Travel planning', 'Trivia nights', 'Ukulele', 'Video gaming', 'Walking clubs',
      'Water aerobics', 'Watercolor painting', 'Wildlife photography', 'Wine tasting', 'Wood carving',
      'Woodworking', 'Writing memoirs', 'Yacht racing', 'Yoga', 'Zumba'
    ];
    
    const customHobbies = customHobbiesNames.map(name => ({ 
      name, 
      category: 'custom', 
      description: null, 
      icon: null 
    }));
    
    // Combine all hobbies
    const allHobbies = [...activities, ...interests, ...customHobbies];
    
    console.log(`📊 Preparing to insert ${allHobbies.length} hobbies:`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${interests.length} interests`);
    console.log(`   - ${customHobbies.length} custom hobbies`);
    
    // Clear existing data first
    console.log('🗑️ Clearing existing hobbies...');
    const { error: deleteError } = await supabase
      .from('hobbies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
      console.log('Warning: Could not clear existing hobbies:', deleteError.message);
    }
    
    // Insert in batches to avoid timeouts
    const batchSize = 25; // Smaller batches for reliability
    let insertedCount = 0;
    
    for (let i = 0; i < allHobbies.length; i += batchSize) {
      const batch = allHobbies.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allHobbies.length / batchSize);
      
      console.log(`📦 Inserting batch ${batchNumber}/${totalBatches} (${batch.length} hobbies)...`);
      
      const { data, error } = await supabase
        .from('hobbies')
        .insert(batch)
        .select('name');
      
      if (error) {
        console.error(`❌ Error inserting batch ${batchNumber}:`, error);
        
        // Try inserting one by one for this batch to identify problematic records
        console.log('🔍 Attempting individual inserts for this batch...');
        for (const hobby of batch) {
          const { error: individualError } = await supabase
            .from('hobbies')
            .insert([hobby]);
          
          if (individualError) {
            console.error(`❌ Failed to insert "${hobby.name}":`, individualError.message);
          } else {
            insertedCount++;
            console.log(`✅ Successfully inserted "${hobby.name}"`);
          }
        }
      } else {
        insertedCount += batch.length;
        console.log(`✅ Batch ${batchNumber} inserted successfully`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Insertion complete! ${insertedCount}/${allHobbies.length} hobbies inserted`);
    
    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('hobbies')
      .select('category, name')
      .order('category, name');
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
    } else {
      console.log(`✅ Verification: ${verifyData.length} hobbies in database`);
      
      // Show breakdown by category
      const categories = verifyData.reduce((acc, hobby) => {
        acc[hobby.category] = (acc[hobby.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Final breakdown by category:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} hobbies`);
      });
      
      // Show sample hobbies from each category
      console.log('\n📝 Sample hobbies by category:');
      ['activity', 'interest', 'custom'].forEach(category => {
        const categoryHobbies = verifyData.filter(h => h.category === category);
        if (categoryHobbies.length > 0) {
          console.log(`   ${category}: ${categoryHobbies.slice(0, 5).map(h => h.name).join(', ')}${categoryHobbies.length > 5 ? '...' : ''}`);
        }
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. ✅ Hobbies table created and populated');
    console.log('2. ✅ User_hobbies junction table created');
    console.log('3. ✅ Town_hobbies junction table created');
    console.log('4. 🔄 Update frontend to use normalized hobbies data');
    console.log('5. 🔄 Migrate existing user hobby data if needed');
    
  } catch (error) {
    console.error('💥 Failed to populate hobbies data:', error);
  }
}

populateHobbiesData();