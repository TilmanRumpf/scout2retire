-- =============================================================================
-- FIX: get_user_limits function and chat_threads access
-- =============================================================================
-- Problem 1: get_user_limits references non-existent column 'is_unlimited'
-- Problem 2: chat_threads query fails with 500 error
-- Date: 2025-11-05
-- =============================================================================

BEGIN;

-- =============================================================================
-- FIX 1: get_user_limits - Remove reference to non-existent is_unlimited column
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_user_limits CASCADE;

CREATE FUNCTION public.get_user_limits(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  feature_key TEXT,
  limit_value INT,
  is_unlimited BOOLEAN,
  category_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    cl.feature_id as feature_key,
    cl.limit_value,
    -- Determine unlimited based on limit_value being null or -1
    (cl.limit_value IS NULL OR cl.limit_value = -1) as is_unlimited,
    uc.display_name as category_name
  FROM public.users u
  JOIN public.user_categories uc ON u.category_id = uc.id
  JOIN public.category_limits cl ON cl.category_id = uc.id
  WHERE u.id = v_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_limits TO authenticated;

-- =============================================================================
-- FIX 2: Ensure chat_threads table and relationships exist
-- =============================================================================

-- Create chat_threads table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  town_id UUID REFERENCES public.towns(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON public.chat_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_created_at ON public.chat_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- =============================================================================
-- FIX 3: Set up RLS policies for chat tables
-- =============================================================================

-- Enable RLS on chat_threads
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can create their own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can update their own threads" ON public.chat_threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON public.chat_threads;

-- Create RLS policies for chat_threads
CREATE POLICY "Users can view their own threads"
  ON public.chat_threads
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own threads"
  ON public.chat_threads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own threads"
  ON public.chat_threads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own threads"
  ON public.chat_threads
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view messages in their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their threads" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view messages in their threads"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their threads"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
      AND chat_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- FIX 4: Grant permissions
-- =============================================================================

-- Grant permissions on chat_threads
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_threads_id_seq TO authenticated;

-- Grant permissions on chat_messages
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_messages_id_seq TO authenticated;

COMMIT;

-- =============================================================================
-- Verification queries (run these after migration)
-- =============================================================================

-- Check if function works now:
-- SELECT * FROM get_user_limits();

-- Check if chat_threads query works:
-- SELECT id FROM chat_threads LIMIT 1;

-- Check chat_messages join:
-- SELECT
--   t.id,
--   t.title,
--   m.content
-- FROM chat_threads t
-- LEFT JOIN chat_messages m ON m.thread_id = t.id
-- LIMIT 5;