-- Only run if onboarding_responses table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'onboarding_responses') THEN
        -- Enable RLS
        ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Users can view own onboarding responses" ON onboarding_responses;
        DROP POLICY IF EXISTS "Users can insert own onboarding responses" ON onboarding_responses;
        DROP POLICY IF EXISTS "Users can update own onboarding responses" ON onboarding_responses;
        
        -- Create proper policies
        CREATE POLICY "Users can view own onboarding responses" 
        ON onboarding_responses 
        FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own onboarding responses" 
        ON onboarding_responses 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own onboarding responses" 
        ON onboarding_responses 
        FOR UPDATE 
        USING (auth.uid() = user_id);
        
        RAISE NOTICE 'RLS policies for onboarding_responses have been fixed';
    ELSE
        RAISE NOTICE 'onboarding_responses table does not exist - skipping RLS setup';
    END IF;
END $$;