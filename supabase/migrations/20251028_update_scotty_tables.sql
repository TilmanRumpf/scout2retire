-- =====================================================
-- UPDATE EXISTING SCOTTY TABLES TO LEAN IMPLEMENTATION
-- Created: October 28, 2025
-- Purpose: Align existing Scotty tables with lean design
-- =====================================================

-- =====================================================
-- 1. UPDATE SCOTTY CONVERSATIONS TABLE
-- =====================================================

-- Add missing columns
ALTER TABLE scotty_conversations
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS topic_category TEXT,
  ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Update existing data
-- NOTE: updated_at column may not exist if already dropped, so use created_at as fallback
UPDATE scotty_conversations
SET
  started_at = COALESCE(started_at, created_at, NOW()),
  last_message_at = COALESCE(last_message_at, created_at, NOW())
WHERE started_at IS NULL OR last_message_at IS NULL;

-- Update topic_category separately since conversation_topic may not exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scotty_conversations' AND column_name = 'conversation_topic'
  ) THEN
    UPDATE scotty_conversations
    SET topic_category = conversation_topic
    WHERE topic_category IS NULL;
  END IF;
END $$;

-- Drop old columns we don't need
ALTER TABLE scotty_conversations
  DROP COLUMN IF EXISTS user_citizenship,
  DROP COLUMN IF EXISTS conversation_topic,
  DROP COLUMN IF EXISTS updated_at;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_scotty_conversations_user
  ON scotty_conversations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_scotty_conversations_date
  ON scotty_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_scotty_conversations_town
  ON scotty_conversations(town_id) WHERE town_id IS NOT NULL;

-- =====================================================
-- 2. UPDATE SCOTTY MESSAGES TABLE
-- =====================================================

-- Add new columns and rename existing ones
ALTER TABLE scotty_messages
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS mentioned_town_ids UUID[],
  ADD COLUMN IF NOT EXISTS detected_topics TEXT[];

-- Migrate data from old columns (only if they exist)
DO $$
BEGIN
  -- Migrate role from message_type if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scotty_messages' AND column_name = 'message_type'
  ) THEN
    UPDATE scotty_messages
    SET role = CASE
      WHEN message_type = 'user' THEN 'user'
      WHEN message_type = 'scotty' THEN 'assistant'
      ELSE message_type
    END
    WHERE role IS NULL;
  END IF;

  -- Migrate detected_topics from topics if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scotty_messages' AND column_name = 'topics'
  ) THEN
    UPDATE scotty_messages
    SET detected_topics = topics
    WHERE detected_topics IS NULL;
  END IF;
END $$;

-- Add check constraint for role (idempotent)
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE scotty_messages DROP CONSTRAINT IF EXISTS scotty_messages_message_type_check;

  -- Add new constraint only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'scotty_messages_role_check'
    AND table_name = 'scotty_messages'
  ) THEN
    ALTER TABLE scotty_messages
      ADD CONSTRAINT scotty_messages_role_check CHECK (role IN ('user', 'assistant'));
  END IF;
END $$;

-- Drop old columns
ALTER TABLE scotty_messages
  DROP COLUMN IF EXISTS message_type,
  DROP COLUMN IF EXISTS contains_town_request,
  DROP COLUMN IF EXISTS mentioned_towns,
  DROP COLUMN IF EXISTS topics;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_scotty_messages_conversation
  ON scotty_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_scotty_messages_towns
  ON scotty_messages USING GIN(mentioned_town_ids)
  WHERE mentioned_town_ids IS NOT NULL AND array_length(mentioned_town_ids, 1) > 0;

-- =====================================================
-- 3. ENABLE RLS IF NOT ALREADY ENABLED
-- =====================================================

ALTER TABLE scotty_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scotty_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate with consistent naming
DROP POLICY IF EXISTS "Users can view own conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users view own scotty conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users create own scotty conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users update own scotty conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Users delete own scotty conversations" ON scotty_conversations;

CREATE POLICY "Users view own scotty conversations"
  ON scotty_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own scotty conversations"
  ON scotty_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own scotty conversations"
  ON scotty_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own scotty conversations"
  ON scotty_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Message policies
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON scotty_messages;
DROP POLICY IF EXISTS "Users can insert messages to own conversations" ON scotty_messages;
DROP POLICY IF EXISTS "Users view messages in own conversations" ON scotty_messages;
DROP POLICY IF EXISTS "Users create messages in own conversations" ON scotty_messages;

CREATE POLICY "Users view messages in own conversations"
  ON scotty_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM scotty_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users create messages in own conversations"
  ON scotty_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM scotty_conversations WHERE user_id = auth.uid()
    )
  );

-- Admin policies
DROP POLICY IF EXISTS "Admins view all scotty conversations" ON scotty_conversations;
DROP POLICY IF EXISTS "Admins view all scotty messages" ON scotty_messages;
DROP POLICY IF EXISTS "Admins view all scotty conversations" ON scotty_conversations CASCADE;
DROP POLICY IF EXISTS "Admins view all scotty messages" ON scotty_messages CASCADE;

CREATE POLICY "Admins view all scotty conversations"
  ON scotty_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND admin_role IN ('admin', 'executive_admin', 'auditor')
    )
  );

