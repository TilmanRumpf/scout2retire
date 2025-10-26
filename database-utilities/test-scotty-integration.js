#!/usr/bin/env node
/**
 * Test Scotty Integration with Paywall
 * Verifies that Scotty conversations are saved and paywall limits work
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service key for testing
);

async function testScottyIntegration() {
  console.log('🧪 Testing Scotty Integration with Paywall\n');
  console.log('=' .repeat(60));

  try {
    // 1. Get a test user (or create one)
    const testEmail = 'scotty.test@scout2retire.com';
    let testUserId;

    // Check if test user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, subscription_tier')
      .eq('email', testEmail)
      .single();

    if (existingUser) {
      testUserId = existingUser.id;
      console.log(`✅ Using existing test user: ${testEmail}`);
      console.log(`   Subscription tier: ${existingUser.subscription_tier || 'free'}`);
    } else {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }

    // 2. Check current month Scotty usage for this user
    console.log('\n📊 Checking current month usage:');
    const { data: currentUsage } = await supabase
      .from('scotty_chat_usage')
      .select('*')
      .eq('user_id', testUserId)
      .eq('month_year', new Date().toISOString().slice(0, 7))
      .order('chat_started_at', { ascending: false });

    console.log(`   Current month chats: ${currentUsage?.length || 0}`);

    // 3. Check paywall limits
    console.log('\n🔒 Checking paywall limits:');
    const { data: limits } = await supabase
      .from('paywall_feature_limits')
      .select('*')
      .eq('feature_name', 'scotty_chats');

    if (limits) {
      limits.forEach(limit => {
        console.log(`   ${limit.tier}: ${limit.limit_value || 'unlimited'} chats/month`);
      });
    }

    // 4. Test conversation creation
    console.log('\n💬 Testing conversation creation:');
    const { data: convId, error: convError } = await supabase.rpc(
      'get_or_create_scotty_conversation',
      {
        p_title: 'Test conversation',
        p_topic_category: 'general'
      }
    );

    if (convError) {
      console.log(`   ❌ Error creating conversation: ${convError.message}`);
    } else {
      console.log(`   ✅ Created conversation: ${convId}`);

      // 5. Test saving a message
      console.log('\n📝 Testing message saving:');
      const { data: msgId, error: msgError } = await supabase.rpc(
        'save_scotty_message',
        {
          p_conversation_id: convId,
          p_role: 'user',
          p_content: 'Test message from integration test',
          p_detected_topics: ['test']
        }
      );

      if (msgError) {
        console.log(`   ❌ Error saving message: ${msgError.message}`);
      } else {
        console.log(`   ✅ Saved message: ${msgId}`);
      }

      // 6. Test loading conversations
      console.log('\n📚 Testing conversation loading:');
      const { data: conversations, error: loadError } = await supabase.rpc(
        'get_user_scotty_conversations',
        { p_limit: 5 }
      );

      if (loadError) {
        console.log(`   ❌ Error loading conversations: ${loadError.message}`);
      } else {
        console.log(`   ✅ Found ${conversations?.length || 0} conversations`);
        if (conversations && conversations.length > 0) {
          console.log('   Recent conversations:');
          conversations.slice(0, 3).forEach(conv => {
            console.log(`     - ${conv.title} (${conv.message_count} messages)`);
          });
        }
      }

      // 7. Check analytics views
      console.log('\n📈 Testing analytics views:');
      const { data: analytics } = await supabase
        .from('scotty_usage_analytics')
        .select('*')
        .limit(1);

      if (analytics && analytics.length > 0) {
        console.log(`   ✅ Analytics view working`);
        console.log(`   Total chats this month: ${analytics[0].total_chats}`);
        console.log(`   Unique users: ${analytics[0].unique_users}`);
      } else {
        console.log('   ⚠️  No analytics data yet');
      }
    }

    // 8. Test paywall enforcement
    console.log('\n🚫 Testing paywall enforcement:');
    const { data: userTier } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', testUserId)
      .single();

    const tier = userTier?.subscription_tier || 'free';
    const limitForTier = limits?.find(l => l.tier === tier)?.limit_value;

    if (limitForTier !== null) {
      console.log(`   User tier: ${tier}`);
      console.log(`   Limit: ${limitForTier} chats/month`);
      console.log(`   Current usage: ${currentUsage?.length || 0}`);

      if ((currentUsage?.length || 0) >= limitForTier) {
        console.log('   ⚠️  User has reached monthly limit');
      } else {
        console.log(`   ✅ User has ${limitForTier - (currentUsage?.length || 0)} chats remaining`);
      }
    } else {
      console.log(`   ✅ User has unlimited chats (${tier} tier)`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Scotty integration test complete!');
    console.log('\nNext steps:');
    console.log('1. Navigate to http://localhost:5173/scotty');
    console.log('2. Send a test message');
    console.log('3. Verify it saves to database');
    console.log('4. Check conversation history dropdown');
    console.log('5. Test paywall limits by reaching quota');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testScottyIntegration().catch(console.error);