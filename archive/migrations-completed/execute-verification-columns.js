#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;

async function addColumns() {
  const client = new Client({
    connectionString: 'postgresql://postgres.axlruvvsjepsulcbqlho:TrRb!39y_yH@ZF@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Add columns one by one
    const columns = [
      { name: 'verification_method', type: 'TEXT' },
      { name: 'verification_query', type: 'TEXT' },
      { name: 'verification_notes', type: 'TEXT' }
    ];
    
    for (const col of columns) {
      try {
        await client.query(`ALTER TABLE hobbies ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ️ Column ${col.name} already exists`);
        } else {
          console.error(`❌ Error adding ${col.name}:`, err.message);
        }
      }
    }
    
    // Verify columns
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hobbies' 
      AND column_name IN ('verification_method', 'verification_query', 'verification_notes')
    `);
    
    console.log('\n✅ Verification columns found:', result.rows.map(r => r.column_name));
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
  }
}

addColumns();