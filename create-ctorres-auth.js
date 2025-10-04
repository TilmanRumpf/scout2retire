import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createCtorresAuth() {
  console.log('🔐 Creating Supabase Auth account for ctorres@asshole.com\n');

  // Check if ctorres exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, username')
    .eq('email', 'ctorres@asshole.com')
    .single();

  if (!existingUser) {
    console.log('❌ ctorres not found in users table!');
    return;
  }

  console.log('✅ Found ctorres in users table:', existingUser.id);
  console.log('');

  // Create auth user with admin API
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'ctorres@asshole.com',
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      username: existingUser.username || 'ctorres'
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('✅ Auth user already exists!');

      // Get existing auth user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find(u => u.email === 'ctorres@asshole.com');

      if (existing) {
        console.log('Auth user ID:', existing.id);
        console.log('Users table ID:', existingUser.id);

        if (existing.id !== existingUser.id) {
          console.log('\n⚠️  WARNING: Auth ID and Users table ID DO NOT MATCH!');
          console.log('This will cause problems. Need to update users table.');

          // Update users table to match auth ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: existing.id })
            .eq('email', 'ctorres@asshole.com');

          if (updateError) {
            console.log('❌ Failed to update users table:', updateError.message);
          } else {
            console.log('✅ Updated users table ID to match auth ID');
          }
        } else {
          console.log('✅ IDs match - everything is correct!');
        }
      }
    } else {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }
  } else {
    console.log('✅ Created auth user!');
    console.log('Auth user ID:', authUser.user.id);
    console.log('Users table ID:', existingUser.id);

    if (authUser.user.id !== existingUser.id) {
      console.log('\n⚠️  IDs DO NOT MATCH - updating users table...');

      const { error: updateError } = await supabase
        .from('users')
        .update({ id: authUser.user.id })
        .eq('email', 'ctorres@asshole.com');

      if (updateError) {
        console.log('❌ Failed to update:', updateError.message);
      } else {
        console.log('✅ Updated users table ID to match auth ID');
      }
    }
  }

  console.log('\n✅ ctorres@asshole.com is now ready to use!');
  console.log('Password: TestPassword123!');
}

createCtorresAuth().catch(console.error);
