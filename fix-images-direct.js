import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Direct PostgreSQL connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.axlruvvsjepsulcbqlho:qUest2024Scout$@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
});

async function fixImages() {
  try {
    await client.connect();
    console.log('Connected to Supabase directly\n');
    
    // Fix the double slashes
    const result = await client.query(`
      UPDATE towns 
      SET image_url_1 = REPLACE(image_url_1, 'town-images//', 'town-images/')
      WHERE image_url_1 LIKE '%town-images//%'
      RETURNING name, country, image_url_1
    `);
    
    console.log(`Fixed ${result.rowCount} towns:`);
    result.rows.forEach(row => {
      console.log(`✅ ${row.name}, ${row.country}`);
      console.log(`   New URL: ${row.image_url_1}\n`);
    });
    
    await client.end();
    console.log('Done! St Tropez images should work now.');
    
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

fixImages();