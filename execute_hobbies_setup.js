// Execute hobbies table setup directly in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://axlruvvsjepsulcbqlho.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bHJ1dnZzamVwc3VsY2JxbGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcwNjM0NSwiZXhwIjoyMDY0MjgyMzQ1fQ.cdsyW8_ithcO3WZ4iEs9RsdrzefoaD4v_xhb9TXpCz8'
);

async function setupHobbiesTables() {
  try {
    console.log('🚀 Setting up hobbies tables...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./create_hobbies_tables.sql', 'utf8');
    
    // Split into individual statements (basic split on ';' followed by newline)
    const statements = sql.split(';\n\n').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement || statement.startsWith('--')) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`Statement preview: ${statement.substring(0, 100)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement 
      });
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error);
        throw error;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('🎉 All hobbies tables created successfully!');
    
    // Verify the data was inserted
    const { data: hobbies, error: hobbiesError } = await supabase
      .from('hobbies')
      .select('*');
    
    if (hobbiesError) {
      console.error('❌ Error verifying hobbies:', hobbiesError);
    } else {
      console.log(`✅ Verification: ${hobbies.length} hobbies inserted`);
      
      // Show breakdown by category
      const categories = hobbies.reduce((acc, hobby) => {
        acc[hobby.category] = (acc[hobby.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Hobbies by category:', categories);
    }
    
  } catch (error) {
    console.error('💥 Failed to setup hobbies tables:', error);
    process.exit(1);
  }
}

// Alternative approach: Execute statement by statement using direct SQL
async function setupHobbiesTablesAlternative() {
  try {
    console.log('🚀 Setting up hobbies tables (alternative approach)...');
    
    // 1. Drop existing tables
    console.log('🗑️ Dropping existing tables...');
    await supabase.from('town_hobbies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_hobbies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hobbies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // 2. Insert hobbies data directly using the client
    console.log('📝 Inserting hobbies data...');
    
    // Activity options
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
    
    // Interest options
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
    
    // All custom hobbies (114 hobbies from the allHobbies array)
    const customHobbies = [
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
    ].map(name => ({ name, category: 'custom' }));
    
    // Combine all hobbies
    const allHobbies = [...activities, ...interests, ...customHobbies];
    
    console.log(`📊 Inserting ${allHobbies.length} hobbies...`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${interests.length} interests`);
    console.log(`   - ${customHobbies.length} custom hobbies`);
    
    // Insert in batches to avoid timeouts
    const batchSize = 50;
    for (let i = 0; i < allHobbies.length; i += batchSize) {
      const batch = allHobbies.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allHobbies.length/batchSize)}...`);
      
      const { error } = await supabase
        .from('hobbies')
        .insert(batch);
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }
    }
    
    console.log('✅ All hobbies inserted successfully!');
    
    // Verify the data
    const { data: hobbies, error: hobbiesError } = await supabase
      .from('hobbies')
      .select('*');
    
    if (hobbiesError) {
      console.error('❌ Error verifying hobbies:', hobbiesError);
    } else {
      console.log(`✅ Verification: ${hobbies.length} hobbies inserted`);
      
      // Show breakdown by category
      const categories = hobbies.reduce((acc, hobby) => {
        acc[hobby.category] = (acc[hobby.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Hobbies by category:', categories);
      
      // Show some sample hobbies
      console.log('\n📝 Sample hobbies:');
      ['activity', 'interest', 'custom'].forEach(category => {
        const categoryHobbies = hobbies.filter(h => h.category === category);
        console.log(`   ${category}: ${categoryHobbies.slice(0, 3).map(h => h.name).join(', ')}...`);
      });
    }
    
  } catch (error) {
    console.error('💥 Failed to setup hobbies tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupHobbiesTablesAlternative();