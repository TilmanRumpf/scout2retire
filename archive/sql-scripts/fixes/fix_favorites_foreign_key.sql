-- IMPORTANT: Run check_favorites_table_structure.sql first to understand the current state

-- Option 1: If favorites table references public.users but should reference auth.users
-- This is the most common issue with Supabase applications

-- First, check if we need to drop the existing constraint
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- Add the correct foreign key constraint to auth.users
ALTER TABLE favorites
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Option 2: If you have a public.users table that should be synced with auth.users
-- (Only use this if you have a public.users table for profile data)

-- Create or update the public.users table to sync with auth.users
-- CREATE TABLE IF NOT EXISTS public.users (
--     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     email TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Add RLS policies for favorites table
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own favorites
CREATE POLICY "Users can insert their own favorites" 
ON favorites 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to view their own favorites
CREATE POLICY "Users can view their own favorites" 
ON favorites 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy to allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites" 
ON favorites 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Verify the fix
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema || '.' || ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'favorites';