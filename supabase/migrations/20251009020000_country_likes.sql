-- Migration: Create country_likes table for liking countries (similar to town favorites)
-- Date: 2025-10-09
-- Purpose: Allow users to "like" countries with heart icon (grey → red when clicked)

-- Create country_likes table
CREATE TABLE IF NOT EXISTS public.country_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure a user can only like a country once
  UNIQUE(user_id, country_name)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_country_likes_user_id ON public.country_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_country_likes_country_name ON public.country_likes(country_name);

-- Enable RLS
ALTER TABLE public.country_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own likes
CREATE POLICY "Users can view their own country likes"
  ON public.country_likes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own likes
CREATE POLICY "Users can create their own country likes"
  ON public.country_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can delete their own country likes"
  ON public.country_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.country_likes IS 'Country likes - users can like countries with heart icon (similar to town favorites)';
