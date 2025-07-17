-- Create table for storing Scotty AI conversations
CREATE TABLE IF NOT EXISTS scotty_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  town_id UUID REFERENCES towns(id),
  town_name TEXT,
  town_country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata for analytics
  user_citizenship TEXT, -- Store for quick analysis
  conversation_topic TEXT, -- e.g., 'town_research', 'visa_questions', 'healthcare'
  
  -- Indexes for performance
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create table for individual messages
CREATE TABLE IF NOT EXISTS scotty_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES scotty_conversations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'scotty')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Analytics fields
  contains_town_request BOOLEAN DEFAULT false,
  mentioned_towns TEXT[], -- Array of town names mentioned
  topics TEXT[], -- Array of topics discussed
  
  -- Indexes
  CONSTRAINT fk_conversation_id FOREIGN KEY (conversation_id) REFERENCES scotty_conversations(id)
);

-- Indexes for performance
CREATE INDEX idx_scotty_conversations_user_id ON scotty_conversations(user_id);
CREATE INDEX idx_scotty_conversations_created_at ON scotty_conversations(created_at DESC);
CREATE INDEX idx_scotty_messages_conversation_id ON scotty_messages(conversation_id);
CREATE INDEX idx_scotty_messages_created_at ON scotty_messages(created_at);

-- Indexes for analytics
CREATE INDEX idx_scotty_messages_topics ON scotty_messages USING GIN(topics);
CREATE INDEX idx_scotty_messages_mentioned_towns ON scotty_messages USING GIN(mentioned_towns);

-- RLS Policies
ALTER TABLE scotty_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scotty_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON scotty_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON scotty_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON scotty_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON scotty_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see messages from their conversations
CREATE POLICY "Users can view messages from own conversations" ON scotty_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM scotty_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON scotty_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM scotty_conversations WHERE user_id = auth.uid()
    )
  );

-- Analytics view for admin insights (without exposing user data)
CREATE OR REPLACE VIEW scotty_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT conversation_id) as total_conversations,
  COUNT(*) as total_messages,
  COUNT(CASE WHEN contains_town_request THEN 1 END) as town_requests
FROM (
  SELECT 
    sm.id,
    sm.created_at,
    sm.conversation_id,
    sm.contains_town_request,
    sc.user_id
  FROM scotty_messages sm
  JOIN scotty_conversations sc ON sc.id = sm.conversation_id
) t
GROUP BY DATE_TRUNC('day', created_at);

-- Separate view for mentioned towns analytics
CREATE OR REPLACE VIEW scotty_mentioned_towns AS
SELECT 
  DATE_TRUNC('day', sm.created_at) as date,
  town,
  COUNT(*) as mention_count
FROM scotty_messages sm
CROSS JOIN LATERAL unnest(sm.mentioned_towns) AS town
WHERE sm.mentioned_towns IS NOT NULL
GROUP BY DATE_TRUNC('day', sm.created_at), town;

-- Separate view for topics analytics
CREATE OR REPLACE VIEW scotty_topics AS
SELECT 
  DATE_TRUNC('day', sm.created_at) as date,
  topic,
  COUNT(*) as topic_count
FROM scotty_messages sm
CROSS JOIN LATERAL unnest(sm.topics) AS topic
WHERE sm.topics IS NOT NULL
GROUP BY DATE_TRUNC('day', sm.created_at), topic;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scotty_conversations_updated_at 
  BEFORE UPDATE ON scotty_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample analytics queries for insights
COMMENT ON VIEW scotty_analytics IS 'Analytics view for Scotty conversations. Sample queries:

-- Find most requested towns not in database:
SELECT unnest(mentioned_towns) as town, COUNT(*) 
FROM scotty_messages 
WHERE mentioned_towns && ARRAY[''town_name'']
GROUP BY town 
ORDER BY COUNT(*) DESC;

-- Find common user concerns:
SELECT unnest(topics) as topic, COUNT(*) 
FROM scotty_messages 
WHERE topics IS NOT NULL
GROUP BY topic 
ORDER BY COUNT(*) DESC;

-- User engagement metrics:
SELECT 
  DATE_TRUNC(''week'', created_at) as week,
  COUNT(DISTINCT user_id) as active_users,
  AVG(message_count) as avg_messages_per_conversation
FROM (
  SELECT 
    sc.id, 
    sc.user_id, 
    sc.created_at,
    COUNT(sm.id) as message_count
  FROM scotty_conversations sc
  JOIN scotty_messages sm ON sm.conversation_id = sc.id
  GROUP BY sc.id, sc.user_id, sc.created_at
) t
GROUP BY DATE_TRUNC(''week'', created_at);
';