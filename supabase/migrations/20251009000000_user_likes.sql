-- Migration: Create user_likes table for one-way "likes" (different from mutual friendships)
-- Date: 2025-10-09
-- Purpose: Allow users to "like" other members without requiring mutual acceptance

-- Create user_likes table
CREATE TABLE IF NOT EXISTS public.user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure a user can only like another user once
  UNIQUE(user_id, liked_user_id),

  -- Prevent self-likes
  CHECK (user_id != liked_user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON public.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_liked_user_id ON public.user_likes(liked_user_id);

-- Enable RLS
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own likes
CREATE POLICY "Users can view their own likes"
  ON public.user_likes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view who liked them
CREATE POLICY "Users can view who liked them"
  ON public.user_likes
  FOR SELECT
  USING (auth.uid() = liked_user_id);

-- Users can create their own likes
CREATE POLICY "Users can create their own likes"
  ON public.user_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can delete their own likes"
  ON public.user_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.user_likes IS 'One-way likes - different from mutual friendships in user_connections. Users can like members without requiring acceptance.';
