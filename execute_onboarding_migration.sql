-- Execute the onboarding data migration
-- This populates all NULL columns with actual user data

-- Step 1: Check current state
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN primary_citizenship IS NOT NULL THEN 1 END) as users_with_citizenship,
  COUNT(CASE WHEN retirement_status IS NOT NULL THEN 1 END) as users_with_status
FROM users
WHERE onboarding_completed = true;

-- Step 2: Migrate all data
DO $$
DECLARE
  rec RECORD;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  FOR rec IN 
    SELECT 
      u.id,
      u.email,
      o.current_status,
      o.region,
      o.climate,
      o.culture,
      o.hobbies,
      o.administration,
      o.budget
    FROM users u
    INNER JOIN onboarding_responses o ON u.id = o.user_id
    WHERE u.onboarding_completed = true
  LOOP
    BEGIN
      UPDATE users 
      SET
        -- Step 1: Current Status
        retirement_status = rec.current_status->>'retirement_status',
        retirement_month = (rec.current_status->'retirement_timeline'->>'target_month')::integer,
        retirement_day = (rec.current_status->'retirement_timeline'->>'target_day')::integer,
        primary_citizenship = rec.current_status->'citizenship'->>'primary_citizenship',
        dual_citizenship = COALESCE((rec.current_status->'citizenship'->>'dual_citizenship')::boolean, false),
        secondary_citizenship = rec.current_status->'citizenship'->>'secondary_citizenship',
        family_situation = rec.current_status->>'family_situation',
        partner_primary_citizenship = rec.current_status->'partner_citizenship'->>'primary_citizenship',
        partner_dual_citizenship = COALESCE((rec.current_status->'partner_citizenship'->>'dual_citizenship')::boolean, false),
        partner_secondary_citizenship = rec.current_status->'partner_citizenship'->>'secondary_citizenship',
        has_pets = COALESCE((rec.current_status->>'has_pets')::boolean, false),
        
        -- Step 2: Region
        preferred_regions = ARRAY(SELECT jsonb_array_elements_text(rec.region->'regions')),
        preferred_countries = ARRAY(SELECT jsonb_array_elements_text(rec.region->'countries')),
        
        -- Step 3: Climate
        summer_temp_preference = rec.climate->>'summer_temp',
        winter_temp_preference = rec.climate->>'winter_temp',
        humidity_preference = rec.climate->>'humidity_level',
        sunshine_preference = rec.climate->>'sunshine_level',
        
        -- Step 7: Budget
        total_budget_usd = (rec.budget->>'total_budget')::integer,
        max_rent_usd = (rec.budget->>'max_rent')::integer,
        max_home_price_usd = (rec.budget->>'max_home_price')::integer,
        healthcare_budget_usd = (rec.budget->>'healthcare_budget')::integer
        
      WHERE id = rec.id;
      
      success_count := success_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE NOTICE 'Error migrating user %: %', rec.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Migration complete. Success: %, Errors: %', success_count, error_count;
END $$;

-- Step 3: Verify migration
SELECT 
  email,
  primary_citizenship,
  retirement_status,
  family_situation,
  summer_temp_preference,
  total_budget_usd
FROM users 
WHERE onboarding_completed = true
ORDER BY created_at DESC
LIMIT 10;