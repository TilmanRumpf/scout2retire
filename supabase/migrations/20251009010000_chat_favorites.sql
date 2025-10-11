-- Migration: Create chat_favorites table for favoriting any chat
-- Date: 2025-10-09
-- Purpose: Allow users to "fave" any chat (friend, group, country lounge, town lounge) for quick access

-- Create chat_favorites table
CREATE TABLE IF NOT EXISTS public.chat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  reference_name TEXT, -- Store country name or town name for easy display
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure a user can only favorite a specific chat once
  UNIQUE(user_id, chat_type, reference_id),

  -- Validate chat_type values
  CHECK (chat_type IN ('friend', 'group', 'country_lounge', 'town_lounge'))
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_favorites_user_id ON public.chat_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_chat_type ON public.chat_favorites(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_favorites_reference_id ON public.chat_favorites(reference_id);

-- Enable RLS
ALTER TABLE public.chat_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.chat_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create their own favorites"
  ON public.chat_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites (unfave)
CREATE POLICY "Users can delete their own favorites"
  ON public.chat_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.chat_favorites IS 'User favorites for any chat type - friends, groups, country lounges, or town lounges. Provides quick access to frequently used chats.';
