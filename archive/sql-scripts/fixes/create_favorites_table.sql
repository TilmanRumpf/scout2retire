-- Create favorites table if it doesn't exist
-- This table stores user's favorite towns

CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    town_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only favorite a town once
    UNIQUE(user_id, town_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_town_id ON favorites(town_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON favorites;

-- Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" 
ON favorites 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only add favorites for themselves
CREATE POLICY "Users can insert their own favorites" 
ON favorites 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" 
ON favorites 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Users cannot update favorites (they can only add or remove)
-- No UPDATE policy needed

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;
GRANT USAGE ON SEQUENCE favorites_id_seq TO authenticated;