CREATE POLICY "Admins view all scotty messages"
  ON scotty_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND admin_role IN ('admin', 'executive_admin', 'auditor')
    )
  );

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Create or get active conversation
CREATE OR REPLACE FUNCTION get_or_create_scotty_conversation(
  p_title TEXT DEFAULT NULL,
  p_town_id UUID DEFAULT NULL,
  p_town_name TEXT DEFAULT NULL,
  p_town_country TEXT DEFAULT NULL,
  p_topic_category TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_title TEXT;
BEGIN
  -- Generate title if not provided
  v_title := COALESCE(p_title,
    CASE
      WHEN p_town_name IS NOT NULL THEN p_town_name || ' exploration'
      ELSE 'New conversation'
    END
  );

  -- Try to get existing active conversation for this town (if town-specific)
  IF p_town_id IS NOT NULL THEN
    SELECT id INTO v_conversation_id
    FROM scotty_conversations
    WHERE user_id = auth.uid()
      AND town_id = p_town_id
      AND is_active = true
      AND last_message_at > NOW() - INTERVAL '1 hour' -- Reuse recent conversations
    LIMIT 1;
  END IF;

  -- Create new conversation if needed
  IF v_conversation_id IS NULL THEN
    INSERT INTO scotty_conversations (
      user_id,
      title,
      town_id,
      town_name,
      town_country,
      topic_category,
      started_at,
      last_message_at
    )
    VALUES (
      auth.uid(),
      v_title,
      p_town_id,
      p_town_name,
      p_town_country,
      p_topic_category,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Save a message to conversation
CREATE OR REPLACE FUNCTION save_scotty_message(
  p_conversation_id UUID,
  p_role TEXT,
  p_content TEXT,
  p_mentioned_town_ids UUID[] DEFAULT NULL,
  p_detected_topics TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Verify user owns this conversation
  IF NOT EXISTS (
    SELECT 1 FROM scotty_conversations
    WHERE id = p_conversation_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  -- Insert message
  INSERT INTO scotty_messages (
    conversation_id,
    role,
    content,
    mentioned_town_ids,
    detected_topics
  )
  VALUES (
    p_conversation_id,
    p_role,
    p_content,
    p_mentioned_town_ids,
    p_detected_topics
  )
  RETURNING id INTO v_message_id;

  -- Update conversation metadata
  UPDATE scotty_conversations
  SET
    last_message_at = NOW(),
    message_count = message_count + 1
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's recent conversations
CREATE OR REPLACE FUNCTION get_user_scotty_conversations(
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  started_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  town_name TEXT,
  town_country TEXT,
  message_count INTEGER,
  topic_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.title,
    sc.started_at,
    sc.last_message_at,
    sc.town_name,
    sc.town_country,
    sc.message_count,
    sc.topic_category
  FROM scotty_conversations sc
  WHERE sc.user_id = auth.uid()
    AND sc.is_active = true
  ORDER BY sc.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE ANALYTICS VIEWS
-- =====================================================

-- Overall Scotty usage analytics
CREATE OR REPLACE VIEW public.scotty_conversation_analytics AS
SELECT
  DATE_TRUNC('day', started_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_conversations,
  AVG(message_count) as avg_messages_per_conversation,
  COUNT(DISTINCT town_id) as unique_towns_discussed,
  ARRAY_AGG(DISTINCT topic_category) FILTER (WHERE topic_category IS NOT NULL) as topics
FROM scotty_conversations
GROUP BY DATE_TRUNC('day', started_at);

-- Town-specific Scotty analytics
CREATE OR REPLACE VIEW public.scotty_town_analytics AS
SELECT
  t.id as town_id,
  t.town_name as town_name,
  t.country,
  COUNT(DISTINCT sc.id) as conversation_count,
  COUNT(DISTINCT sc.user_id) as unique_users,
  MAX(sc.last_message_at) as last_discussed
FROM towns t
JOIN scotty_conversations sc ON sc.town_id = t.id
GROUP BY t.id, t.town_name, t.country;

-- Grant permissions
GRANT SELECT ON public.scotty_conversation_analytics TO authenticated;
GRANT SELECT ON public.scotty_town_analytics TO authenticated;

-- =====================================================
-- 6. UPDATE INTEGRATION WITH PAYWALL
-- =====================================================

-- Update the existing record_scotty_chat function to also create conversation
CREATE OR REPLACE FUNCTION record_scotty_chat(
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
  v_month_year TEXT;
  v_conversation_id UUID;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');

  -- Record in usage tracking (existing paywall system)
  INSERT INTO scotty_chat_usage (user_id, month_year, metadata)
  VALUES (auth.uid(), v_month_year, p_metadata)
  RETURNING id INTO v_chat_id;

  -- Also create/get conversation if town_id provided
  IF p_metadata->>'town_id' IS NOT NULL THEN
    v_conversation_id := get_or_create_scotty_conversation(
      p_title := p_metadata->>'title',
      p_town_id := (p_metadata->>'town_id')::UUID,
      p_town_name := p_metadata->>'town_name',
      p_town_country := p_metadata->>'town_country',
      p_topic_category := p_metadata->>'topic'
    );

    -- Update the usage record with conversation_id
    UPDATE scotty_chat_usage
    SET metadata = metadata || jsonb_build_object('conversation_id', v_conversation_id)
    WHERE id = v_chat_id;
  END IF;

  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Scotty tables updated to lean implementation';
  RAISE NOTICE '📊 Tables aligned: scotty_conversations, scotty_messages';
  RAISE NOTICE '🔒 RLS policies updated for security';
  RAISE NOTICE '🎯 Helper functions created';
  RAISE NOTICE '📈 Analytics views created';
END $$;